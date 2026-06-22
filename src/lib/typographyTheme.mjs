import { TYPOGRAPHY_FONT_OPTIONS } from "./typographyFontOptions.mjs";
import { TYPOGRAPHY_REMIX_PRESETS } from "./typographyRemixPresets.mjs";

export const TYPOGRAPHY_STYLE_OPTIONS = [
  "geometric",
  "grotesk",
  "humanist",
  "editorial",
  "mono_tech",
  "playful",
  "luxury",
];
export const TYPOGRAPHY_PAIRING_OPTIONS = [
  "single_family",
  "display_plus_text",
  "editorial_contrast",
  "mono_accent",
];
export { TYPOGRAPHY_FONT_OPTIONS };
export const TYPOGRAPHY_FONT_IDS = TYPOGRAPHY_FONT_OPTIONS.map((font) => font.id);

export const DEFAULT_TYPOGRAPHY_SEEDS = {
  style: "geometric",
  pairing: "display_plus_text",
  primaryFont: "inter",
  secondaryFont: "roboto",
  scale: 70,
  density: 60,
  weight: 60,
  headlineStyle: 60,
  tightness: 50,
};

export const TYPOGRAPHY_SEED_KEYS = [
  "style",
  "pairing",
  "primaryFont",
  "secondaryFont",
  "scale",
  "density",
  "weight",
  "headlineStyle",
  "tightness",
];

export const TYPOGRAPHY_GENERATED_TOKEN_NAMES = [
  "--button-font-size",
  "--button-font-weight",
  "--badge-font-weight",
  "--navbar-link-font-size",
  "--demo-layer-font-size",
  "--font-family-heading",
  "--font-family-body",
  "--font-family-button",
  "--font-size-display",
  "--font-size-h1",
  "--font-size-h2",
  "--font-size-h3",
  "--font-size-h4",
  "--font-size-body-lg",
  "--font-size-body",
  "--font-size-caption",
  "--font-size-eyebrow",
  "--line-height-root",
  "--line-height-display",
  "--line-height-h1",
  "--line-height-h2",
  "--line-height-h3",
  "--line-height-h4",
  "--line-height-body-lg",
  "--line-height-body",
  "--line-height-caption",
  "--line-height-eyebrow",
  "--font-weight-heading",
  "--font-weight-body",
  "--font-weight-strong",
  "--font-weight-label",
  "--letter-spacing-heading",
  "--letter-spacing-eyebrow",
  "--text-transform-eyebrow",
];

export const TYPOGRAPHY_GENERATED_MEDIA_TOKEN_NAMES = {
  "max-width: 1100px": [
    "--font-size-display",
    "--font-size-h1",
    "--font-size-h2",
    "--font-size-h3",
  ],
  "max-width: 640px": [
    "--font-size-display",
    "--font-size-h1",
    "--font-size-h2",
    "--font-size-h3",
    "--font-size-body-lg",
  ],
};

