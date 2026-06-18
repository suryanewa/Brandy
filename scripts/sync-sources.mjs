import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { parse, stringify } from "yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DESIGN_SOURCE_PATH = path.join(ROOT, "content/design-tokens.yaml");
const COPY_SOURCE_PATH = path.join(ROOT, "content/landing-copy.md");
const TOKENS_CSS_PATH = path.join(ROOT, "src/styles/tokens.css");
const TOKEN_CATALOG_PATH = path.join(
  ROOT,
  "src/components/overlay/designTokenCatalog.ts",
);
const LANDING_CONTENT_PATH = path.join(ROOT, "src/content/landing.ts");

const DESIGN_SOURCE_HEADER =
  "# Brandy design tokens. Edit values here, then run npm run sync:sources.\n";
const COPY_SOURCE_MARKER =
  "```yaml";

export async function syncDesignTokensFromValues(values, options = {}) {
  const tokenValues = sanitizeTokenValuePatch(values);
  const source = await readDesignTokenSource();
  let changedCount = 0;

  for (const [name, value] of tokenValues) {
    if (!source.root.has(name)) {
      throw new Error(`Unknown design token from overlay sync: ${name}`);
    }

    if (source.root.get(name) !== value) {
      source.root.set(name, value);
      changedCount += 1;
    }
  }

  if (!options.check) {
    await writeFile(DESIGN_SOURCE_PATH, serializeDesignTokenSource(source));
  }

  await syncDesignTokens(options);
  return { changedCount };
}

export async function syncDesignTokens(options = {}) {
  const source = await readDesignTokenSource();
  const tokensCss = await readFile(TOKENS_CSS_PATH, "utf8");
  const tokenCatalog = await readFile(TOKEN_CATALOG_PATH, "utf8");
  const nextTokensCss = replaceCssTokenDefaults(tokensCss, source);
  const nextTokenCatalog = replaceCatalogDefaults(tokenCatalog, source);

  await writeOrCheck(TOKENS_CSS_PATH, tokensCss, nextTokensCss, options);
  await writeOrCheck(TOKEN_CATALOG_PATH, tokenCatalog, nextTokenCatalog, options);
}

export async function syncLandingCopy(options = {}) {
  const markdown = await readFile(COPY_SOURCE_PATH, "utf8");
  const copy = parseMarkdownYamlSource(markdown, COPY_SOURCE_PATH);
  const current = await readFile(LANDING_CONTENT_PATH, "utf8");
  const next = renderLandingContent(copy);

  await writeOrCheck(LANDING_CONTENT_PATH, current, next, options);
}

async function initDesignTokenSource(options = {}) {
  const tokensCss = await readFile(TOKENS_CSS_PATH, "utf8");
  const source = readTokenDefaults(tokensCss);
  const next = serializeDesignTokenSource(source);

  if (options.check) {
    await assertFileContent(DESIGN_SOURCE_PATH, next);
    return;
  }

  await writeFile(DESIGN_SOURCE_PATH, next);
}

function readTokenDefaults(css) {
  const mediaBlocks = readMediaRootBlocks(css);
  const rootCss = mediaBlocks.reduce(
    (withoutMedia, block) => withoutMedia.replace(block.fullText, ""),
    css,
  );
  const root = readDeclarationMap(rootCss);
  const media = new Map(
    mediaBlocks.map((block) => [block.query, readDeclarationMap(block.body)]),
  );

  return { root, media };
}

function readDeclarationMap(css) {
  const source = new Map();
  for (const match of css.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gm)) {
    const [, name, value] = match;
    if (!source.has(name)) source.set(name, normalizeCssValue(value));
  }

  return source;
}

async function readDesignTokenSource() {
  const raw = await readFile(DESIGN_SOURCE_PATH, "utf8");
  const parsed = parse(raw);
  const tokens = parsed?.tokens;

  if (!tokens || typeof tokens !== "object" || Array.isArray(tokens)) {
    throw new Error(`${relativePath(DESIGN_SOURCE_PATH)} must contain a tokens map`);
  }

  if ("root" in tokens || "media" in tokens) {
    return {
      root: readSourceTokenMap(tokens.root, "tokens.root"),
      media: readSourceMediaTokenMap(tokens.media),
    };
  }

  return {
    root: readSourceTokenMap(tokens, "tokens"),
    media: new Map(),
  };
}

