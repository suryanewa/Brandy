export const BRAND_SEED_KEYS = ["primary", "secondary", "accent", "highlight"];

export const DEFAULT_BRAND_SEEDS = {
  primary: "#635bff",
  secondary: "#00d4ff",
  accent: "#ff6b35",
  highlight: "#fde68a",
};

const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const SUCCESS_BASE = "#16a34a";
const WARNING_BASE = "#d97706";
const ERROR_BASE = "#dc2626";
const INFO_BASE = "#2563eb";

export const BRAND_GENERATED_TOKEN_NAMES = [
  ...["primary", "secondary", "accent", "highlight"].flatMap((name) =>
    SCALE_STEPS.map((step) => `--brand-${name}-${step}`),
  ),
  ...SCALE_STEPS.map((step) => `--neutral-${step}`),
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
  "--shadow-soft",
  "--shadow-raised",
  "--shadow-brand",
  "--dark-color-bg",
  "--dark-color-surface",
  "--dark-color-text",
  "--dark-color-border",
  "--color-nav-bg",
  "--color-footer-muted",
];

export function sanitizeBrandSeeds(seeds = {}) {
  return {
    primary: normalizeHexColor(seeds.primary ?? DEFAULT_BRAND_SEEDS.primary),
    secondary: normalizeHexColor(seeds.secondary ?? DEFAULT_BRAND_SEEDS.secondary),
    accent: normalizeHexColor(seeds.accent ?? DEFAULT_BRAND_SEEDS.accent),
    highlight: normalizeHexColor(seeds.highlight ?? DEFAULT_BRAND_SEEDS.highlight),
  };
}