const FONT_STACKS = {
  geometric: {
    body: "Roboto, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    display: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    mono: "\"SFMono-Regular\", \"Cascadia Code\", \"Roboto Mono\", monospace",
  },
  grotesk: {
    body: "\"Helvetica Neue\", Arial, ui-sans-serif, system-ui, sans-serif",
    display: "\"Helvetica Neue\", Arial, ui-sans-serif, system-ui, sans-serif",
    mono: "\"SFMono-Regular\", \"Cascadia Code\", \"Roboto Mono\", monospace",
  },
  humanist: {
    body: "\"Avenir Next\", Avenir, \"Segoe UI\", ui-sans-serif, system-ui, sans-serif",
    display: "\"Avenir Next\", Avenir, \"Segoe UI\", ui-sans-serif, system-ui, sans-serif",
    mono: "\"SFMono-Regular\", \"Cascadia Code\", \"Roboto Mono\", monospace",
  },
  editorial: {
    body: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    display: "Georgia, \"Times New Roman\", Times, serif",
    mono: "\"SFMono-Regular\", \"Cascadia Code\", \"Roboto Mono\", monospace",
  },
  mono_tech: {
    body: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    display: "\"SFMono-Regular\", \"Cascadia Code\", \"Roboto Mono\", monospace",
    mono: "\"SFMono-Regular\", \"Cascadia Code\", \"Roboto Mono\", monospace",
  },
  playful: {
    body: "\"Nunito\", \"Avenir Next Rounded\", \"Avenir Next\", ui-sans-serif, system-ui, sans-serif",
    display: "\"Nunito\", \"Avenir Next Rounded\", \"Avenir Next\", ui-sans-serif, system-ui, sans-serif",
    mono: "\"SFMono-Regular\", \"Cascadia Code\", \"Roboto Mono\", monospace",
  },
  luxury: {
    body: "\"Avenir Next\", Avenir, Inter, ui-sans-serif, system-ui, sans-serif",
    display: "Didot, \"Bodoni 72\", Georgia, \"Times New Roman\", serif",
    mono: "\"SFMono-Regular\", \"Cascadia Code\", \"Roboto Mono\", monospace",
  },
};

const STYLE_ADJUSTMENTS = {
  geometric: { headingWeight: 0, displayWeight: 0, tracking: 0, transform: "uppercase" },
  grotesk: { headingWeight: -20, displayWeight: -20, tracking: 0.004, transform: "uppercase" },
  humanist: { headingWeight: -30, displayWeight: -40, tracking: 0.006, transform: "none" },
  editorial: { headingWeight: -90, displayWeight: -120, tracking: -0.012, transform: "uppercase" },
  mono_tech: { headingWeight: -40, displayWeight: -50, tracking: 0.015, transform: "uppercase" },
  playful: { headingWeight: -20, displayWeight: -30, tracking: 0.01, transform: "none" },
  luxury: { headingWeight: -110, displayWeight: -140, tracking: 0.018, transform: "uppercase" },
};

const BASE_ROOT_SIZES = {
  "--font-size-display": 5.875,
  "--font-size-h1": 3.6875,
  "--font-size-h2": 2.9375,
  "--font-size-h3": 2.0625,
  "--font-size-h4": 1.5,
  "--font-size-body-lg": 1.25,
  "--font-size-body": 1,
  "--font-size-caption": 0.75,
  "--font-size-eyebrow": 0.625,
};

const BASE_MEDIA_SIZES = {
  "max-width: 1100px": {
    "--font-size-display": 4.625,
    "--font-size-h1": 3.125,
    "--font-size-h2": 2.5,
    "--font-size-h3": 1.875,
  },
  "max-width: 640px": {
    "--font-size-display": 3.5,
    "--font-size-h1": 2.75,
    "--font-size-h2": 2.25,
    "--font-size-h3": 1.75,
    "--font-size-body-lg": 1.125,
  },
};

export function sanitizeTypographySeeds(seeds = {}) {
  const style = sanitizeEnum(
    seeds.style,
    TYPOGRAPHY_STYLE_OPTIONS,
    DEFAULT_TYPOGRAPHY_SEEDS.style,
  );
  const pairing = sanitizeEnum(
    seeds.pairing,
    TYPOGRAPHY_PAIRING_OPTIONS,
    DEFAULT_TYPOGRAPHY_SEEDS.pairing,
  );
  const fallbackFonts = getDefaultFontIdsForTypography(style, pairing);

  return {
    style,
    pairing,
    primaryFont: sanitizeEnum(
      seeds.primaryFont,
      TYPOGRAPHY_FONT_IDS,
      fallbackFonts.primaryFont,
    ),
    secondaryFont: sanitizeEnum(
      seeds.secondaryFont,
      TYPOGRAPHY_FONT_IDS,
      fallbackFonts.secondaryFont,
    ),
    scale: snapNumber(seeds.scale, 0, 100, 1, DEFAULT_TYPOGRAPHY_SEEDS.scale),
    density: snapNumber(
      seeds.density,
      0,
      100,
      1,
      DEFAULT_TYPOGRAPHY_SEEDS.density,
    ),
    weight: snapNumber(seeds.weight, 0, 100, 1, DEFAULT_TYPOGRAPHY_SEEDS.weight),
    headlineStyle: snapNumber(
      seeds.headlineStyle,
      0,
      100,
      1,
      DEFAULT_TYPOGRAPHY_SEEDS.headlineStyle,
    ),
    tightness: snapNumber(
      seeds.tightness,
      0,
      100,
      1,
      DEFAULT_TYPOGRAPHY_SEEDS.tightness,
    ),
  };
}