function readSourceTokenMap(tokens, pathLabel) {
  if (!tokens || typeof tokens !== "object" || Array.isArray(tokens)) {
    throw new Error(`${relativePath(DESIGN_SOURCE_PATH)} must contain ${pathLabel}`);
  }

  return new Map(
    Object.entries(tokens).map(([name, value]) => {
      if (!name.startsWith("--")) {
        throw new Error(`Invalid design token name in YAML: ${name}`);
      }

      if (value == null || typeof value === "object") {
        throw new Error(`Invalid design token value for ${name}`);
      }

      return [name, normalizeCssValue(String(value))];
    }),
  );
}

function readSourceMediaTokenMap(media) {
  if (media == null) return new Map();
  if (typeof media !== "object" || Array.isArray(media)) {
    throw new Error("tokens.media must be a map of media query token maps");
  }

  return new Map(
    Object.entries(media).map(([query, tokens]) => [
      query,
      readSourceTokenMap(tokens, `tokens.media.${query}`),
    ]),
  );
}

function serializeDesignTokenSource(source) {
  const root = {};
  const media = {};

  for (const [name, value] of source.root) root[name] = value;
  for (const [query, tokens] of source.media) {
    media[query] = {};
    for (const [name, value] of tokens) media[query][name] = value;
  }

  return `${DESIGN_SOURCE_HEADER}${stringify(
    { tokens: { root, media } },
    {
      defaultKeyType: "PLAIN",
      defaultStringType: "QUOTE_DOUBLE",
      lineWidth: 0,
      sortMapEntries: false,
    },
  )}`;
}

function sanitizeTokenValuePatch(values) {
  if (!values || typeof values !== "object" || Array.isArray(values)) {
    throw new Error("Overlay sync payload must contain a values object");
  }

  const entries = [];
  for (const [name, value] of Object.entries(values)) {
    if (!name.startsWith("--")) continue;
    if (typeof value !== "string" || !value.trim()) continue;
    entries.push([name, normalizeCssValue(value)]);
  }

  return entries;
}

function replaceCssTokenDefaults(css, source) {
  let next = css;

  for (const [name, value] of source.root) {
    const declaration = new RegExp(
      `(^\\s*${escapeRegExp(name)}\\s*:\\s*)([^;]+)(;)`,
      "m",
    );
    if (!declaration.test(next)) {
      throw new Error(`Missing ${name} in ${relativePath(TOKENS_CSS_PATH)}`);
    }

    next = next.replace(declaration, `$1${value}$3`);
  }

  for (const [query, tokens] of source.media) {
    next = replaceMediaRootDefaults(next, query, tokens);
  }

  return next;
}

function replaceCatalogDefaults(catalog, source) {
  let next = catalog;

  for (const [name, value] of source.root) {
    const replacement = replaceOneCatalogDefault(next, name, value);
    if (!replacement.changed) {
      throw new Error(`Missing ${name} in ${relativePath(TOKEN_CATALOG_PATH)}`);
    }

    next = replacement.text;
  }

  return next;
}

function replaceMediaRootDefaults(css, query, tokens) {
  const mediaBlock = findMediaRootBlock(css, query);
  if (!mediaBlock) {
    throw new Error(`Missing @media (${query}) in ${relativePath(TOKENS_CSS_PATH)}`);
  }

  let body = mediaBlock.body;

  for (const [name, value] of tokens) {
    const declaration = new RegExp(
      `(^\\s*${escapeRegExp(name)}\\s*:\\s*)([^;]+)(;)`,
      "m",
    );
    if (!declaration.test(body)) {
      throw new Error(
        `Missing ${name} in @media (${query}) in ${relativePath(TOKENS_CSS_PATH)}`,
      );
    }

    body = body.replace(declaration, `$1${value}$3`);
  }

  return `${css.slice(0, mediaBlock.bodyStart)}${body}${css.slice(
    mediaBlock.bodyEnd,
  )}`;
}