export function generateBrandThemeTokens(seeds = {}, options = {}) {
  const normalizedSeeds = sanitizeBrandSeeds(seeds);
  const primary = generateColorScale(normalizedSeeds.primary);
  const secondary = generateColorScale(normalizedSeeds.secondary);
  const accent = generateColorScale(normalizedSeeds.accent);
  const highlight = generateColorScale(normalizedSeeds.highlight);
  const neutral = generateNeutralScale(normalizedSeeds.primary);
  const darkMode = options.darkMode === true;
  const background = darkMode ? neutral[950] : neutral[50];
  const surface = darkMode
    ? mixHex(neutral[950], primary[900], 0.24)
    : mixHex(neutral[50], primary[50], 0.3);
  const surfaceRaised = darkMode ? mixHex(neutral[900], primary[800], 0.16) : "#ffffff";
  const surfaceStrong = darkMode ? mixHex(neutral[900], primary[800], 0.28) : neutral[100];
  const text = darkMode
    ? neutral[50]
    : options.highContrast
      ? neutral[950]
      : mixHex(neutral[950], "#000000", 0.08);
  const muted = darkMode ? mixHex(neutral[300], neutral[50], 0.18) : neutral[600];
  const subtleText = darkMode ? neutral[300] : neutral[500];
  const border = darkMode
    ? withAlpha(primary[300], options.highContrast ? 0.36 : 0.22)
    : options.highContrast
      ? neutral[400]
      : neutral[200];
  const primaryAction = options.mutedMode
    ? mixHex(primary[600], neutral[900], 0.14)
    : darkMode
      ? primary[500]
      : primary[600];
  const secondaryAction =
    options.mutedMode
      ? mixHex(secondary[600], neutral[900], 0.14)
      : darkMode
        ? secondary[500]
        : secondary[600];
  const accentAction = options.mutedMode
    ? mixHex(accent[600], neutral[900], 0.12)
    : darkMode
      ? accent[500]
      : accent[600];
  const elevationScale = clampNumber(options.elevationScale ?? 1, 0, 2);
  const primaryHover = darkMode ? primary[400] : primary[700];
  const secondaryButtonBg = darkMode ? withAlpha(secondary[400], 0.14) : secondary[50];
  const secondaryButtonHover = darkMode ? withAlpha(secondary[400], 0.22) : secondary[100];
  const secondaryButtonText = darkMode ? secondary[100] : secondary[800];
  const secondaryButtonBorder = darkMode ? withAlpha(secondary[300], 0.34) : secondary[200];
  const brandBadgeBg = darkMode ? withAlpha(primary[400], 0.16) : primary[100];
  const brandBadgeText = darkMode ? primary[100] : primary[700];
  const brandBadgeBorder = darkMode ? withAlpha(primary[300], 0.26) : primary[200];
  const highlightSoft = darkMode ? withAlpha(highlight[300], 0.16) : highlight[100];
  const highlightText = darkMode ? highlight[100] : highlight[800];

  return {
    ...prefixScale("--brand-primary", primary),
    ...prefixScale("--brand-secondary", secondary),
    ...prefixScale("--brand-accent", accent),
    ...prefixScale("--brand-highlight", highlight),
    ...prefixScale("--neutral", neutral),
    "--white": surfaceRaised,
    "--ink-950": text,
    "--ink-800": neutral[800],
    "--ink-600": muted,
    "--ink-500": subtleText,
    "--mist-100": surface,
    "--mist-200": surfaceStrong,
    "--mist-300": border,
    "--green-600": primaryAction,
    "--green-700": primaryHover,
    "--green-100": brandBadgeBg,
    "--blue-600": secondaryAction,
    "--blue-100": secondaryButtonHover,
    "--amber-500": harmonizeSemanticColor(WARNING_BASE, normalizedSeeds.accent),
    "--color-bg": background,
    "--color-surface": surface,
    "--color-surface-raised": surfaceRaised,
    "--color-surface-strong": surfaceStrong,
    "--color-text": text,
    "--color-muted": muted,
    "--color-border": border,
    "--color-accent": primaryAction,
    "--color-accent-hover": primaryHover,
    "--color-accent-soft": brandBadgeBg,
    "--color-accent-border": withAlpha(
      primary[500],
      darkMode ? 0.48 : options.highContrast ? 0.62 : 0.32,
    ),
    "--color-blue": secondaryAction,
    "--color-blue-soft": secondaryButtonHover,
    "--color-on-accent": getContrastText(primaryAction),
    "--color-highlight": darkMode ? highlight[300] : highlight[400],
    "--color-highlight-soft": highlightSoft,
    "--color-on-highlight": darkMode ? getContrastText(highlight[300]) : getContrastText(highlight[300]),
    "--color-warning": "var(--amber-500)",
    "--color-success": harmonizeSemanticColor(SUCCESS_BASE, normalizedSeeds.primary),
    "--color-error": harmonizeSemanticColor(ERROR_BASE, normalizedSeeds.accent),
    "--color-info": harmonizeSemanticColor(INFO_BASE, normalizedSeeds.primary),
    "--button-primary-bg": primaryAction,
    "--button-primary-hover": primaryHover,
    "--button-primary-text": getContrastText(primaryAction),
    "--button-secondary-bg": secondaryButtonBg,
    "--button-secondary-hover": secondaryButtonHover,
    "--button-secondary-text": secondaryButtonText,
    "--button-secondary-border": secondaryButtonBorder,
    "--link-color": darkMode ? primary[300] : primary[700],
    "--link-hover": darkMode ? primary[200] : primary[800],
    "--focus-ring": darkMode ? primary[300] : primary[400],
    "--gradient-hero-start": darkMode ? primary[700] : primary[600],
    "--gradient-hero-end": secondary[500],
    "--gradient-hero-accent": accentAction,
    "--chart-1": primary[600],
    "--chart-2": secondary[600],
    "--chart-3": accentAction,
    "--chart-4": highlight[500],
    "--badge-brand-bg": brandBadgeBg,
    "--badge-brand-text": brandBadgeText,
    "--badge-brand-border": brandBadgeBorder,
    "--badge-highlight-bg": highlightSoft,
    "--badge-highlight-text": highlightText,
    "--badge-highlight-border": darkMode ? withAlpha(highlight[300], 0.24) : highlight[200],
    "--shadow-soft": getShadowValue(neutral[950], 20, 60, 0.08, elevationScale),
    "--shadow-raised": getShadowValue(neutral[950], 32, 100, 0.12, elevationScale),
    "--shadow-brand": getShadowValue(primary[600], 28, 84, 0.18, elevationScale),
    "--dark-color-bg": neutral[950],
    "--dark-color-surface": mixHex(neutral[950], primary[900], 0.24),
    "--dark-color-text": neutral[50],
    "--dark-color-border": withAlpha(primary[300], 0.22),
    "--color-nav-bg": darkMode
      ? withAlpha(surfaceRaised, options.highContrast ? 0.96 : 0.9)
      : withAlpha(surfaceRaised, options.highContrast ? 0.96 : 0.9),
    "--color-footer-muted": withAlpha(neutral[50], options.highContrast ? 0.9 : 0.76),
  };
}

