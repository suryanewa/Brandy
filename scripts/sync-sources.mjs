import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { parse, stringify } from "yaml";
import {
  BRAND_GENERATED_TOKEN_NAMES,
  DEFAULT_BRAND_DERIVATION_CONTROLS,
  DEFAULT_BRAND_SEEDS,
  BRAND_SEED_KEYS,
  generateBrandThemeTokens,
  sanitizeBrandDerivationControls,
  sanitizeBrandSeeds,
} from "../src/lib/brandTheme.mjs";
import {
  DEFAULT_LAYOUT_SEEDS,
  LAYOUT_GENERATED_TOKEN_NAMES,
  generateLayoutThemeTokens,
  sanitizeLayoutSeeds,
} from "../src/lib/layoutTheme.mjs";
import {
  DEFAULT_TYPOGRAPHY_SEEDS,
  TYPOGRAPHY_GENERATED_TOKEN_NAMES,
  TYPOGRAPHY_SEED_KEYS,
  generateTypographyMediaThemeTokens,
  generateTypographyThemeTokens,
  sanitizeTypographySeeds,
} from "../src/lib/typographyTheme.mjs";

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
  "# Brandy brand system. Edit brief/seeds here, then run npm run sync:sources.\n";
const COPY_SOURCE_MARKER =
  "```yaml";
const GENERATED_BRAND_TOKEN_NAMES = new Set(BRAND_GENERATED_TOKEN_NAMES);
const GENERATED_LAYOUT_TOKEN_NAMES = new Set(LAYOUT_GENERATED_TOKEN_NAMES);
const GENERATED_TYPOGRAPHY_TOKEN_NAMES = new Set(
  TYPOGRAPHY_GENERATED_TOKEN_NAMES,
);
const LAYOUT_SEED_KEYS = [
  "spacing",
  "radius",
  "width",
  "pageGutter",
  "heroScale",
  "heroBalance",
  "textWidth",
  "gridDensity",
];
const DEFAULT_BRAND_META = {
  name: "Brandy",
  category: "Brand surface testing tool",
  description:
    "A browser-native system for turning expressive brand seeds into launch-ready surfaces.",
};
const DEFAULT_BRAND_STRATEGY = {
  positioning: "The visual control layer for modular landing page systems.",
  promise: "Make brand feedback precise, fast, and implementation-ready.",
  personality: ["sharp", "useful", "systematic", "brand-aware"],
};
const DEFAULT_MOTION_SEEDS = {
  personality: "snappy",
  intensity: "medium",
  hoverStyle: "lift",
  revealStyle: "quick_reveal",
};
const DEFAULT_IMAGERY_SEEDS = {
  style: "annotated_interface_screenshots",
  texture: "clean",
  iconStyle: "rounded_stroke",
  illustrationStyle: "diagrammatic",
};
const DEFAULT_VOICE_SEEDS = {
  headlineStyle: "clear_punchy",
  sentenceStyle: "short_direct",
  vocabulary: ["brand surfaces", "tokens", "sections", "ship"],
};

export async function syncDesignTokensFromValues(values, options = {}) {
  const brand = options.brand ? sanitizeSourceBrandSeeds(options.brand) : null;
  const brandDerivation = options.brandDerivation
    ? sanitizeSourceBrandDerivationControls(options.brandDerivation)
    : null;
  const layout = options.layout ? sanitizeSourceLayoutSeeds(options.layout) : null;
  const typography = options.typography
    ? sanitizeSourceTypographySeeds(options.typography)
    : null;
  const tokenValues = sanitizeTokenValuePatch(values, {
    skipGeneratedBrandTokens: brand != null || brandDerivation != null,
    skipGeneratedLayoutTokens: layout != null,
    skipGeneratedTypographyTokens: typography != null,
  });
  const source = await readDesignTokenSource();
  let changedCount = 0;

  if (brand) {
    for (const key of BRAND_SEED_KEYS) {
      if (source.color[key] !== brand[key]) changedCount += 1;
    }
    source.color = brand;
  }

  if (brandDerivation) {
    for (const key of Object.keys(DEFAULT_BRAND_DERIVATION_CONTROLS)) {
      if (source.colorDerivation[key] !== brandDerivation[key]) changedCount += 1;
    }
    source.colorDerivation = brandDerivation;
  }

  if (layout) {
    for (const key of LAYOUT_SEED_KEYS) {
      if (source.layout[key] !== layout[key]) changedCount += 1;
    }
    source.layout = layout;
  }

  if (typography) {
    for (const key of TYPOGRAPHY_SEED_KEYS) {
      if (source.typography[key] !== typography[key]) changedCount += 1;
    }
    source.typography = typography;
  }

  for (const [name, value] of tokenValues) {
    if (!source.root.has(name)) {
      throw new Error(`Unknown design token from overlay sync: ${name}`);
    }

    if (source.root.get(name) !== value) {
      source.root.set(name, value);
      changedCount += 1;
    }
  }

  applyGeneratedBrandTokens(source);
  applyGeneratedLayoutTokens(source);
  applyGeneratedTypographyTokens(source);

  if (!options.check) {
    await writeFile(DESIGN_SOURCE_PATH, serializeDesignTokenSource(source));
  }

  await syncDesignTokens(options);
  return { changedCount };
}