function readMediaRootBlocks(css) {
  const blocks = [];
  const pattern = /@media\s*\(([^)]+)\)\s*{\s*:root\s*{/g;
  let match;

  while ((match = pattern.exec(css))) {
    const openRootBraceIndex = css.indexOf("{", pattern.lastIndex - 1);
    const closeRootBraceIndex = findMatchingBrace(css, openRootBraceIndex);
    const closeMediaBraceIndex = findMatchingBrace(
      css,
      css.indexOf("{", match.index),
    );

    blocks.push({
      body: css.slice(openRootBraceIndex + 1, closeRootBraceIndex),
      bodyEnd: closeRootBraceIndex,
      bodyStart: openRootBraceIndex + 1,
      fullText: css.slice(match.index, closeMediaBraceIndex + 1),
      query: match[1].trim(),
    });

    pattern.lastIndex = closeMediaBraceIndex + 1;
  }

  return blocks;
}

function findMediaRootBlock(css, query) {
  return readMediaRootBlocks(css).find((block) => block.query === query);
}

function findMatchingBrace(text, openBraceIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = openBraceIndex; index < text.length; index += 1) {
    const char = text[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "\"" || char === "'") {
      quote = char;
      continue;
    }

    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  throw new Error("Unclosed CSS block");
}

function replaceOneCatalogDefault(catalog, tokenName, tokenValue) {
  const callPattern = /\b(cssColor|cssNumber|cssText|cssSelect)\s*\(/g;
  let match;

  while ((match = callPattern.exec(catalog))) {
    const callName = match[1];
    const openParenIndex = catalog.indexOf("(", match.index);
    const closeParenIndex = findMatchingParen(catalog, openParenIndex);
    const args = splitTopLevelArgs(
      catalog.slice(openParenIndex + 1, closeParenIndex),
    );
    const tokenArg = args[0]?.text.trim();

    if (parseTsStringLiteral(tokenArg) !== tokenName) continue;

    const defaultArg = args[3];
    if (!defaultArg) {
      throw new Error(`Missing default value for ${tokenName}`);
    }

    const replacement =
      callName === "cssNumber"
        ? serializeCatalogNumberDefault(tokenName, tokenValue)
        : JSON.stringify(tokenValue);
    const replacementWithWhitespace = preserveArgumentWhitespace(
      defaultArg.text,
      replacement,
    );
    const absoluteStart = openParenIndex + 1 + defaultArg.start;
    const absoluteEnd = openParenIndex + 1 + defaultArg.end;

    return {
      changed: true,
      text: `${catalog.slice(
        0,
        absoluteStart,
      )}${replacementWithWhitespace}${catalog.slice(absoluteEnd)}`,
    };
  }

  return { changed: false, text: catalog };
}

function preserveArgumentWhitespace(currentArgument, nextArgument) {
  const leading = currentArgument.match(/^\s*/)?.[0] ?? "";
  const trailing = currentArgument.match(/\s*$/)?.[0] ?? "";

  return `${leading || " "}${nextArgument}${trailing}`;
}

function serializeCatalogNumberDefault(tokenName, tokenValue) {
  const match = tokenValue.match(/^-?\d+(?:\.\d+)?/);
  if (!match) {
    throw new Error(
      `Token ${tokenName} is a numeric catalog control but YAML value is ${tokenValue}`,
    );
  }

  return match[0];
}

function findMatchingParen(text, openParenIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = openParenIndex; index < text.length; index += 1) {
    const char = text[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "\"" || char === "'") {
      quote = char;
      continue;
    }

    if (char === "(") depth += 1;
    if (char === ")") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  throw new Error("Unclosed catalog helper call");
}

function splitTopLevelArgs(text) {
  const args = [];
  let start = 0;
  let quote = null;
  let escaped = false;
  let parenDepth = 0;
  let braceDepth = 0;
  let bracketDepth = 0;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "\"" || char === "'") {
      quote = char;
      continue;
    }

    if (char === "(") parenDepth += 1;
    if (char === ")") parenDepth -= 1;
    if (char === "{") braceDepth += 1;
    if (char === "}") braceDepth -= 1;
    if (char === "[") bracketDepth += 1;
    if (char === "]") bracketDepth -= 1;

    if (
      char === "," &&
      parenDepth === 0 &&
      braceDepth === 0 &&
      bracketDepth === 0
    ) {
      args.push({ start, end: index, text: text.slice(start, index) });
      start = index + 1;
    }
  }

  if (start < text.length) {
    args.push({ start, end: text.length, text: text.slice(start) });
  }

  return args;
}

