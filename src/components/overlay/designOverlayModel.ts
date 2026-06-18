export interface DesignOverlayValues {
  autoColorVariants: boolean;
  brandColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  surfaceRaisedColor: string;
  textColor: string;
  sectionSpacing: number;
  radius: number;
  typeScale: number;
  elevation: number;
  containerWidth: number;
  animationDuration: number;
  navbarBlur: number;
  browserHeight: number;
  demoHeight: number;
  browserChromeHeight: number;
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
  autoColorVariants: true,
  brandColor: "#2563eb",
  accentColor: "#0f9f6e",
  backgroundColor: "#ffffff",
  surfaceColor: "#f6f8f7",
  surfaceRaisedColor: "#ffffff",
  textColor: "#111416",
  sectionSpacing: 100,
  radius: 8,
  typeScale: 100,
  elevation: 100,
  containerWidth: 1180,
  animationDuration: 260,
  navbarBlur: 16,
  browserHeight: 496,
  demoHeight: 432,
  browserChromeHeight: 44,
  mutedMode: false,
  highContrast: false,
  reducedMotion: false,
};

export const DESIGN_VALUE_KEYS = Object.keys(
  DEFAULT_DESIGN_OVERLAY_VALUES,
) as Array<keyof DesignOverlayValues>;

export const DESIGN_CSS_VARIABLE_NAMES = [
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
  "--color-nav-bg",
  "--color-footer-muted",
  "--section-padding-x",
  "--section-padding-y-sm",
  "--section-padding-y-md",
  "--section-padding-y-lg",
  "--container-sm",
  "--container-md",
  "--container-lg",
  "--container-xl",
  "--content-readable-max",
  "--font-size-display",
  "--font-size-h1",
  "--font-size-h2",
  "--font-size-h3",
  "--font-size-h4",
  "--font-size-body-lg",
  "--font-size-body",
  "--font-size-caption",
  "--font-size-eyebrow",
  "--radius-sm",
  "--radius-md",
  "--radius-lg",
  "--shadow-soft",
  "--shadow-raised",
  "--duration-fast",
  "--duration-base",
  "--duration-slow",
  "--browser-bar-height",
  "--browser-content-min-height",
  "--demo-frame-min-height",
  "--demo-preview-nav-height",
  "--hero-demo-height",
  "--navbar-blur",
  "--brandy-scroll-behavior",
  "--brandy-marquee-duration",
  "--brandy-animation-play-state",
] as const;

export type DesignCssVariableName = (typeof DESIGN_CSS_VARIABLE_NAMES)[number];
export type DesignCssVariables = Record<DesignCssVariableName, string>;

export const ACCENT_PRESETS = [
  "#0f9f6e",
  "#2563eb",
  "#bf7a18",
  "#dc2626",
  "#7c3aed",
  "#111416",
] as const;

export const BRAND_PRESETS = [
  "#2563eb",
  "#0f9f6e",
  "#0891b2",
  "#4f46e5",
  "#be123c",
  "#111416",
] as const;

