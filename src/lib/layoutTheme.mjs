export const LAYOUT_WIDTH_OPTIONS = ["narrow", "standard", "wide", "full"];
export const HERO_SCALE_OPTIONS = ["compact", "balanced", "immersive"];
export const GRID_DENSITY_OPTIONS = ["sparse", "balanced", "dense"];

export const DEFAULT_LAYOUT_SEEDS = {
  spacing: 70,
  radius: 2,
  width: "standard",
  pageGutter: 70,
  heroScale: "immersive",
  heroBalance: 57,
  textWidth: 38,
  gridDensity: "balanced",
};

export const LAYOUT_GENERATED_TOKEN_NAMES = [
  "--section-padding-x",
  "--section-padding-y-sm",
  "--section-padding-y-md",
  "--section-padding-y-lg",
  "--section-hero-min-height",
  "--brandy-section-default-padding-y",
  "--container-sm",
  "--container-md",
  "--container-lg",
  "--container-xl",
  "--content-readable-max",
  "--brandy-container-default-max-width",
  "--brandy-grid-default-columns",
  "--brandy-split-default-columns",
  "--brandy-cluster-default-justify",
  "--brandy-cluster-default-gap",
  "--brandy-stack-default-gap",
  "--hero-grid-text-fr",
  "--hero-grid-visual-fr",
  "--hero-grid-visual-min",
  "--hero-headline-max-width",
  "--hero-copy-max-width",
  "--hero-description-max-width",
  "--footer-copy-max-width",
  "--footer-columns",
  "--card-padding",
  "--demo-canvas-left-fr",
  "--demo-canvas-right-fr",
  "--feature-card-min-height",
  "--step-card-min-height",
  "--faq-trigger-min-height",
  "--radius-sm",
  "--radius-md",
  "--radius-lg",
];

const LAYOUT_REMIX_PRESETS = [
  layoutPreset(62, 2, "narrow", 66, "compact", 43, 28, "dense"),
  layoutPreset(112, 12, "wide", 95, "immersive", 60, 44, "sparse"),
  layoutPreset(86, 0, "standard", 82, "balanced", 40, 46, "balanced"),
  layoutPreset(98, 8, "full", 110, "immersive", 58, 46, "balanced"),
  layoutPreset(64, 6, "standard", 66, "compact", 50, 30, "dense"),
  layoutPreset(124, 18, "wide", 120, "immersive", 55, 40, "sparse"),
  layoutPreset(74, 3, "narrow", 70, "balanced", 46, 28, "balanced"),
  layoutPreset(90, 14, "full", 88, "balanced", 40, 46, "dense"),
  layoutPreset(105, 4, "standard", 100, "immersive", 60, 42, "sparse"),
  layoutPreset(70, 20, "wide", 68, "compact", 48, 26, "dense"),
  layoutPreset(118, 0, "full", 125, "immersive", 40, 46, "balanced"),
  layoutPreset(82, 10, "standard", 75, "balanced", 58, 38, "balanced"),
  layoutPreset(60, 1, "narrow", 64, "compact", 40, 24, "dense"),
  layoutPreset(124, 24, "full", 124, "immersive", 60, 46, "sparse"),
  layoutPreset(96, 16, "wide", 90, "balanced", 52, 48, "balanced"),
  layoutPreset(68, 8, "standard", 66, "compact", 57, 30, "dense"),
];

const WIDTH_BASES = {
  narrow: 820,
  standard: 1120,
  wide: 1328,
  full: 1520,
};
const HERO_SCALE = {
  compact: {
    headlineMax: "62rem",
    minHeight: "62svh",
    visualMin: "22rem",
  },
  balanced: {
    headlineMax: "62rem",
    minHeight: "70svh",
    visualMin: "26rem",
  },
  immersive: {
    headlineMax: "62rem",
    minHeight: "78svh",
    visualMin: "28rem",
  },
};
const HERO_DESCRIPTION_TARGET_WIDTH = 52;
const GRID_DENSITY = {
  sparse: {
    cardMinHeight: "16rem",
    columns: "repeat(2, minmax(0, 1fr))",
    stackGapStep: 8,
    stepCardMinHeight: "18rem",
  },
  balanced: {
    cardMinHeight: "14rem",
    columns: "repeat(3, minmax(0, 1fr))",
    stackGapStep: 6,
    stepCardMinHeight: "16rem",
  },
  dense: {
    cardMinHeight: "12rem",
    columns: "repeat(4, minmax(0, 1fr))",
    stackGapStep: 5,
    stepCardMinHeight: "14rem",
  },
};