export function normalizeHexColor(value) {
  const withHash = String(value).trim().startsWith("#")
    ? String(value).trim()
    : `#${String(value).trim()}`;

  if (/^#[0-9a-f]{3}$/i.test(withHash)) {
    const [, r, g, b] = withHash;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  if (/^#[0-9a-f]{6}$/i.test(withHash)) {
    return withHash.toLowerCase();
  }

  return "#000000";
}

export function isHexColor(value) {
  const withHash = String(value).trim().startsWith("#")
    ? String(value).trim()
    : `#${String(value).trim()}`;

  return /^#[0-9a-f]{3}$|^#[0-9a-f]{6}$/i.test(withHash);
}

function generateColorScale(seed) {
  const base = normalizeHexColor(seed);

  return {
    50: mixHex(base, "#ffffff", 0.94),
    100: mixHex(base, "#ffffff", 0.86),
    200: mixHex(base, "#ffffff", 0.74),
    300: mixHex(base, "#ffffff", 0.58),
    400: mixHex(base, "#ffffff", 0.32),
    500: base,
    600: mixHex(base, "#000000", 0.12),
    700: mixHex(base, "#000000", 0.26),
    800: mixHex(base, "#000000", 0.42),
    900: mixHex(base, "#000000", 0.62),
    950: mixHex(base, "#000000", 0.78),
  };
}

function generateNeutralScale(primarySeed) {
  const brand = normalizeHexColor(primarySeed);

  return {
    50: mixHex(brand, "#ffffff", 0.97),
    100: mixHex(brand, "#ffffff", 0.92),
    200: mixHex(brand, "#ffffff", 0.84),
    300: mixHex(brand, "#ffffff", 0.72),
    400: mixHex(brand, "#ffffff", 0.56),
    500: mixHex(brand, "#334155", 0.72),
    600: mixHex(brand, "#1f2937", 0.78),
    700: mixHex(brand, "#111827", 0.82),
    800: mixHex(brand, "#0f172a", 0.88),
    900: mixHex(brand, "#080b12", 0.9),
    950: mixHex(brand, "#020407", 0.94),
  };
}

function prefixScale(prefix, scale) {
  return Object.fromEntries(
    SCALE_STEPS.map((step) => [`${prefix}-${step}`, scale[step]]),
  );
}

function harmonizeSemanticColor(base, seed) {
  return mixHex(base, seed, 0.08);
}

function getContrastText(background) {
  return getContrastRatio("#ffffff", background) >= 4.5 ? "#ffffff" : "#111416";
}

function getShadowValue(color, y, blur, alpha, scale) {
  if (scale <= 0) return "none";

  const [red, green, blue] = hexToRgb(color);
  const shadowAlpha = clampNumber(alpha * scale, 0.02, 0.24);
  return `0 ${roundNumber(y * scale, 1)}px ${roundNumber(
    blur * scale,
    1,
  )}px rgba(${red}, ${green}, ${blue}, ${roundNumber(shadowAlpha, 3)})`;
}

function getContrastRatio(foreground, background) {
  const light = getRelativeLuminance(foreground);
  const dark = getRelativeLuminance(background);
  const lighter = Math.max(light, dark);
  const darker = Math.min(light, dark);

  return (lighter + 0.05) / (darker + 0.05);
}

function mixHex(start, end, endWeight) {
  const startRgb = hexToRgb(start);
  const endRgb = hexToRgb(end);
  const weight = clampNumber(endWeight, 0, 1);
  const mixed = startRgb.map((channel, index) =>
    Math.round(channel * (1 - weight) + endRgb[index] * weight),
  );

  return rgbToHex(mixed);
}

function withAlpha(hex, alpha) {
  const [red, green, blue] = hexToRgb(hex);
  return `rgba(${red}, ${green}, ${blue}, ${roundNumber(
    clampNumber(alpha, 0, 1),
    3,
  )})`;
}

function getRelativeLuminance(hex) {
  const [red, green, blue] = hexToRgb(hex).map((channel) => {
    const scaled = channel / 255;
    return scaled <= 0.03928
      ? scaled / 12.92
      : ((scaled + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function hexToRgb(hex) {
  const normalized = normalizeHexColor(hex).slice(1);
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function rgbToHex([red, green, blue]) {
  return `#${[red, green, blue]
    .map((channel) => clampNumber(channel, 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundNumber(value, decimals = 0) {
  return Number(value.toFixed(decimals));
}
