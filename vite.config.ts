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
    const { brand, brandDerivation, layout, reload, typography, values } =
      getValidatedDesignSyncPayload(payload);
    const result = await syncOverlayDesignTokens(
      values,
      brand,
      brandDerivation,
      layout,
      typography,
    );

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

async function syncOverlayDesignTokens(
  values: Record<string, string>,
  brand?: {
    accent: string;
    highlight: string;
    primary: string;
    secondary: string;
  },
  brandDerivation?: BrandDerivationSyncPayload,
  layout?: LayoutSyncPayload,
  typography?: TypographySyncPayload,
) {
  const finishSuppressingSourceReload =
    beginSuppressingSourceReload(DESIGN_SOURCE_PATH);

  try {
    return await syncDesignTokensFromValues(values, {
      brand,
      brandDerivation,
      layout,
      typography,
    });
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
  brand?: {
    accent: string;
    highlight: string;
    primary: string;
    secondary: string;
  };
  brandDerivation?: BrandDerivationSyncPayload;
  layout?: LayoutSyncPayload;
  reload: boolean;
  typography?: TypographySyncPayload;
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

  return {
    brand: getValidatedBrandPayload(payload.brand),
    brandDerivation: getValidatedBrandDerivationPayload(payload.brandDerivation),
    layout: getValidatedLayoutPayload(payload.layout),
    reload: payload.reload === true,
    typography: getValidatedTypographyPayload(payload.typography),
    values,
  };
}

function getValidatedBrandPayload(value: unknown):
  | {
      accent: string;
      highlight: string;
      primary: string;
      secondary: string;
    }
  | undefined {
  if (value == null) return undefined;
  if (!isObjectRecord(value)) {
    throw new SyncRequestError(400, "Design sync brand seeds must be an object.");
  }

  const allowedKeys = ["accent", "highlight", "primary", "secondary"].sort();
  const keys = Object.keys(value).sort();
  if (keys.join(",") !== allowedKeys.join(",")) {
    throw new SyncRequestError(
      400,
      "Design sync brand seeds must contain primary, secondary, accent, and highlight.",
    );
  }

  const brand = {
    accent: value.accent,
    highlight: value.highlight,
    primary: value.primary,
    secondary: value.secondary,
  };

  for (const [key, seed] of Object.entries(brand)) {
    if (typeof seed !== "string" || !/^#?[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(seed)) {
      throw new SyncRequestError(400, `Invalid brand seed for ${key}.`);
    }
  }

  return brand as {
    accent: string;
    highlight: string;
    primary: string;
    secondary: string;
  };
}

function getValidatedBrandDerivationPayload(
  value: unknown,
): BrandDerivationSyncPayload | undefined {
  if (value == null) return undefined;
  if (!isObjectRecord(value)) {
    throw new SyncRequestError(
      400,
      "Design sync brand derivation controls must be an object.",
    );
  }

  const allowedKeys = [
    "accentMomentDistancePercent",
    "backgroundDistancePercent",
    "borderDistancePercent",
    "buttonPrimaryBgDistancePercent",
    "buttonSecondaryBorderDistancePercent",
    "buttonSecondaryHoverDistancePercent",
    "highlightSoftDistancePercent",
    "linkColorDistancePercent",
    "linkHoverDistancePercent",
    "neutralSurfaceDistancePercent",
    "primaryHoverDistancePercent",
    "readableTextDistancePercent",
    "secondaryTextDistancePercent",
    "secondarySurfaceDistancePercent",
  ].sort();
  const keys = Object.keys(value).sort();
  if (keys.join(",") !== allowedKeys.join(",")) {
    throw new SyncRequestError(
      400,
      "Design sync brand derivation controls must contain the supported distance sliders.",
    );
  }

  return {
    accentMomentDistancePercent: getNumberValue(
      value.accentMomentDistancePercent,
      "accentMomentDistancePercent",
    ),
    backgroundDistancePercent: getNumberValue(
      value.backgroundDistancePercent,
      "backgroundDistancePercent",
    ),
    borderDistancePercent: getNumberValue(
      value.borderDistancePercent,
      "borderDistancePercent",
    ),
    buttonPrimaryBgDistancePercent: getNumberValue(
      value.buttonPrimaryBgDistancePercent,
      "buttonPrimaryBgDistancePercent",
    ),
    buttonSecondaryBorderDistancePercent: getNumberValue(
      value.buttonSecondaryBorderDistancePercent,
      "buttonSecondaryBorderDistancePercent",
    ),
    buttonSecondaryHoverDistancePercent: getNumberValue(
      value.buttonSecondaryHoverDistancePercent,
      "buttonSecondaryHoverDistancePercent",
    ),
    highlightSoftDistancePercent: getNumberValue(
      value.highlightSoftDistancePercent,
      "highlightSoftDistancePercent",
    ),
    linkColorDistancePercent: getNumberValue(
      value.linkColorDistancePercent,
      "linkColorDistancePercent",
    ),
    linkHoverDistancePercent: getNumberValue(
      value.linkHoverDistancePercent,
      "linkHoverDistancePercent",
    ),
    neutralSurfaceDistancePercent: getNumberValue(
      value.neutralSurfaceDistancePercent,
      "neutralSurfaceDistancePercent",
    ),
    primaryHoverDistancePercent: getNumberValue(
      value.primaryHoverDistancePercent,
      "primaryHoverDistancePercent",
    ),
    readableTextDistancePercent: getNumberValue(
      value.readableTextDistancePercent,
      "readableTextDistancePercent",
    ),
    secondaryTextDistancePercent: getNumberValue(
      value.secondaryTextDistancePercent,
      "secondaryTextDistancePercent",
    ),
    secondarySurfaceDistancePercent: getNumberValue(
      value.secondarySurfaceDistancePercent,
      "secondarySurfaceDistancePercent",
    ),
  };
}

type LayoutSyncPayload = {
  gridDensity: "sparse" | "balanced" | "dense";
  heroBalance: number;
  heroScale: "compact" | "balanced" | "immersive";
  pageGutter: number;
  radius: number;
  spacing: number;
  textWidth: number;
  width: "narrow" | "standard" | "wide" | "full";
};

type BrandDerivationSyncPayload = {
  accentMomentDistancePercent: number;
  backgroundDistancePercent: number;
  borderDistancePercent: number;
  buttonPrimaryBgDistancePercent: number;
  buttonSecondaryBorderDistancePercent: number;
  buttonSecondaryHoverDistancePercent: number;
  highlightSoftDistancePercent: number;
  linkColorDistancePercent: number;
  linkHoverDistancePercent: number;
  neutralSurfaceDistancePercent: number;
  primaryHoverDistancePercent: number;
  readableTextDistancePercent: number;
  secondaryTextDistancePercent: number;
  secondarySurfaceDistancePercent: number;
};

type TypographySyncPayload = {
  density: number;
  headlineStyle: number;
  pairing:
    | "single_family"
    | "display_plus_text"
    | "editorial_contrast"
    | "mono_accent";
  scale: number;
  style:
    | "geometric"
    | "grotesk"
    | "humanist"
    | "editorial"
    | "mono_tech"
    | "playful"
    | "luxury";
  tightness: number;
  weight: number;
};

function getValidatedLayoutPayload(value: unknown): LayoutSyncPayload | undefined {
  if (value == null) return undefined;
  if (!isObjectRecord(value)) {
    throw new SyncRequestError(400, "Design sync layout seeds must be an object.");
  }

  const allowedKeys = [
    "gridDensity",
    "heroBalance",
    "heroScale",
    "pageGutter",
    "radius",
    "spacing",
    "textWidth",
    "width",
  ].sort();
  const keys = Object.keys(value).sort();
  if (keys.join(",") !== allowedKeys.join(",")) {
    throw new SyncRequestError(
      400,
      "Design sync layout seeds must contain the supported layout controls.",
    );
  }

  const layout = {
    gridDensity: getStringEnumValue(
      value.gridDensity,
      ["sparse", "balanced", "dense"],
      "gridDensity",
    ),
    heroBalance: getNumberValue(value.heroBalance, "heroBalance"),
    heroScale: getStringEnumValue(
      value.heroScale,
      ["compact", "balanced", "immersive"],
      "heroScale",
    ),
    pageGutter: getNumberValue(value.pageGutter, "pageGutter"),
    radius: getNumberValue(value.radius, "radius"),
    spacing: getNumberValue(value.spacing, "spacing"),
    textWidth: getNumberValue(value.textWidth, "textWidth"),
    width: getStringEnumValue(
      value.width,
      ["narrow", "standard", "wide", "full"],
      "width",
    ),
  };

  return layout as LayoutSyncPayload;
}

function getValidatedTypographyPayload(
  value: unknown,
): TypographySyncPayload | undefined {
  if (value == null) return undefined;
  if (!isObjectRecord(value)) {
    throw new SyncRequestError(
      400,
      "Design sync typography seeds must be an object.",
    );
  }

  const allowedKeys = [
    "density",
    "headlineStyle",
    "pairing",
    "scale",
    "style",
    "tightness",
    "weight",
  ].sort();
  const keys = Object.keys(value).sort();
  if (keys.join(",") !== allowedKeys.join(",")) {
    throw new SyncRequestError(
      400,
      "Design sync typography seeds must contain the supported typography controls.",
    );
  }

  const typography = {
    density: getNumberValue(value.density, "density"),
    headlineStyle: getNumberValue(value.headlineStyle, "headlineStyle"),
    pairing: getStringEnumValue(
      value.pairing,
      ["single_family", "display_plus_text", "editorial_contrast", "mono_accent"],
      "pairing",
    ),
    scale: getNumberValue(value.scale, "scale"),
    style: getStringEnumValue(
      value.style,
      [
        "geometric",
        "grotesk",
        "humanist",
        "editorial",
        "mono_tech",
        "playful",
        "luxury",
      ],
      "style",
    ),
    tightness: getNumberValue(value.tightness, "tightness"),
    weight: getNumberValue(value.weight, "weight"),
  };

  return typography as TypographySyncPayload;
}

function getNumberValue(value: unknown, key: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new SyncRequestError(400, `Invalid design seed for ${key}.`);
  }

  return value;
}

function getStringEnumValue<Value extends string>(
  value: unknown,
  options: readonly Value[],
  key: string,
): Value {
  if (typeof value !== "string" || !options.includes(value as Value)) {
    throw new SyncRequestError(400, `Invalid layout seed for ${key}.`);
  }

  return value as Value;
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
    generated_tokens?: { root?: Record<string, unknown> };
    generated?: { tokens?: { root?: Record<string, unknown> } };
    tokens?: { root?: Record<string, unknown> };
  };

  return new Set(
    Object.keys(
      parsed.generated_tokens?.root ??
        parsed.generated?.tokens?.root ??
        parsed.tokens?.root ??
        {},
    ),
  );
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
