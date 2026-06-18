import { readFileSync, statSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin, ViteDevServer } from "vite";
import { defineConfig } from "vitest/config";
import { parse } from "yaml";
import react from "@vitejs/plugin-react";
import {
  syncDesignTokens,
  syncDesignTokensFromValues,
  syncLandingCopy,
} from "./scripts/sync-sources.mjs";

const BRANDY_SYNC_ROUTE = "/__brandy/sync/design";
const MAX_SYNC_BODY_BYTES = 256 * 1024;
const SOURCE_RELOAD_SUPPRESSION_MS = 5_000;
const DESIGN_SOURCE_PATH = fileURLToPath(
  new URL("./content/design-tokens.yaml", import.meta.url),
);
const COPY_SOURCE_PATH = fileURLToPath(
  new URL("./content/landing-copy.md", import.meta.url),
);
const WATCHED_SOURCE_PATHS = new Map([
  [normalizeWatchedPath(DESIGN_SOURCE_PATH), "design"],
  [normalizeWatchedPath(COPY_SOURCE_PATH), "copy"],
] as const);

type WatchedSourceKind = "design" | "copy";

type SourceReloadSuppression = {
  expiresAt: number;
  pending: boolean;
  signature: string | null;
};

const sourceReloadSuppressions = new Map<string, SourceReloadSuppression>();

export default defineConfig({
  plugins: [react(), brandySourceSyncPlugin()],
  test: {
    environment: "jsdom",
    globals: true,
  },
});

function brandySourceSyncPlugin(): Plugin {
  return {
    name: "brandy-source-sync",
    apply: "serve",
    configureServer(server) {
      server.watcher.add([DESIGN_SOURCE_PATH, COPY_SOURCE_PATH]);
      server.watcher.on("change", (filePath) => {
        void handleWatchedSourceChange(server, filePath);
      });

      server.middlewares.use(BRANDY_SYNC_ROUTE, (request, response, next) => {
        void handleDesignSyncRequest(server, request, response, next);
      });
    },
  };
}

async function handleDesignSyncRequest(
  server: ViteDevServer,
  request: IncomingMessage,
  response: ServerResponse,
  next: () => void,
) {
  if (request.url == null) {
    next();
    return;
  }

  if (request.method !== "POST") {
    writeJson(response, 405, { ok: false, error: "Use POST for design sync." });
    return;
  }

  try {
    const payload = await readJsonBody(request);
    const { reload, values } = getValidatedDesignSyncPayload(payload);
    const result = await syncOverlayDesignTokens(values);

    if (reload) sendFullReload(server);
    writeJson(response, 200, { ok: true, changedCount: result.changedCount });
  } catch (error) {
    const statusCode = error instanceof SyncRequestError ? error.statusCode : 500;
    const message =
      error instanceof Error ? error.message : "Unable to sync design tokens.";
    writeJson(response, statusCode, { ok: false, error: message });
  }
}

function readJsonBody(request: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let rawBody = "";
    let byteLength = 0;

    request.setEncoding("utf8");
    request.on("data", (chunk: string) => {
      byteLength += Buffer.byteLength(chunk);
      if (byteLength > MAX_SYNC_BODY_BYTES) {
        reject(new SyncRequestError(413, "Design sync payload is too large."));
        request.removeAllListeners("data");
        request.resume();
        return;
      }

      rawBody += chunk;
    });
    request.on("end", () => {
      if (!rawBody.trim()) {
        reject(new SyncRequestError(400, "Design sync payload is empty."));
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch {
        reject(new SyncRequestError(400, "Design sync payload is not valid JSON."));
      }
    });
    request.on("error", () => {
      reject(new SyncRequestError(400, "Unable to read design sync payload."));
    });
  });
}

async function syncOverlayDesignTokens(values: Record<string, string>) {
  const finishSuppressingSourceReload =
    beginSuppressingSourceReload(DESIGN_SOURCE_PATH);

  try {
    return await syncDesignTokensFromValues(values);
  } finally {
    finishSuppressingSourceReload();
  }
}