export function sanitizeLayoutSeeds(seeds = {}) {
  return {
    spacing: snapNumber(seeds.spacing, 50, 130, 1, DEFAULT_LAYOUT_SEEDS.spacing),
    radius: snapNumber(seeds.radius, 0, 24, 1, DEFAULT_LAYOUT_SEEDS.radius),
    width: sanitizeEnum(seeds.width, LAYOUT_WIDTH_OPTIONS, DEFAULT_LAYOUT_SEEDS.width),
    pageGutter: snapNumber(
      seeds.pageGutter,
      50,
      130,
      1,
      DEFAULT_LAYOUT_SEEDS.pageGutter,
    ),
    heroScale: sanitizeEnum(
      seeds.heroScale,
      HERO_SCALE_OPTIONS,
      DEFAULT_LAYOUT_SEEDS.heroScale,
    ),
    heroBalance: snapNumber(
      seeds.heroBalance,
      35,
      65,
      1,
      DEFAULT_LAYOUT_SEEDS.heroBalance,
    ),
    textWidth: snapNumber(seeds.textWidth, 22, 52, 1, DEFAULT_LAYOUT_SEEDS.textWidth),
    gridDensity: sanitizeEnum(
      seeds.gridDensity,
      GRID_DENSITY_OPTIONS,
      DEFAULT_LAYOUT_SEEDS.gridDensity,
    ),
  };
}

export function generateLayoutRemix(options = {}) {
  const step = Number.isFinite(options.step) ? Math.max(0, Math.floor(options.step)) : 0;
  const salt = Number.isFinite(options.salt) ? Math.max(0, Math.floor(options.salt)) : 0;
  const remixStep = step + salt;
  const preset = LAYOUT_REMIX_PRESETS[remixStep % LAYOUT_REMIX_PRESETS.length];
  const cycle = Math.floor(remixStep / LAYOUT_REMIX_PRESETS.length);

  return sanitizeLayoutRemixSeeds({
    ...preset,
    heroBalance: preset.heroBalance + getLayoutJitter(remixStep, cycle, 1, 4),
    pageGutter: preset.pageGutter + getLayoutJitter(remixStep, cycle, 2, 7),
    radius: preset.radius + getLayoutJitter(remixStep, cycle, 3, 3),
    spacing: preset.spacing + getLayoutJitter(remixStep, cycle, 4, 8),
    textWidth: preset.textWidth + getLayoutJitter(remixStep, cycle, 5, 4),
  });
}

