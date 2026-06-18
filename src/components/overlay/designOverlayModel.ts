import {
  generateBrandThemeTokens,
  isHexColor,
  normalizeHexColor,
  sanitizeBrandSeeds,
  type BrandSeeds,
} from "../../lib/brandTheme.mjs";
import {
  generateLayoutThemeTokens,
  sanitizeLayoutSeeds,
  type GridDensity,
  type HeroScale,
  type LayoutSeeds,
  type LayoutWidth,
} from "../../lib/layoutTheme.mjs";
import {
  generateTypographyThemeTokens,
  sanitizeTypographySeeds,
  type TypographyPairing,
  type TypographySeeds,
  type TypographyStyle,
} from "../../lib/typographyTheme.mjs";

export { isHexColor, normalizeHexColor };

export interface DesignOverlayValues {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  highlightColor: string;
  sectionSpacing: number;
  radius: number;
  pageWidth: LayoutWidth;
  pageGutter: number;
  heroScale: HeroScale;
  heroBalance: number;
  textWidth: number;
  gridDensity: GridDensity;
  typographyStyle: TypographyStyle;
  typographyPairing: TypographyPairing;
  typographyScale: number;
  typographyDensity: number;
  typographyWeight: number;
  headlineStyle: number;
  typographyTightness: number;
  elevation: number;
  animationDuration: number;
  navbarBlur: number;
  darkMode: boolean;
  mutedMode: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

export type DesignOverlayGroupKey =
  | "palette"
  | "layout"
  | "typography"
  | "motion"
  | "preview"
  | "modes";

export const DESIGN_OVERLAY_STORAGE_KEY = "brandy:design-overlay:v1";

export const DEFAULT_DESIGN_OVERLAY_VALUES: DesignOverlayValues = {
  primaryColor: "#635bff",
  secondaryColor: "#00d4ff",
  accentColor: "#ff6b35",
  highlightColor: "#fde68a",
  sectionSpacing: 70,
  radius: 2,
  pageWidth: "standard",
  pageGutter: 70,
  heroScale: "immersive",
  heroBalance: 57,
  textWidth: 38,
  gridDensity: "balanced",
  typographyStyle: "geometric",
  typographyPairing: "display_plus_text",
  typographyScale: 70,
  typographyDensity: 60,
  typographyWeight: 60,
  headlineStyle: 60,
  typographyTightness: 50,
  elevation: 100,
  animationDuration: 260,
  navbarBlur: 28,
  darkMode: false,
  mutedMode: false,
  highContrast: false,
  reducedMotion: false,
};

export const DESIGN_VALUE_KEYS = Object.keys(
  DEFAULT_DESIGN_OVERLAY_VALUES,
) as Array<keyof DesignOverlayValues>;

const BRAND_SCALE_VARIABLE_NAMES = [
  "--brand-primary-50",
  "--brand-primary-100",
  "--brand-primary-200",
  "--brand-primary-300",
  "--brand-primary-400",
  "--brand-primary-500",
  "--brand-primary-600",
  "--brand-primary-700",
  "--brand-primary-800",
  "--brand-primary-900",
  "--brand-primary-950",
  "--brand-secondary-50",
  "--brand-secondary-100",
  "--brand-secondary-200",
  "--brand-secondary-300",
  "--brand-secondary-400",
  "--brand-secondary-500",
  "--brand-secondary-600",
  "--brand-secondary-700",
  "--brand-secondary-800",
  "--brand-secondary-900",
  "--brand-secondary-950",
  "--brand-accent-50",
  "--brand-accent-100",
  "--brand-accent-200",
  "--brand-accent-300",
  "--brand-accent-400",
  "--brand-accent-500",
  "--brand-accent-600",
  "--brand-accent-700",
  "--brand-accent-800",
  "--brand-accent-900",
  "--brand-accent-950",
  "--brand-highlight-50",
  "--brand-highlight-100",
  "--brand-highlight-200",
  "--brand-highlight-300",
  "--brand-highlight-400",
  "--brand-highlight-500",
  "--brand-highlight-600",
  "--brand-highlight-700",
  "--brand-highlight-800",
  "--brand-highlight-900",
  "--brand-highlight-950",
  "--neutral-50",
  "--neutral-100",
  "--neutral-200",
  "--neutral-300",
  "--neutral-400",
  "--neutral-500",
  "--neutral-600",
  "--neutral-700",
  "--neutral-800",
  "--neutral-900",
  "--neutral-950",
] as const;

export const DESIGN_CSS_VARIABLE_NAMES = [
  ...BRAND_SCALE_VARIABLE_NAMES,
  "--white",
  "--ink-950",
  "--ink-800",
  "--ink-600",
  "--ink-500",
  "--mist-100",
  "--mist-200",
  "--mist-300",
  "--green-600",
  "--green-700",
  "--green-100",
  "--blue-600",
  "--blue-100",
  "--amber-500",
  "--color-bg",
  "--color-surface",
  "--color-surface-raised",
  "--color-surface-strong",
  "--color-text",
  "--color-muted",
  "--color-border",
  "--color-accent",
  "--color-accent-hover",
  "--color-accent-soft",
  "--color-accent-border",
  "--color-blue",
  "--color-blue-soft",
  "--color-on-accent",
  "--color-highlight",
  "--color-highlight-soft",
  "--color-on-highlight",
  "--color-warning",
  "--color-success",
  "--color-error",
  "--color-info",
  "--button-primary-bg",
  "--button-primary-hover",
  "--button-primary-text",
  "--button-secondary-bg",
  "--button-secondary-hover",
  "--button-secondary-text",
  "--button-secondary-border",
  "--link-color",
  "--link-hover",
  "--focus-ring",
  "--gradient-hero-start",
  "--gradient-hero-end",
  "--gradient-hero-accent",
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--badge-brand-bg",
  "--badge-brand-text",
  "--badge-brand-border",
  "--badge-highlight-bg",
  "--badge-highlight-text",
  "--badge-highlight-border",
  "--shadow-brand",
  "--dark-color-bg",
  "--dark-color-surface",
  "--dark-color-text",
  "--dark-color-border",
  "--color-nav-bg",
  "--color-footer-muted",
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
  "--button-font-size",
  "--button-font-weight",
  "--badge-font-weight",
  "--navbar-link-font-size",
  "--demo-layer-font-size",
  "--font-family-heading",
  "--font-family-body",
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
  "--radius-sm",
  "--radius-md",
  "--radius-lg",
  "--card-padding",
  "--shadow-soft",
  "--shadow-raised",
  "--duration-fast",
  "--duration-base",
  "--duration-slow",
  "--demo-canvas-left-fr",
  "--demo-canvas-right-fr",
  "--feature-card-min-height",
  "--step-card-min-height",
  "--faq-trigger-min-height",
  "--navbar-blur",
  "--brandy-scroll-behavior",
  "--brandy-marquee-duration",
  "--brandy-animation-play-state",
] as const;

export type DesignCssVariableName = (typeof DESIGN_CSS_VARIABLE_NAMES)[number];
export type DesignCssVariables = Record<DesignCssVariableName, string>;

export const ACCENT_PRESETS = [
  "#ff6b35",
  "#f97316",
  "#ec4899",
  "#f43f5e",
  "#a855f7",
  "#14b8a6",
] as const;

export const HIGHLIGHT_PRESETS = [
  "#fde68a",
  "#fef08a",
  "#bbf7d0",
  "#bae6fd",
  "#ddd6fe",
  "#fecdd3",
] as const;

export const PRIMARY_PRESETS = [
  "#635bff",
  "#2563eb",
  "#0f9f6e",
  "#7c3aed",
  "#be123c",
  "#111416",
] as const;

export const SECONDARY_PRESETS = [
  "#00d4ff",
  "#0891b2",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#64748b",
] as const;

export function getDesignBrandSeeds(values: DesignOverlayValues): BrandSeeds {
  return sanitizeBrandSeeds({
    accent: values.accentColor,
    highlight: values.highlightColor,
    primary: values.primaryColor,
    secondary: values.secondaryColor,
  });
}

export function getDesignLayoutSeeds(values: DesignOverlayValues): LayoutSeeds {
  return sanitizeLayoutSeeds({
    gridDensity: values.gridDensity,
    heroBalance: values.heroBalance,
    heroScale: values.heroScale,
    pageGutter: values.pageGutter,
    radius: values.radius,
    spacing: values.sectionSpacing,
    textWidth: values.textWidth,
    width: values.pageWidth,
  });
}

export function getDesignTypographySeeds(
  values: DesignOverlayValues,
): TypographySeeds {
  return sanitizeTypographySeeds({
    density: values.typographyDensity,
    headlineStyle: values.headlineStyle,
    pairing: values.typographyPairing,
    scale: values.typographyScale,
    style: values.typographyStyle,
    tightness: values.typographyTightness,
    weight: values.typographyWeight,
  });
}

export function getDesignCssVariables(
  values: DesignOverlayValues,
): DesignCssVariables {
  const elevationScale = values.elevation / 100;
  const brandTokens = generateBrandThemeTokens(getDesignBrandSeeds(values), {
    darkMode: values.darkMode,
    elevationScale,
    highContrast: values.highContrast,
    mutedMode: values.mutedMode,
  });
  const layoutTokens = generateLayoutThemeTokens(getDesignLayoutSeeds(values));
  const typographyTokens = generateTypographyThemeTokens(
    getDesignTypographySeeds(values),
  );
  const baseDuration = values.reducedMotion
    ? 1
    : clampNumber(values.animationDuration, 80, 800);
  const marqueeDuration = values.reducedMotion
    ? "1ms"
    : `${roundNumber(28 * (baseDuration / 260), 1)}s`;

  return {
    ...brandTokens,
    ...layoutTokens,
    ...typographyTokens,
    "--duration-fast": `${Math.max(1, Math.round(baseDuration * 0.62))}ms`,
    "--duration-base": `${Math.max(1, Math.round(baseDuration))}ms`,
    "--duration-slow": `${Math.max(1, Math.round(baseDuration * 1.92))}ms`,
    "--navbar-blur": `${clampNumber(values.navbarBlur, 0, 28)}px`,
    "--brandy-scroll-behavior": values.reducedMotion ? "auto" : "smooth",
    "--brandy-marquee-duration": marqueeDuration,
    "--brandy-animation-play-state": values.reducedMotion ? "paused" : "running",
  } as DesignCssVariables;
}

export function areDesignValuesEqual(
  left: DesignOverlayValues,
  right: DesignOverlayValues,
): boolean {
  return DESIGN_VALUE_KEYS.every((key) => left[key] === right[key]);
}

export function getDesignValueDiff(
  values: DesignOverlayValues,
  defaults: DesignOverlayValues,
): Partial<DesignOverlayValues> {
  return DESIGN_VALUE_KEYS.reduce<Partial<DesignOverlayValues>>((diff, key) => {
    if (values[key] !== defaults[key]) {
      return { ...diff, [key]: values[key] };
    }

    return diff;
  }, {});
}

export function readStoredDesignValues(
  defaults: DesignOverlayValues,
  storage: Storage | undefined = getBrowserStorage(),
): DesignOverlayValues {
  if (!storage) return defaults;

  try {
    const raw = storage.getItem(DESIGN_OVERLAY_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<DesignOverlayValues>;

    return {
      ...defaults,
      ...sanitizeDesignValuePatch(parsed),
    };
  } catch {
    return defaults;
  }
}

export function persistDesignValueDiff(
  values: DesignOverlayValues,
  defaults: DesignOverlayValues,
  storage: Storage | undefined = getBrowserStorage(),
) {
  if (!storage) return;

  const diff = getDesignValueDiff(values, defaults);
  if (Object.keys(diff).length === 0) {
    storage.removeItem(DESIGN_OVERLAY_STORAGE_KEY);
    return;
  }

  storage.setItem(DESIGN_OVERLAY_STORAGE_KEY, JSON.stringify(diff));
}

export function formatSettingNumber(value: number, step: number): string {
  const precision = getStepPrecision(step);
  return precision > 0 ? value.toFixed(precision) : String(Math.round(value));
}

export function snapToStep(
  value: number,
  step: number,
  min: number,
  max: number,
): number {
  const snapped = Math.round((value - min) / step) * step + min;
  const precision = getStepPrecision(step);
  return Number(clampNumber(snapped, min, max).toFixed(precision));
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function sanitizeDesignValuePatch(
  patch: Partial<DesignOverlayValues>,
): Partial<DesignOverlayValues> {
  const clean: Partial<DesignOverlayValues> = {};

  for (const key of DESIGN_VALUE_KEYS) {
    const value = patch[key];
    if (value == null) continue;

    if (typeof DEFAULT_DESIGN_OVERLAY_VALUES[key] === typeof value) {
      Object.assign(clean, { [key]: value });
    }
  }

  return clean;
}

function getBrowserStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
}

function getStepPrecision(step: number): number {
  return step.toString().split(".")[1]?.length ?? 0;
}

function roundNumber(value: number, decimals = 0): number {
  return Number(value.toFixed(decimals));
}
