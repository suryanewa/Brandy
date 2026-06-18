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

const WIDTH_BASES = {
  narrow: 960,
  standard: 1120,
  wide: 1328,
  full: 1520,
};
const HERO_SCALE = {
  compact: {
    headlineMax: "16ch",
    minHeight: "62svh",
    visualMin: "22rem",
  },
  balanced: {
    headlineMax: "12ch",
    minHeight: "70svh",
    visualMin: "26rem",
  },
  immersive: {
    headlineMax: "9ch",
    minHeight: "78svh",
    visualMin: "28rem",
  },
};
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
    textWidth: snapNumber(seeds.textWidth, 28, 52, 1, DEFAULT_LAYOUT_SEEDS.textWidth),
    gridDensity: sanitizeEnum(
      seeds.gridDensity,
      GRID_DENSITY_OPTIONS,
      DEFAULT_LAYOUT_SEEDS.gridDensity,
    ),
  };
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
    "--section-padding-x": `clamp(1rem, ${roundNumber(
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
    "--hero-description-max-width": `${layout.textWidth}rem`,
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