export function generateLayoutThemeTokens(seeds = {}) {
  const layout = sanitizeLayoutSeeds(seeds);
  const spacingScale = layout.spacing / 100;
  const gutterScale = layout.pageGutter / 100;
  const baseWidth = WIDTH_BASES[layout.width];
  const hero = HERO_SCALE[layout.heroScale];
  const density = GRID_DENSITY[layout.gridDensity];
  const visualDelta = (layout.heroBalance - 50) / 50;
  const heroTextFr = roundNumber(1 - visualDelta, 2);
  const heroVisualFr = roundNumber(1 + visualDelta, 2);
  const demoLeftFr = roundNumber(1 + visualDelta * 0.72, 2);
  const demoRightFr = roundNumber(2 - demoLeftFr, 2);
  const radius = clampNumber(layout.radius, 0, 24);

  return {
    "--section-padding-x": `clamp(1.25rem, ${roundNumber(
      4 * gutterScale,
      2,
    )}vw, ${roundNumber(3 * gutterScale, 2)}rem)`,
    "--section-padding-y-sm": `${roundNumber(3 * spacingScale, 2)}rem`,
    "--section-padding-y-md": `${roundNumber(5 * spacingScale, 2)}rem`,
    "--section-padding-y-lg": `${roundNumber(6 * spacingScale, 2)}rem`,
    "--section-hero-min-height": hero.minHeight,
    "--brandy-section-default-padding-y": "var(--section-padding-y-md)",
    "--container-sm": `${Math.round(baseWidth * 0.61)}px`,
    "--container-md": `${Math.round(baseWidth * 0.81)}px`,
    "--container-lg": `${Math.round(baseWidth)}px`,
    "--container-xl": `${Math.round(baseWidth * 1.186)}px`,
    "--content-readable-max": `${layout.textWidth}rem`,
    "--brandy-container-default-max-width": "var(--container-lg)",
    "--brandy-grid-default-columns": density.columns,
    "--brandy-split-default-columns": "minmax(0, 1fr) minmax(0, 1fr)",
    "--brandy-cluster-default-justify": "center",
    "--brandy-cluster-default-gap": `var(--space-${Math.max(3, density.stackGapStep - 1)})`,
    "--brandy-stack-default-gap": `var(--space-${density.stackGapStep})`,
    "--hero-grid-text-fr": `${heroTextFr}fr`,
    "--hero-grid-visual-fr": `${heroVisualFr}fr`,
    "--hero-grid-visual-min": hero.visualMin,
    "--hero-headline-max-width": hero.headlineMax,
    "--hero-copy-max-width": hero.headlineMax,
    "--hero-description-max-width": `${HERO_DESCRIPTION_TARGET_WIDTH}rem`,
    "--footer-copy-max-width": `${Math.max(22, layout.textWidth - 12)}rem`,
    "--footer-columns": getFooterColumns(layout.gridDensity),
    "--card-padding": `${roundNumber(1.5 * spacingScale, 2)}rem`,
    "--demo-canvas-left-fr": `${demoLeftFr}fr`,
    "--demo-canvas-right-fr": `${demoRightFr}fr`,
    "--feature-card-min-height": density.cardMinHeight,
    "--step-card-min-height": density.stepCardMinHeight,
    "--faq-trigger-min-height": `${roundNumber(4.5 * spacingScale, 2)}rem`,
    "--radius-sm": `${roundNumber(Math.max(0, radius * 0.5), 2)}px`,
    "--radius-md": `${roundNumber(Math.max(0, radius * 0.75), 2)}px`,
    "--radius-lg": `${roundNumber(radius, 2)}px`,
  };
}

function getFooterColumns(gridDensity) {
  if (gridDensity === "sparse") return "1fr";
  if (gridDensity === "dense") return "1fr 1fr auto";
  return "1.2fr 1fr auto";
}

function sanitizeLayoutRemixSeeds(seeds = {}) {
  const layout = sanitizeLayoutSeeds(seeds);

  return {
    ...layout,
    heroBalance: clampNumber(layout.heroBalance, 40, 60),
    pageGutter: clampNumber(layout.pageGutter, 64, 124),
    spacing: clampNumber(layout.spacing, 60, 124),
    textWidth: clampNumber(layout.textWidth, 24, 48),
  };
}

function layoutPreset(
  spacing,
  radius,
  width,
  pageGutter,
  heroScale,
  heroBalance,
  textWidth,
  gridDensity,
) {
  return {
    gridDensity,
    heroBalance,
    heroScale,
    pageGutter,
    radius,
    spacing,
    textWidth,
    width,
  };
}

function getLayoutJitter(step, cycle, channel, spread) {
  if (cycle === 0) return 0;
  return Math.round((getDeterministicRatio(step, channel) - 0.5) * 2 * spread);
}

function getDeterministicRatio(step, channel) {
  const value = Math.sin((step + 1) * 12.9898 + channel * 78.233) * 43758.5453;
  return value - Math.floor(value);
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

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundNumber(value, decimals = 0) {
  return Number(value.toFixed(decimals));
}