function getDefaultFontIdsForTypography(style, pairing) {
  const preset =
    TYPOGRAPHY_REMIX_PRESETS.find(
      (candidate) => candidate.style === style && candidate.pairing === pairing,
    ) ??
    TYPOGRAPHY_REMIX_PRESETS.find((candidate) => candidate.style === style) ??
    DEFAULT_TYPOGRAPHY_SEEDS;

  return {
    primaryFont: preset.primaryFont,
    secondaryFont: preset.secondaryFont,
  };
}

export function generateTypographyRemix(options = {}) {
  const requestedStyle = TYPOGRAPHY_STYLE_OPTIONS.includes(options.style)
    ? options.style
    : null;
  const requestedPairing = TYPOGRAPHY_PAIRING_OPTIONS.includes(options.pairing)
    ? options.pairing
    : null;
  const step = Number.isFinite(options.step) ? Math.max(0, Math.floor(options.step)) : 0;
  const salt = Number.isFinite(options.salt) ? Math.max(0, Math.floor(options.salt)) : 0;
  const remixStep = step + salt;
  const matchingPresets = TYPOGRAPHY_REMIX_PRESETS.filter(
    (preset) =>
      (!requestedStyle || preset.style === requestedStyle) &&
      (!requestedPairing || preset.pairing === requestedPairing),
  );
  const presets = matchingPresets.length > 0 ? matchingPresets : TYPOGRAPHY_REMIX_PRESETS;
  const preset = presets[remixStep % presets.length];
  const cycle = Math.floor(remixStep / presets.length);

  return sanitizeTypographySeeds({
    ...preset,
    density: preset.density + getTypographyJitter(remixStep, cycle, 1, 8),
    headlineStyle:
      preset.headlineStyle + getTypographyJitter(remixStep, cycle, 2, 7),
    scale: preset.scale + getTypographyJitter(remixStep, cycle, 3, 7),
    tightness: preset.tightness + getTypographyJitter(remixStep, cycle, 4, 9),
    weight: preset.weight + getTypographyJitter(remixStep, cycle, 5, 8),
  });
}

export function generateTypographyThemeTokens(seeds = {}) {
  const typography = sanitizeTypographySeeds(seeds);
  const fonts = getFontStacks(typography);
  const style = STYLE_ADJUSTMENTS[typography.style];
  const sizeTokens = generateSizeTokens(BASE_ROOT_SIZES, typography);
  const lineHeights = generateLineHeights(typography);
  const weights = generateWeights(typography, style);
  const tracking = generateTracking(typography, style);

  return {
    "--button-font-size": `${roundNumber(0.875 * getBodySizeFactor(typography), 4)}rem`,
    "--button-font-weight": `${weights.button}`,
    "--badge-font-weight": `${weights.button}`,
    "--navbar-link-font-size": `${roundNumber(0.875 * getBodySizeFactor(typography), 4)}rem`,
    "--demo-layer-font-size": `${roundNumber(0.875 * getBodySizeFactor(typography), 4)}rem`,
    "--font-family-heading": fonts.heading,
    "--font-family-body": fonts.body,
    "--font-family-button": resolveButtonFontStack(fonts),
    ...sizeTokens,
    "--line-height-root": `${lineHeights.root}`,
    "--line-height-display": `${lineHeights.display}`,
    "--line-height-h1": `${lineHeights.h1}`,
    "--line-height-h2": `${lineHeights.h2}`,
    "--line-height-h3": `${lineHeights.h3}`,
    "--line-height-h4": `${lineHeights.h4}`,
    "--line-height-body-lg": `${lineHeights.bodyLg}`,
    "--line-height-body": `${lineHeights.body}`,
    "--line-height-caption": `${lineHeights.caption}`,
    "--line-height-eyebrow": `${lineHeights.eyebrow}`,
    "--font-weight-heading": `${weights.heading}`,
    "--font-weight-body": `${weights.body}`,
    "--font-weight-strong": `${weights.strong}`,
    "--font-weight-label": `${weights.label}`,
    "--letter-spacing-heading": `${tracking.heading}em`,
    "--letter-spacing-eyebrow": `${tracking.eyebrow}em`,
    "--text-transform-eyebrow": style.transform,
  };
}