export async function syncDesignTokens(options = {}) {
  const source = await readDesignTokenSource();
  const designSource = await readFile(DESIGN_SOURCE_PATH, "utf8");
  const tokensCss = await readFile(TOKENS_CSS_PATH, "utf8");
  const tokenCatalog = await readFile(TOKEN_CATALOG_PATH, "utf8");
  const nextDesignSource = serializeDesignTokenSource(source);
  const nextTokensCss = replaceCssTokenDefaults(tokensCss, source);
  const nextTokenCatalog = replaceCatalogDefaults(tokenCatalog, source);

  await writeOrCheck(DESIGN_SOURCE_PATH, designSource, nextDesignSource, options);
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

  const source = {
    meta: sanitizeBrandMeta(),
    strategy: sanitizeBrandStrategy(),
    color: sanitizeBrandSeeds(DEFAULT_BRAND_SEEDS),
    colorDerivation: sanitizeBrandDerivationControls(
      DEFAULT_BRAND_DERIVATION_CONTROLS,
    ),
    layout: sanitizeLayoutSeeds(DEFAULT_LAYOUT_SEEDS),
    typography: sanitizeTypographySeeds(DEFAULT_TYPOGRAPHY_SEEDS),
    motion: sanitizeMotionSeeds(),
    imagery: sanitizeImagerySeeds(),
    voice: sanitizeVoiceSeeds(),
    root,
    media,
  };
  applyGeneratedBrandTokens(source);
  applyGeneratedLayoutTokens(source);
  applyGeneratedTypographyTokens(source);
  return source;
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
  const tokens =
    parsed?.generated_tokens ?? parsed?.generated?.tokens ?? parsed?.tokens;

  if (!tokens || typeof tokens !== "object" || Array.isArray(tokens)) {
    throw new Error(`${relativePath(DESIGN_SOURCE_PATH)} must contain a generated.tokens map`);
  }

  const brandSource = readBrandSource(parsed);
  const color = sanitizeSourceBrandSeeds(
    brandSource.seeds.color ?? DEFAULT_BRAND_SEEDS,
  );
  const colorDerivation = sanitizeSourceBrandDerivationControls(
    brandSource.seeds.color_derivation ?? DEFAULT_BRAND_DERIVATION_CONTROLS,
  );
  const layout = sanitizeSourceLayoutSeeds(
    brandSource.seeds.layout ?? DEFAULT_LAYOUT_SEEDS,
  );
  const typography = sanitizeSourceTypographySeeds(
    brandSource.seeds.typography ?? DEFAULT_TYPOGRAPHY_SEEDS,
  );

  if ("root" in tokens || "media" in tokens) {
    const source = {
      color,
      colorDerivation,
      imagery: brandSource.seeds.imagery,
      layout,
      meta: brandSource.meta,
      motion: brandSource.seeds.motion,
      strategy: brandSource.strategy,
      typography,
      voice: brandSource.seeds.voice,
      root: readSourceTokenMap(tokens.root, "tokens.root"),
      media: readSourceMediaTokenMap(tokens.media),
    };
    applyGeneratedBrandTokens(source);
    applyGeneratedLayoutTokens(source);
    applyGeneratedTypographyTokens(source);
    return source;
  }

  const source = {
    color,
    colorDerivation,
    imagery: brandSource.seeds.imagery,
    layout,
    meta: brandSource.meta,
    motion: brandSource.seeds.motion,
    strategy: brandSource.strategy,
    typography,
    voice: brandSource.seeds.voice,
    root: readSourceTokenMap(tokens, "tokens"),
    media: new Map(),
  };
  applyGeneratedBrandTokens(source);
  applyGeneratedLayoutTokens(source);
  applyGeneratedTypographyTokens(source);
  return source;
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
    {
      schema_version: 2,
      brand_brief: {
        name: source.meta.name,
        category: source.meta.category,
        description: source.meta.description,
        strategy: {
          positioning: source.strategy.positioning,
          promise: source.strategy.promise,
        },
        personality: {
          traits: source.strategy.personality,
        },
        voice: {
          headline_style: source.voice.headlineStyle,
          sentence_style: source.voice.sentenceStyle,
          vocabulary: source.voice.vocabulary,
        },
        imagery: {
          style: source.imagery.style,
          texture: source.imagery.texture,
          icon_style: source.imagery.iconStyle,
          illustration_style: source.imagery.illustrationStyle,
        },
        motion: {
          personality: source.motion.personality,
          intensity: source.motion.intensity,
          hover_style: source.motion.hoverStyle,
          reveal_style: source.motion.revealStyle,
        },
      },
      creative_seeds: {
        color: source.color,
        color_derivation: source.colorDerivation,
        typography: source.typography,
        layout: source.layout,
      },
      generated_tokens: { root, media },
    },
    {
      defaultKeyType: "PLAIN",
      defaultStringType: "QUOTE_DOUBLE",
      lineWidth: 0,
      sortMapEntries: false,
    },
  )}`;
}

function readBrandSource(parsed) {
  const brandBrief = parsed?.brand_brief;
  const creativeSeeds = parsed?.creative_seeds;
  const partialBrand = parsed?.brand;
  const seeds = isPlainObject(creativeSeeds)
    ? creativeSeeds
    : isPlainObject(partialBrand?.seeds)
      ? partialBrand.seeds
      : {};

  return {
    meta: sanitizeBrandMeta(brandBrief ?? partialBrand?.meta),
    strategy: sanitizeBrandStrategy(
      brandBrief
        ? {
            ...brandBrief.strategy,
            personality: brandBrief.personality?.traits,
          }
        : partialBrand?.strategy,
    ),
    seeds: {
      color:
        seeds && typeof seeds === "object" && !Array.isArray(seeds)
          ? seeds.color
          : isLegacyColorSeed(partialBrand)
            ? partialBrand
            : DEFAULT_BRAND_SEEDS,
      imagery: sanitizeImagerySeeds(brandBrief?.imagery ?? seeds?.imagery),
      layout: seeds?.layout ?? parsed?.layout ?? DEFAULT_LAYOUT_SEEDS,
      motion: sanitizeMotionSeeds(brandBrief?.motion ?? seeds?.motion),
      typography:
        seeds?.typography ?? parsed?.typography ?? DEFAULT_TYPOGRAPHY_SEEDS,
      voice: sanitizeVoiceSeeds(brandBrief?.voice ?? seeds?.voice),
    },
  };
}

function isLegacyColorSeed(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  return BRAND_SEED_KEYS.every((key) => key in value);
}

function sanitizeBrandMeta(meta = DEFAULT_BRAND_META) {
  const source = isPlainObject(meta) ? meta : DEFAULT_BRAND_META;

  return {
    name: sanitizeString(source.name, DEFAULT_BRAND_META.name),
    category: sanitizeString(source.category, DEFAULT_BRAND_META.category),
    description: sanitizeString(
      source.description,
      DEFAULT_BRAND_META.description,
    ),
  };
}

function sanitizeBrandStrategy(strategy = DEFAULT_BRAND_STRATEGY) {
  const source = isPlainObject(strategy) ? strategy : DEFAULT_BRAND_STRATEGY;

  return {
    positioning: sanitizeString(
      source.positioning,
      DEFAULT_BRAND_STRATEGY.positioning,
    ),
    promise: sanitizeString(source.promise, DEFAULT_BRAND_STRATEGY.promise),
    personality: sanitizeStringList(
      source.personality,
      DEFAULT_BRAND_STRATEGY.personality,
    ),
  };
}

function sanitizeMotionSeeds(motion = DEFAULT_MOTION_SEEDS) {
  const source = isPlainObject(motion) ? motion : DEFAULT_MOTION_SEEDS;

  return {
    personality: sanitizeString(source.personality, DEFAULT_MOTION_SEEDS.personality),
    intensity: sanitizeString(source.intensity, DEFAULT_MOTION_SEEDS.intensity),
    hoverStyle: sanitizeString(
      source.hoverStyle ?? source.hover_style,
      DEFAULT_MOTION_SEEDS.hoverStyle,
    ),
    revealStyle: sanitizeString(
      source.revealStyle ?? source.reveal_style,
      DEFAULT_MOTION_SEEDS.revealStyle,
    ),
  };
}

function sanitizeImagerySeeds(imagery = DEFAULT_IMAGERY_SEEDS) {
  const source = isPlainObject(imagery) ? imagery : DEFAULT_IMAGERY_SEEDS;

  return {
    style: sanitizeString(source.style, DEFAULT_IMAGERY_SEEDS.style),
    texture: sanitizeString(source.texture, DEFAULT_IMAGERY_SEEDS.texture),
    iconStyle: sanitizeString(
      source.iconStyle ?? source.icon_style,
      DEFAULT_IMAGERY_SEEDS.iconStyle,
    ),
    illustrationStyle: sanitizeString(
      source.illustrationStyle ?? source.illustration_style,
      DEFAULT_IMAGERY_SEEDS.illustrationStyle,
    ),
  };
}

function sanitizeVoiceSeeds(voice = DEFAULT_VOICE_SEEDS) {
  const source = isPlainObject(voice) ? voice : DEFAULT_VOICE_SEEDS;

  return {
    headlineStyle: sanitizeString(
      source.headlineStyle ?? source.headline_style,
      DEFAULT_VOICE_SEEDS.headlineStyle,
    ),
    sentenceStyle: sanitizeString(
      source.sentenceStyle ?? source.sentence_style,
      DEFAULT_VOICE_SEEDS.sentenceStyle,
    ),
    vocabulary: sanitizeStringList(
      source.vocabulary,
      DEFAULT_VOICE_SEEDS.vocabulary,
    ),
  };
}

function isPlainObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function sanitizeString(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function sanitizeStringList(value, fallback) {
  if (!Array.isArray(value)) return [...fallback];
  const clean = value.filter((item) => typeof item === "string" && item.trim());
  return clean.length > 0 ? clean.map((item) => item.trim()) : [...fallback];
}

function sanitizeSourceBrandSeeds(brand) {
  if (!brand || typeof brand !== "object" || Array.isArray(brand)) {
    throw new Error("Brand seeds must contain primary, secondary, accent, and highlight.");
  }

  const keys = Object.keys(brand).sort();
  const expectedKeys = [...BRAND_SEED_KEYS].sort();
  if (keys.join(",") !== expectedKeys.join(",")) {
    throw new Error("Brand seeds must contain only primary, secondary, accent, and highlight.");
  }

  for (const key of BRAND_SEED_KEYS) {
    if (typeof brand[key] !== "string") {
      throw new Error(`Brand seed ${key} must be a color string.`);
    }
  }

  return sanitizeBrandSeeds(brand);
}

function sanitizeSourceBrandDerivationControls(controls) {
  if (!controls || typeof controls !== "object" || Array.isArray(controls)) {
    throw new Error("Brand derivation controls must contain the supported distance sliders.");
  }

  const keys = Object.keys(controls).sort();
  const expectedKeys = Object.keys(DEFAULT_BRAND_DERIVATION_CONTROLS).sort();
  if (keys.join(",") !== expectedKeys.join(",")) {
    throw new Error("Brand derivation controls must contain only the supported distance sliders.");
  }

  for (const key of Object.keys(DEFAULT_BRAND_DERIVATION_CONTROLS)) {
    if (typeof controls[key] !== "number") {
      throw new Error(`Brand derivation control ${key} must be a number.`);
    }
  }

  return sanitizeBrandDerivationControls(controls);
}

function sanitizeSourceLayoutSeeds(layout) {
  if (!layout || typeof layout !== "object" || Array.isArray(layout)) {
    throw new Error("Layout seeds must contain spacing, radius, width, pageGutter, heroScale, heroBalance, textWidth, and gridDensity.");
  }

  const keys = Object.keys(layout).sort();
  const expectedKeys = [...LAYOUT_SEED_KEYS].sort();
  if (keys.join(",") !== expectedKeys.join(",")) {
    throw new Error("Layout seeds must contain only spacing, radius, width, pageGutter, heroScale, heroBalance, textWidth, and gridDensity.");
  }

  for (const key of ["spacing", "radius", "pageGutter", "heroBalance", "textWidth"]) {
    if (typeof layout[key] !== "number") {
      throw new Error(`Layout seed ${key} must be a number.`);
    }
  }

  for (const key of ["width", "heroScale", "gridDensity"]) {
    if (typeof layout[key] !== "string") {
      throw new Error(`Layout seed ${key} must be a string.`);
    }
  }

  return sanitizeLayoutSeeds(layout);
}

function sanitizeSourceTypographySeeds(typography) {
  if (
    !typography ||
    typeof typography !== "object" ||
    Array.isArray(typography)
  ) {
    throw new Error(
      "Typography seeds must contain style, pairing, scale, density, weight, headlineStyle, and tightness.",
    );
  }

  const keys = Object.keys(typography).sort();
  const expectedKeys = [...TYPOGRAPHY_SEED_KEYS].sort();
  if (keys.join(",") !== expectedKeys.join(",")) {
    throw new Error(
      "Typography seeds must contain only style, pairing, scale, density, weight, headlineStyle, and tightness.",
    );
  }

  for (const key of ["scale", "density", "weight", "headlineStyle", "tightness"]) {
    if (typeof typography[key] !== "number") {
      throw new Error(`Typography seed ${key} must be a number.`);
    }
  }

  for (const key of ["style", "pairing"]) {
    if (typeof typography[key] !== "string") {
      throw new Error(`Typography seed ${key} must be a string.`);
    }
  }

  return sanitizeTypographySeeds(typography);
}

function applyGeneratedBrandTokens(source) {
  const generatedTokens = generateBrandThemeTokens(source.color, {
    derivation: source.colorDerivation,
  });
  for (const name of BRAND_GENERATED_TOKEN_NAMES) {
    source.root.set(name, generatedTokens[name]);
  }
}

function applyGeneratedLayoutTokens(source) {
  const generatedTokens = generateLayoutThemeTokens(source.layout);
  for (const name of LAYOUT_GENERATED_TOKEN_NAMES) {
    source.root.set(name, generatedTokens[name]);
  }
}

function applyGeneratedTypographyTokens(source) {
  const generatedTokens = generateTypographyThemeTokens(source.typography);
  for (const name of TYPOGRAPHY_GENERATED_TOKEN_NAMES) {
    source.root.set(name, generatedTokens[name]);
  }

  const generatedMediaTokens = generateTypographyMediaThemeTokens(source.typography);
  for (const [query, tokens] of Object.entries(generatedMediaTokens)) {
    const mediaTokens = source.media.get(query) ?? new Map();
    for (const [name, value] of Object.entries(tokens)) {
      mediaTokens.set(name, value);
    }
    source.media.set(query, mediaTokens);
  }
}

function sanitizeTokenValuePatch(values, options = {}) {
  if (!values || typeof values !== "object" || Array.isArray(values)) {
    throw new Error("Overlay sync payload must contain a values object");
  }

  const entries = [];
  for (const [name, value] of Object.entries(values)) {
    if (!name.startsWith("--")) continue;
    if (
      options.skipGeneratedBrandTokens &&
      GENERATED_BRAND_TOKEN_NAMES.has(name)
    ) {
      continue;
    }
    if (
      options.skipGeneratedLayoutTokens &&
      GENERATED_LAYOUT_TOKEN_NAMES.has(name)
    ) {
      continue;
    }
    if (
      options.skipGeneratedTypographyTokens &&
      GENERATED_TYPOGRAPHY_TOKEN_NAMES.has(name)
    ) {
      continue;
    }
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