async function handleWatchedSourceChange(
  server: ViteDevServer,
  filePath: string,
) {
  const sourceKind = WATCHED_SOURCE_PATHS.get(normalizeWatchedPath(filePath));
  if (sourceKind == null) return;

  if (shouldSuppressSourceReload(filePath)) return;

  try {
    await syncWatchedSource(sourceKind);
    sendFullReload(server);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to sync source file.";
    server.config.logger.error(`[brandy-source-sync] ${message}`);
  }
}

async function syncWatchedSource(sourceKind: WatchedSourceKind) {
  if (sourceKind === "design") {
    await syncDesignTokens();
    return;
  }

  await syncLandingCopy();
}

function getValidatedDesignSyncPayload(payload: unknown): {
  reload: boolean;
  values: Record<string, string>;
} {
  if (!isObjectRecord(payload) || !isObjectRecord(payload.values)) {
    throw new SyncRequestError(400, "Design sync payload must contain values.");
  }

  if ("reload" in payload && typeof payload.reload !== "boolean") {
    throw new SyncRequestError(400, "Design sync reload flag must be a boolean.");
  }

  const knownTokenNames = loadKnownDesignTokenNames();
  const values: Record<string, string> = {};

  for (const [name, value] of Object.entries(payload.values)) {
    if (!knownTokenNames.has(name)) {
      throw new SyncRequestError(400, `Unknown design token: ${name}`);
    }

    if (typeof value !== "string" || !value.trim()) {
      throw new SyncRequestError(400, `Invalid design token value for ${name}`);
    }

    values[name] = value.trim();
  }

  return { reload: payload.reload === true, values };
}

function writeJson(
  response: ServerResponse,
  statusCode: number,
  payload: Record<string, unknown>,
) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function loadKnownDesignTokenNames(): Set<string> {
  const raw = readFileSync(
    DESIGN_SOURCE_PATH,
    "utf8",
  );
  const parsed = parse(raw) as {
    tokens?: { root?: Record<string, unknown> };
  };

  return new Set(Object.keys(parsed.tokens?.root ?? {}));
}

function sendFullReload(server: ViteDevServer) {
  server.ws.send({ type: "full-reload" });
}

function beginSuppressingSourceReload(filePath: string): () => void {
  const normalizedPath = normalizeWatchedPath(filePath);
  sourceReloadSuppressions.set(normalizedPath, {
    expiresAt: Date.now() + SOURCE_RELOAD_SUPPRESSION_MS,
    pending: true,
    signature: null,
  });

  return () => {
    const suppression = sourceReloadSuppressions.get(normalizedPath);
    if (suppression == null) return;

    sourceReloadSuppressions.set(normalizedPath, {
      expiresAt: Date.now() + SOURCE_RELOAD_SUPPRESSION_MS,
      pending: false,
      signature: readFileSignature(filePath),
    });
  };
}

function shouldSuppressSourceReload(filePath: string): boolean {
  const normalizedPath = normalizeWatchedPath(filePath);
  const suppression = sourceReloadSuppressions.get(normalizedPath);
  if (suppression == null) return false;

  if (suppression.expiresAt < Date.now()) {
    sourceReloadSuppressions.delete(normalizedPath);
    return false;
  }

  if (suppression.pending) return true;

  if (
    suppression.signature != null &&
    suppression.signature === readFileSignature(filePath)
  ) {
    sourceReloadSuppressions.delete(normalizedPath);
    return true;
  }

  sourceReloadSuppressions.delete(normalizedPath);
  return false;
}

function readFileSignature(filePath: string): string | null {
  try {
    const stats = statSync(filePath);
    return `${stats.size}:${stats.mtimeMs}`;
  } catch {
    return null;
  }
}

function normalizeWatchedPath(filePath: string): string {
  return path.resolve(filePath);
}

class SyncRequestError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}