export function generateTypographyMediaThemeTokens(seeds = {}) {
  const typography = sanitizeTypographySeeds(seeds);

  return Object.fromEntries(
    Object.entries(BASE_MEDIA_SIZES).map(([query, sizes]) => [
      query,
      generateSizeTokens(sizes, typography),
    ]),
  );
}

const BUTTON_SANS_FALLBACK =
  FONT_STACKS.geometric.body;

export function isSerifFontStack(stack) {
  const match = stack.match(/,\s*([^,]+)\s*$/);
  const genericFamily = (match ? match[1] : stack).trim().toLowerCase();
  return genericFamily === "serif";
}

export function resolveButtonFontStack(fonts) {
  for (const stack of [fonts.body, fonts.heading]) {
    if (!isSerifFontStack(stack)) {
      return stack;
    }
  }

  return BUTTON_SANS_FALLBACK;
}

function getFontStacks(typography) {
  const primaryFont = getFontDefinition(typography.primaryFont);
  const secondaryFont = getFontDefinition(typography.secondaryFont);
  if (primaryFont && secondaryFont) {
    return { body: secondaryFont.stack, heading: primaryFont.stack };
  }

  const styleFonts = FONT_STACKS[typography.style];
  if (typography.pairing === "single_family") {
    return { body: styleFonts.display, heading: styleFonts.display };
  }

  if (typography.pairing === "editorial_contrast") {
    return {
      body:
        typography.style === "editorial" || typography.style === "luxury"
          ? styleFonts.body
          : FONT_STACKS.editorial.body,
      heading:
        typography.style === "editorial" || typography.style === "luxury"
          ? styleFonts.display
          : FONT_STACKS.editorial.display,
    };
  }

  if (typography.pairing === "mono_accent" && typography.style === "mono_tech") {
    return { body: styleFonts.body, heading: styleFonts.display };
  }

  return { body: styleFonts.body, heading: styleFonts.display };
}

function getFontDefinition(id) {
  return TYPOGRAPHY_FONT_OPTIONS.find((font) => font.id === id) ?? null;
}

function generateSizeTokens(sizes, typography) {
  const scaleFactor = 1 + (typography.scale - DEFAULT_TYPOGRAPHY_SEEDS.scale) * 0.0042;
  const densityFactor = getBodySizeFactor(typography);
  const headlineFactor =
    1 +
    (typography.headlineStyle - DEFAULT_TYPOGRAPHY_SEEDS.headlineStyle) * 0.0026;

  return Object.fromEntries(
    Object.entries(sizes).map(([name, size]) => {
      let factor = densityFactor;
      if (name.includes("display")) factor = scaleFactor * headlineFactor;
      if (name.includes("-h1") || name.includes("-h2")) {
        factor = scaleFactor * (1 + (headlineFactor - 1) * 0.7);
      }
      if (name.includes("-h3") || name.includes("-h4")) {
        factor = 1 + (scaleFactor - 1) * 0.65;
      }

      return [name, `${roundNumber(size * factor, 4)}rem`];
    }),
  );
}