export function getDesignCssVariables(
  values: DesignOverlayValues,
): DesignCssVariables {
  const palette = getRenderedPalette(values);
  const spacingScale = values.sectionSpacing / 100;
  const typeScale = values.typeScale / 100;
  const radius = clampNumber(values.radius, 2, 20);
  const elevationScale = values.elevation / 100;
  const baseDuration = values.reducedMotion
    ? 1
    : clampNumber(values.animationDuration, 80, 800);
  const marqueeDuration = values.reducedMotion
    ? "1ms"
    : `${roundNumber(28 * (baseDuration / 260), 1)}s`;
  const containerWidth = clampNumber(values.containerWidth, 960, 1520);
  const browserChromeHeight = clampNumber(values.browserChromeHeight, 32, 60);

  return {
    "--white": palette.surfaceRaised,
    "--ink-950": palette.text,
    "--ink-800": palette.strongText,
    "--ink-600": palette.muted,
    "--ink-500": palette.subtleText,
    "--mist-100": palette.surface,
    "--mist-200": palette.surfaceStrong,
    "--mist-300": palette.border,
    "--green-600": palette.accent,
    "--green-700": palette.accentHover,
    "--green-100": palette.accentSoft,
    "--blue-600": palette.brand,
    "--blue-100": palette.brandSoft,
    "--color-bg": palette.background,
    "--color-surface": palette.surface,
    "--color-surface-raised": palette.surfaceRaised,
    "--color-surface-strong": palette.surfaceStrong,
    "--color-text": palette.text,
    "--color-muted": palette.muted,
    "--color-border": palette.border,
    "--color-accent": palette.accent,
    "--color-accent-hover": palette.accentHover,
    "--color-accent-soft": palette.accentSoft,
    "--color-accent-border": palette.accentBorder,
    "--color-blue": palette.brand,
    "--color-blue-soft": palette.brandSoft,
    "--color-nav-bg": palette.navBackground,
    "--color-footer-muted": palette.footerMuted,
    "--section-padding-x": `clamp(1rem, ${roundNumber(
      4 * spacingScale,
      2,
    )}vw, ${roundNumber(3 * spacingScale, 2)}rem)`,
    "--section-padding-y-sm": `${roundNumber(3 * spacingScale, 2)}rem`,
    "--section-padding-y-md": `${roundNumber(5 * spacingScale, 2)}rem`,
    "--section-padding-y-lg": `${roundNumber(6 * spacingScale, 2)}rem`,
    "--container-sm": `${Math.round(containerWidth * 0.61)}px`,
    "--container-md": `${Math.round(containerWidth * 0.81)}px`,
    "--container-lg": `${Math.round(containerWidth)}px`,
    "--container-xl": `${Math.round(containerWidth * 1.186)}px`,
    "--content-readable-max": "calc(var(--container-sm) + 40px)",
    "--font-size-display": `${roundNumber(5.875 * typeScale, 4)}rem`,
    "--font-size-h1": `${roundNumber(3.6875 * typeScale, 4)}rem`,
    "--font-size-h2": `${roundNumber(2.9375 * typeScale, 4)}rem`,
    "--font-size-h3": `${roundNumber(2.0625 * typeScale, 4)}rem`,
    "--font-size-h4": `${roundNumber(1.5 * typeScale, 4)}rem`,
    "--font-size-body-lg": `${roundNumber(1.25 * typeScale, 4)}rem`,
    "--font-size-body": `${roundNumber(1 * typeScale, 3)}rem`,
    "--font-size-caption": `${roundNumber(0.75 * typeScale, 4)}rem`,
    "--font-size-eyebrow": `${roundNumber(0.625 * typeScale, 4)}rem`,
    "--radius-sm": `${roundNumber(Math.max(2, radius * 0.5), 2)}px`,
    "--radius-md": `${roundNumber(Math.max(3, radius * 0.75), 2)}px`,
    "--radius-lg": `${roundNumber(radius, 2)}px`,
    "--shadow-soft": getShadowValue(20, 60, 0.08, elevationScale),
    "--shadow-raised": getShadowValue(32, 100, 0.12, elevationScale),
    "--duration-fast": `${Math.max(1, Math.round(baseDuration * 0.62))}ms`,
    "--duration-base": `${Math.max(1, Math.round(baseDuration))}ms`,
    "--duration-slow": `${Math.max(1, Math.round(baseDuration * 1.92))}ms`,
    "--browser-bar-height": `${browserChromeHeight}px`,
    "--browser-content-min-height": `${clampNumber(
      values.browserHeight,
      360,
      720,
    )}px`,
    "--demo-frame-min-height": `${clampNumber(values.demoHeight, 320, 640)}px`,
    "--demo-preview-nav-height": `${Math.max(32, browserChromeHeight - 8)}px`,
    "--hero-demo-height": `${clampNumber(values.browserHeight, 360, 720)}px`,
    "--navbar-blur": `${clampNumber(values.navbarBlur, 0, 28)}px`,
    "--brandy-scroll-behavior": values.reducedMotion ? "auto" : "smooth",
    "--brandy-marquee-duration": marqueeDuration,
    "--brandy-animation-play-state": values.reducedMotion ? "paused" : "running",
  };
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

export function normalizeHexColor(value: string): string {
  const withHash = value.trim().startsWith("#")
    ? value.trim()
    : `#${value.trim()}`;

  if (/^#[0-9a-f]{3}$/i.test(withHash)) {
    const [, r, g, b] = withHash;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  if (/^#[0-9a-f]{6}$/i.test(withHash)) {
    return withHash.toLowerCase();
  }

  return "#000000";
}

export function isHexColor(value: string): boolean {
  const withHash = value.trim().startsWith("#")
    ? value.trim()
    : `#${value.trim()}`;

  return /^#[0-9a-f]{3}$|^#[0-9a-f]{6}$/i.test(withHash);
}

export interface DerivedColorVariants {
  base: string;
  border: string;
  dark: string;
  hover: string;
  light: string;
  soft: string;
}

export function getDerivedColorVariants(
  color: string,
  surfaceColor = "#ffffff",
  options: { highContrast?: boolean; preferDarkerHover?: boolean } = {},
): DerivedColorVariants {
  const base = normalizeHexColor(color);
  const surface = normalizeHexColor(surfaceColor);
  const preferDarkerHover =
    options.preferDarkerHover ?? getRelativeLuminance(surface) > 0.5;
  const contrastColor = preferDarkerHover ? "#000000" : "#ffffff";
  const contrastWeight = options.highContrast ? 0.28 : 0.18;

  return {
    base,
    border: withAlpha(base, options.highContrast ? 0.62 : 0.3),
    dark: mixHex(base, "#000000", options.highContrast ? 0.32 : 0.24),
    hover: mixHex(base, contrastColor, contrastWeight),
    light: mixHex(base, "#ffffff", options.highContrast ? 0.64 : 0.78),
    soft: mixHex(base, surface, options.highContrast ? 0.72 : 0.86),
  };
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

function getRenderedPalette(values: DesignOverlayValues) {
  const background = normalizeHexColor(values.backgroundColor);
  const backgroundIsLight = getRelativeLuminance(background) > 0.5;
  const contrastText = backgroundIsLight ? "#050708" : "#f8fafc";
  const rawText = values.highContrast
    ? contrastText
    : values.autoColorVariants
      ? getReadableTextColor(background)
      : normalizeHexColor(values.textColor);
  const automaticSurface = mixHex(
    rawText,
    background,
    backgroundIsLight ? 0.96 : 0.86,
  );
  const automaticRaisedSurface = mixHex(
    rawText,
    background,
    backgroundIsLight ? 0.995 : 0.92,
  );
  const surfaceRaised = values.autoColorVariants
    ? automaticRaisedSurface
    : normalizeHexColor(values.surfaceRaisedColor);
  const surface = values.mutedMode
    ? mixHex(
        values.autoColorVariants
          ? automaticSurface
          : normalizeHexColor(values.surfaceColor),
        background,
        0.45,
      )
    : values.autoColorVariants
      ? automaticSurface
      : normalizeHexColor(values.surfaceColor);
  const accent = values.mutedMode
    ? mixHex(normalizeHexColor(values.accentColor), rawText, 0.18)
    : normalizeHexColor(values.accentColor);
  const brand = values.mutedMode
    ? mixHex(normalizeHexColor(values.brandColor), rawText, 0.16)
    : normalizeHexColor(values.brandColor);
  const accentVariants = getDerivedColorVariants(accent, surfaceRaised, {
    highContrast: values.highContrast,
    preferDarkerHover: backgroundIsLight,
  });
  const brandVariants = getDerivedColorVariants(brand, surfaceRaised, {
    highContrast: values.highContrast,
    preferDarkerHover: backgroundIsLight,
  });

  return {
    accent,
    accentBorder: accentVariants.border,
    accentHover: accentVariants.hover,
    accentSoft: accentVariants.soft,
    background,
    border: mixHex(rawText, background, values.highContrast ? 0.55 : 0.84),
    brand,
    brandSoft: brandVariants.soft,
    footerMuted: withAlpha(background, values.highContrast ? 0.86 : 0.72),
    muted: mixHex(rawText, background, values.highContrast ? 0.28 : 0.42),
    navBackground: withAlpha(surfaceRaised, values.highContrast ? 0.94 : 0.86),
    surface,
    surfaceRaised,
    strongText: mixHex(rawText, background, values.highContrast ? 0.08 : 0.14),
    subtleText: mixHex(rawText, background, values.highContrast ? 0.36 : 0.5),
    surfaceStrong: mixHex(rawText, surface, values.highContrast ? 0.82 : 0.93),
    text: rawText,
  };
}

function getReadableTextColor(background: string): string {
  const lightBackground = getRelativeLuminance(background) > 0.5;
  return lightBackground
    ? mixHex(background, "#000000", 0.92)
    : mixHex(background, "#ffffff", 0.92);
}

function getShadowValue(
  y: number,
  blur: number,
  alpha: number,
  scale: number,
): string {
  if (scale <= 0) return "none";

  const shadowAlpha = clampNumber(alpha * scale, 0.02, 0.22);
  return `0 ${roundNumber(y * scale, 1)}px ${roundNumber(
    blur * scale,
    1,
  )}px rgba(17, 20, 22, ${roundNumber(shadowAlpha, 3)})`;
}

function mixHex(start: string, end: string, endWeight: number): string {
  const startRgb = hexToRgb(start);
  const endRgb = hexToRgb(end);
  const weight = clampNumber(endWeight, 0, 1);
  const mixed = startRgb.map((channel, index) =>
    Math.round(channel * (1 - weight) + endRgb[index] * weight),
  ) as [number, number, number];

  return rgbToHex(mixed);
}

function withAlpha(hex: string, alpha: number): string {
  const [red, green, blue] = hexToRgb(hex);
  return `rgba(${red}, ${green}, ${blue}, ${roundNumber(
    clampNumber(alpha, 0, 1),
    3,
  )})`;
}

function getRelativeLuminance(hex: string): number {
  const [red, green, blue] = hexToRgb(hex).map((channel) => {
    const scaled = channel / 255;
    return scaled <= 0.03928
      ? scaled / 12.92
      : ((scaled + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = normalizeHexColor(hex).slice(1);
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function rgbToHex([red, green, blue]: [number, number, number]): string {
  return `#${[red, green, blue]
    .map((channel) => clampNumber(channel, 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;
}