function parseTsStringLiteral(value) {
  if (!value || (value[0] !== "\"" && value[0] !== "'")) return null;
  const quote = value[0];
  if (value.at(-1) !== quote) return null;

  if (quote === "\"") return JSON.parse(value);

  return value
    .slice(1, -1)
    .replace(/\\'/g, "'")
    .replace(/\\"/g, "\"")
    .replace(/\\\\/g, "\\");
}

function parseMarkdownYamlSource(markdown, filePath) {
  const start = markdown.indexOf(COPY_SOURCE_MARKER);
  if (start < 0) {
    throw new Error(`${relativePath(filePath)} must contain a fenced YAML block`);
  }

  const yamlStart = markdown.indexOf("\n", start);
  const end = markdown.indexOf("\n```", yamlStart + 1);
  if (yamlStart < 0 || end < 0) {
    throw new Error(`${relativePath(filePath)} has an unterminated YAML block`);
  }

  const parsed = parse(markdown.slice(yamlStart + 1, end));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${relativePath(filePath)} YAML block must be an object`);
  }

  return parsed;
}

function renderLandingContent(copy) {
  return `// Generated by scripts/sync-sources.mjs from content/landing-copy.md.\nimport type { LandingPageContent } from "../types/landing";\n\nexport const landingPage = ${toTsLiteral(
    copy,
    0,
  )} satisfies LandingPageContent;\n`;
}

function toTsLiteral(value, depth) {
  const indent = "  ".repeat(depth);
  const childIndent = "  ".repeat(depth + 1);

  if (value == null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";

    return `[\n${value
      .map((item) => `${childIndent}${toTsLiteral(item, depth + 1)}`)
      .join(",\n")},\n${indent}]`;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) return "{}";

    return `{\n${entries
      .map(([key, item]) => {
        const property = /^[A-Za-z_$][\w$]*$/.test(key)
          ? key
          : JSON.stringify(key);
        return `${childIndent}${property}: ${toTsLiteral(item, depth + 1)}`;
      })
      .join(",\n")},\n${indent}}`;
  }

  throw new Error(`Unsupported landing copy value: ${String(value)}`);
}

async function writeOrCheck(filePath, current, next, options) {
  if (current === next) return;

  if (options.check) {
    throw new Error(
      `${relativePath(filePath)} is out of sync. Run npm run sync:sources.`,
    );
  }

  await writeFile(filePath, next);
}

async function assertFileContent(filePath, next) {
  const current = await readFile(filePath, "utf8");
  if (current !== next) {
    throw new Error(
      `${relativePath(filePath)} is out of sync. Run npm run sync:sources:init-design.`,
    );
  }
}

function normalizeCssValue(value) {
  return value.replace(/\s+/g, " ").trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function relativePath(filePath) {
  return path.relative(ROOT, filePath);
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const options = { check: args.has("--check") };
  const runDesign = args.has("--design");
  const runCopy = args.has("--copy");

  if (args.has("--init-design")) {
    await initDesignTokenSource(options);
    return;
  }

  if (runDesign || (!runDesign && !runCopy)) await syncDesignTokens(options);
  if (runCopy || (!runDesign && !runCopy)) await syncLandingCopy(options);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