function generateLineHeights(typography) {
  const tight = (typography.tightness - DEFAULT_TYPOGRAPHY_SEEDS.tightness) / 100;
  const density = (typography.density - DEFAULT_TYPOGRAPHY_SEEDS.density) / 100;
  const energy =
    (typography.headlineStyle - DEFAULT_TYPOGRAPHY_SEEDS.headlineStyle) / 100;

  return {
    root: roundNumber(1.5 + density * 0.1, 3),
    display: roundNumber(clampNumber(1.02 - tight * 0.22 - energy * 0.08, 0.86, 1.12), 3),
    h1: roundNumber(clampNumber(1.05 - tight * 0.16 - energy * 0.04, 0.9, 1.16), 3),
    h2: roundNumber(clampNumber(1.08 - tight * 0.12 - energy * 0.03, 0.95, 1.2), 3),
    h3: roundNumber(clampNumber(1.15 - tight * 0.08, 1, 1.26), 3),
    h4: roundNumber(clampNumber(1.33 - tight * 0.05, 1.15, 1.42), 3),
    bodyLg: roundNumber(clampNumber(1.6 + density * 0.16, 1.42, 1.72), 3),
    body: roundNumber(clampNumber(1.5 + density * 0.14, 1.38, 1.66), 3),
    caption: roundNumber(clampNumber(1.5 + density * 0.08, 1.36, 1.62), 3),
    eyebrow: roundNumber(clampNumber(1.6 - tight * 0.04, 1.44, 1.72), 3),
  };
}

function generateWeights(typography, style) {
  const weight = typography.weight - DEFAULT_TYPOGRAPHY_SEEDS.weight;
  const energy = typography.headlineStyle - DEFAULT_TYPOGRAPHY_SEEDS.headlineStyle;
  const body = snapWeight(400 + weight * 0.7);
  const heading = snapWeight(760 + weight * 1.3 + energy * 0.65 + style.headingWeight);
  const label = snapWeight(760 + weight * 1 + style.headingWeight * 0.35);

  return {
    body,
    button: snapWeight(label - 40),
    heading,
    label,
    strong: snapWeight(Math.max(heading + 40, body + 260)),
  };
}

function generateTracking(typography, style) {
  const tight = (typography.tightness - DEFAULT_TYPOGRAPHY_SEEDS.tightness) / 100;
  const energy =
    (typography.headlineStyle - DEFAULT_TYPOGRAPHY_SEEDS.headlineStyle) / 100;
  const heading = roundNumber(style.tracking - tight * 0.1 - energy * 0.03, 3);
  const eyebrow = roundNumber(Math.max(0, style.tracking + tight * 0.035), 3);

  return { heading, eyebrow };
}

function getBodySizeFactor(typography) {
  return 1 + (typography.density - DEFAULT_TYPOGRAPHY_SEEDS.density) * 0.0008;
}

function sanitizeEnum(value, options, fallback) {
  return options.includes(value) ? value : fallback;
}

function snapNumber(value, min, max, step, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;

  const snapped = Math.round((parsed - min) / step) * step + min;
  return Number(clampNumber(snapped, min, max).toFixed(4));
}

function getTypographyJitter(step, cycle, index, amplitude) {
  if (cycle === 0) return 0;
  const ratio = getDeterministicRatio(step, index);
  return Math.round((ratio - 0.5) * amplitude * 2);
}

function getDeterministicRatio(step, index) {
  const raw = Math.sin((step + 1) * 12.9898 + (index + 1) * 78.233) * 43758.5453;
  return raw - Math.floor(raw);
}

function snapWeight(value) {
  return Math.round(clampNumber(value, 300, 900) / 10) * 10;
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundNumber(value, decimals = 0) {
  return Number(value.toFixed(decimals));
}
