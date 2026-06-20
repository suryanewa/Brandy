export const BRAND_SEED_KEYS = ["primary", "secondary", "accent", "highlight"];

export const DEFAULT_BRAND_SEEDS = {
  primary: "#635bff",
  secondary: "#00d4ff",
  accent: "#ff6b35",
  highlight: "#fde68a",
};

export const BRAND_DERIVATION_KEYS = [
  "backgroundDistancePercent",
  "borderDistancePercent",
  "buttonPrimaryBgDistancePercent",
  "buttonSecondaryBorderDistancePercent",
  "buttonSecondaryHoverDistancePercent",
  "linkColorDistancePercent",
  "linkHoverDistancePercent",
  "primaryHoverDistancePercent",
  "footerBackgroundDistancePercent",
  "footerBorderDistancePercent",
  "secondarySurfaceDistancePercent",
  "accentMomentDistancePercent",
  "highlightSoftDistancePercent",
  "neutralSurfaceDistancePercent",
  "readableTextDistancePercent",
  "secondaryTextDistancePercent",
  "navbarBackgroundDistancePercent",
  "navbarBorderDistancePercent",
];

export const DEFAULT_BRAND_DERIVATION_CONTROLS = {
  backgroundDistancePercent: 100,
  borderDistancePercent: 100,
  buttonPrimaryBgDistancePercent: 100,
  buttonSecondaryBorderDistancePercent: 100,
  buttonSecondaryHoverDistancePercent: 100,
  linkColorDistancePercent: 100,
  linkHoverDistancePercent: 100,
  footerBackgroundDistancePercent: 100,
  footerBorderDistancePercent: 100,
  navbarBackgroundDistancePercent: 100,
  navbarBorderDistancePercent: 100,
  primaryHoverDistancePercent: 100,
  secondarySurfaceDistancePercent: 100,
  accentMomentDistancePercent: 100,
  highlightSoftDistancePercent: 100,
  neutralSurfaceDistancePercent: 100,
  readableTextDistancePercent: 100,
  secondaryTextDistancePercent: 100,
};

const DERIVATION_REMIX_RANGES = {
  accentMomentDistancePercent: [70, 145],
  backgroundDistancePercent: [86, 220],
  borderDistancePercent: [55, 142],
  buttonPrimaryBgDistancePercent: [78, 126],
  buttonSecondaryBorderDistancePercent: [52, 132],
  buttonSecondaryHoverDistancePercent: [58, 136],
  highlightSoftDistancePercent: [48, 126],
  linkColorDistancePercent: [82, 138],
  linkHoverDistancePercent: [88, 150],
  footerBackgroundDistancePercent: [84, 220],
  footerBorderDistancePercent: [72, 220],
  navbarBackgroundDistancePercent: [84, 220],
  navbarBorderDistancePercent: [72, 220],
  neutralSurfaceDistancePercent: [70, 220],
  primaryHoverDistancePercent: [88, 148],
  readableTextDistancePercent: [96, 132],
  secondarySurfaceDistancePercent: [46, 126],
  secondaryTextDistancePercent: [82, 128],
};

const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const SUCCESS_BASE = "#16a34a";
const WARNING_BASE = "#d97706";
const ERROR_BASE = "#dc2626";
const INFO_BASE = "#2563eb";
const GOLDEN_ANGLE = 137.508;
const REMIX_HUE_SHIFTS = [
  150, 0, 210, 60, 270, 120, 330, 30, 240, 90, 300, 180,
];
const PALETTE_REMIX_PROFILES = [
  {
    id: "vivid",
    saturation: [86, 78, 90, 58],
    lightness: [58, 60, 61, 84],
    saturationJitter: 14,
    lightnessJitter: 8,
  },
  {
    id: "pastel",
    saturation: [54, 48, 58, 34],
    lightness: [76, 74, 72, 88],
    saturationJitter: 12,
    lightnessJitter: 6,
  },
  {
    id: "deep",
    saturation: [70, 58, 74, 42],
    lightness: [30, 34, 38, 68],
    saturationJitter: 12,
    lightnessJitter: 8,
  },
  {
    id: "muted",
    saturation: [36, 32, 40, 26],
    lightness: [48, 52, 46, 78],
    saturationJitter: 10,
    lightnessJitter: 8,
  },
  {
    id: "earthy",
    hueOffset: [8, -12, 18, 24],
    saturation: [48, 40, 56, 32],
    lightness: [42, 46, 40, 76],
    saturationJitter: 10,
    lightnessJitter: 8,
  },
  {
    id: "neon",
    saturation: [96, 92, 98, 70],
    lightness: [56, 54, 58, 82],
    saturationJitter: 8,
    lightnessJitter: 6,
  },
  {
    id: "luxury",
    hueOffset: [0, 18, -12, 30],
    saturation: [52, 42, 60, 24],
    lightness: [24, 30, 36, 82],
    saturationJitter: 10,
    lightnessJitter: 8,
  },
  {
    id: "soft",
    saturation: [44, 38, 46, 30],
    lightness: [64, 66, 62, 86],
    saturationJitter: 10,
    lightnessJitter: 6,
  },
  {
    id: "dark-pop",
    saturation: [82, 72, 90, 50],
    lightness: [26, 32, 44, 80],
    saturationJitter: 10,
    lightnessJitter: 8,
  },
];

export const PALETTE_REMIX_SCHEMES = [
  {
    id: "analogous",
    label: "Analogous",
    offsets: [0, 30, -28, 58],
    saturation: [1.02, 0.92, 1.1, 0.86],
    lightness: [0.96, 1, 1.04, 1.24],
  },
  {
    id: "complementary",
    label: "Complementary",
    offsets: [0, 180, 150, 36],
    saturation: [1, 0.92, 1.08, 0.82],
    lightness: [0.96, 0.98, 1.04, 1.24],
  },
  {
    id: "split-complementary",
    label: "Split complementary",
    offsets: [0, 150, 210, 38],
    saturation: [1, 0.96, 1.05, 0.86],
    lightness: [0.96, 1, 1.04, 1.24],
  },
  {
    id: "triadic",
    label: "Triadic",
    offsets: [0, 120, 240, 48],
    saturation: [1, 0.94, 1.06, 0.84],
    lightness: [0.96, 1, 1.04, 1.24],
  },
  {
    id: "tetradic",
    label: "Tetradic",
    offsets: [0, 72, 180, 252],
    saturation: [1, 0.92, 1.04, 0.86],
    lightness: [0.96, 0.98, 1.04, 1.22],
  },
  {
    id: "square",
    label: "Square",
    offsets: [0, 90, 180, 270],
    saturation: [1, 0.94, 1.06, 0.86],
    lightness: [0.96, 1, 1.04, 1.22],
  },
  {
    id: "monochrome",
    label: "Monochrome",
    offsets: [0, 0, 0, 0],
    saturation: [1, 0.7, 1.12, 0.48],
    lightness: [0.9, 1.08, 0.72, 1.28],
  },
  {
    id: "compound",
    label: "Compound",
    offsets: [0, 42, 180, 222],
    saturation: [1, 0.84, 1.08, 0.78],
    lightness: [0.96, 1.04, 1.02, 1.24],
  },
];

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
  "--color-section-text",
  "--color-section-muted",
  "--color-surface-text",
  "--color-surface-muted",
  "--color-card-text",
  "--color-card-muted",
  "--color-accent-text",
  "--color-accent-muted",
  "--color-inverted-text",
  "--color-inverted-muted",
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
  "--color-nav-border",
  "--color-nav-lockup-logo",
  "--color-nav-link",
  "--color-nav-link-hover",
  "--color-marquee-logo",
  "--color-footer-bg",
  "--color-footer-border",
  "--color-footer-text",
  "--color-footer-link",
  "--color-footer-link-hover",
  "--color-footer-lockup-logo",
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

export function sanitizeBrandDerivationControls(controls = {}) {
  return Object.fromEntries(
    BRAND_DERIVATION_KEYS.map((key) => [
      key,
      clampNumber(
        Number.isFinite(controls[key])
          ? Number(controls[key])
          : DEFAULT_BRAND_DERIVATION_CONTROLS[key],
        0,
        220,
      ),
    ]),
  );
}

export function generateBrandThemeTokens(seeds = {}, options = {}) {
  const normalizedSeeds = sanitizeBrandSeeds(seeds);
  const derivation = sanitizeBrandDerivationControls(options.derivation);
  const primary = generateColorScale(normalizedSeeds.primary);
  const secondary = generateColorScale(normalizedSeeds.secondary);
  const accent = generateColorScale(normalizedSeeds.accent);
  const highlight = generateColorScale(normalizedSeeds.highlight);
  const neutral = generateNeutralScale(normalizedSeeds.primary);
  const darkMode = options.darkMode === true;
  const background = adjustDerivedColorDistance(
    darkMode ? "#000000" : "#ffffff",
    darkMode ? neutral[950] : neutral[50],
    derivation.backgroundDistancePercent,
    darkMode ? primary[600] : primary[500],
  );
  const surfaceTarget = darkMode
    ? mixHex(neutral[950], primary[900], 0.24)
    : mixHex(neutral[50], primary[50], 0.3);
  const surface = adjustDerivedColorDistance(
    darkMode ? neutral[950] : neutral[50],
    surfaceTarget,
    derivation.neutralSurfaceDistancePercent,
    darkMode ? primary[500] : primary[500],
  );
  const surfaceRaised = darkMode ? mixHex(neutral[900], primary[800], 0.16) : "#ffffff";
  const surfaceStrong = darkMode ? mixHex(neutral[900], primary[800], 0.28) : neutral[100];
  const textTarget = darkMode
    ? neutral[50]
    : options.highContrast
      ? neutral[950]
      : mixHex(neutral[950], "#000000", 0.08);
  const text = ensureContrastColor(adjustDerivedColorDistance(
    darkMode ? neutral[50] : neutral[950],
    textTarget,
    derivation.readableTextDistancePercent,
  ), background);
  const mutedTarget = darkMode ? mixHex(neutral[300], neutral[50], 0.18) : neutral[600];
  const muted = ensureContrastColor(adjustDerivedColorDistance(
    text,
    mutedTarget,
    derivation.secondaryTextDistancePercent,
    darkMode ? neutral[500] : neutral[700],
  ), background);
  const subtleText = darkMode ? neutral[300] : neutral[500];
  const borderTarget = darkMode
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
  const border = darkMode
    ? withAlpha(
        primary[300],
        scaleAlphaDistance(
          options.highContrast ? 0.36 : 0.22,
          derivation.borderDistancePercent,
        ),
      )
    : adjustDerivedColorDistance(
        neutral[50],
        borderTarget,
        derivation.borderDistancePercent,
        options.highContrast ? neutral[600] : neutral[400],
      );
  const primaryButtonBg = adjustDerivedColorDistance(
    primary[500],
    primaryAction,
    derivation.buttonPrimaryBgDistancePercent,
    darkMode ? primary[300] : primary[900],
  );
  const primaryHover = adjustDerivedColorDistance(
    primaryButtonBg,
    darkMode ? primary[400] : primary[700],
    derivation.primaryHoverDistancePercent,
  );
  const secondaryButtonBg = darkMode
    ? mixHex(
        surface,
        secondary[400],
        scaleAlphaDistance(0.14, derivation.secondarySurfaceDistancePercent),
      )
    : adjustDerivedColorDistance(
        secondary[500],
        secondary[50],
        derivation.secondarySurfaceDistancePercent,
        "#ffffff",
      );
  const secondaryButtonHover = darkMode
    ? mixHex(
        surface,
        secondary[400],
        scaleAlphaDistance(0.22, derivation.buttonSecondaryHoverDistancePercent),
      )
    : adjustDerivedColorDistance(
        secondary[500],
        secondary[100],
        derivation.buttonSecondaryHoverDistancePercent,
        "#ffffff",
      );
  const secondaryButtonText = darkMode ? secondary[100] : secondary[800];
  const secondaryButtonBorder = darkMode
    ? withAlpha(
        secondary[300],
        scaleAlphaDistance(0.34, derivation.buttonSecondaryBorderDistancePercent),
      )
    : adjustDerivedColorDistance(
        secondary[500],
        secondary[200],
        derivation.buttonSecondaryBorderDistancePercent,
        "#ffffff",
      );
  const brandBadgeBg = darkMode ? withAlpha(primary[400], 0.16) : primary[100];
  const brandBadgeText = darkMode ? primary[100] : primary[700];
  const brandBadgeBorder = darkMode ? withAlpha(primary[300], 0.26) : primary[200];
  const accentMoment = adjustDerivedColorDistance(
    accent[500],
    accentAction,
    derivation.accentMomentDistancePercent,
  );
  const highlightSoft = darkMode
    ? withAlpha(highlight[300], scaleAlphaDistance(0.16, derivation.highlightSoftDistancePercent))
    : adjustDerivedColorDistance(
        highlight[500],
        highlight[100],
        derivation.highlightSoftDistancePercent,
        "#ffffff",
      );
  const highlightText = darkMode ? highlight[100] : highlight[800];
  const linkColor = ensureContrastColor(adjustDerivedColorDistance(
    primary[500],
    darkMode ? primary[300] : primary[700],
    derivation.linkColorDistancePercent,
    darkMode ? primary[100] : primary[900],
  ), background);
  const linkHover = ensureContrastColor(adjustDerivedColorDistance(
    linkColor,
    darkMode ? primary[200] : primary[800],
    derivation.linkHoverDistancePercent,
    darkMode ? primary[50] : primary[950],
  ), background);
  const navBackground = adjustDerivedColorDistance(
    surfaceRaised,
    darkMode ? surfaceRaised : surfaceRaised,
    derivation.navbarBackgroundDistancePercent,
    darkMode ? primary[500] : primary[500],
  );
  const navBorder = adjustDerivedColorDistance(
    border,
    border,
    derivation.navbarBorderDistancePercent,
    darkMode ? primary[400] : primary[500],
  );
  const navLink = ensureContrastColor(muted, navBackground);
  const navLinkHover = ensureContrastColor(text, navBackground);
  const navLockupLogo = ensureContrastColor(primary[500], navBackground);
  const marqueeLogo = ensureContrastColor(muted, surface);
  const surfaceText = ensureContrastColor(text, surface);
  const surfaceMuted = ensureContrastColor(muted, surface);
  const cardText = ensureContrastColor(text, surfaceRaised);
  const cardMuted = ensureContrastColor(muted, surfaceRaised);
  const accentText = getContrastText(primaryButtonBg);
  const accentMuted = ensureContrastColor(muted, primaryButtonBg);
  const footerBase = darkMode ? neutral[950] : text;
  const footerBackground = adjustDerivedColorDistance(
    footerBase,
    footerBase,
    derivation.footerBackgroundDistancePercent,
    primary[500],
  );
  const footerBorder = adjustDerivedColorDistance(
    border,
    border,
    derivation.footerBorderDistancePercent,
    primary[500],
  );
  const invertedBg = footerBackground;
  const invertedText = ensureContrastColor(background, invertedBg);
  const invertedMuted = ensureContrastColor(muted, invertedBg);
  const footerText = ensureContrastColor(surfaceRaised, footerBackground);
  const footerMuted = ensureContrastColor(muted, footerBackground);
  const footerLink = ensureContrastColor(primary[200], footerBackground);
  const footerLinkHover = ensureContrastColor(primary[50], footerBackground);
  const footerLockupLogo = ensureContrastColor(primary[500], footerBackground);
  const primaryButtonTextSafe = getContrastText(primaryButtonBg);
  const primaryHoverSafe = ensureBackgroundContrastForText(primaryHover, primaryButtonTextSafe);
  const secondaryButtonTextSafe = ensureContrastColor(secondaryButtonText, secondaryButtonBg);
  const secondaryButtonHoverSafe = ensureBackgroundContrastForText(
    secondaryButtonHover,
    secondaryButtonTextSafe,
  );
  const highlightTextSafe = ensureContrastColor(highlightText, highlightSoft);

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
    "--green-600": primaryButtonBg,
    "--green-700": primaryHoverSafe,
    "--green-100": brandBadgeBg,
    "--blue-600": secondaryAction,
    "--blue-100": secondaryButtonHoverSafe,
    "--amber-500": harmonizeSemanticColor(WARNING_BASE, normalizedSeeds.accent),
    "--color-bg": background,
    "--color-surface": surface,
    "--color-surface-raised": surfaceRaised,
    "--color-surface-strong": surfaceStrong,
    "--color-text": text,
    "--color-muted": muted,
    "--color-section-text": text,
    "--color-section-muted": muted,
    "--color-surface-text": surfaceText,
    "--color-surface-muted": surfaceMuted,
    "--color-card-text": cardText,
    "--color-card-muted": cardMuted,
    "--color-accent-text": accentText,
    "--color-accent-muted": accentMuted,
    "--color-inverted-text": invertedText,
    "--color-inverted-muted": invertedMuted,
    "--color-border": border,
    "--color-accent": primaryButtonBg,
    "--color-accent-hover": primaryHoverSafe,
    "--color-accent-soft": brandBadgeBg,
    "--color-accent-border": withAlpha(
      primary[500],
      darkMode ? 0.48 : options.highContrast ? 0.62 : 0.32,
    ),
    "--color-blue": secondaryAction,
    "--color-blue-soft": secondaryButtonHoverSafe,
    "--color-on-accent": primaryButtonTextSafe,
    "--color-highlight": darkMode ? highlight[300] : highlight[400],
    "--color-highlight-soft": highlightSoft,
    "--color-on-highlight": darkMode ? getContrastText(highlight[300]) : getContrastText(highlight[300]),
    "--color-warning": "var(--amber-500)",
    "--color-success": harmonizeSemanticColor(SUCCESS_BASE, normalizedSeeds.primary),
    "--color-error": harmonizeSemanticColor(ERROR_BASE, normalizedSeeds.accent),
    "--color-info": harmonizeSemanticColor(INFO_BASE, normalizedSeeds.primary),
    "--button-primary-bg": primaryButtonBg,
    "--button-primary-hover": primaryHoverSafe,
    "--button-primary-text": primaryButtonTextSafe,
    "--button-secondary-bg": secondaryButtonBg,
    "--button-secondary-hover": secondaryButtonHoverSafe,
    "--button-secondary-text": secondaryButtonTextSafe,
    "--button-secondary-border": secondaryButtonBorder,
    "--link-color": linkColor,
    "--link-hover": linkHover,
    "--focus-ring": darkMode ? primary[300] : primary[400],
    "--gradient-hero-start": darkMode ? primary[700] : primary[600],
    "--gradient-hero-end": secondary[500],
    "--gradient-hero-accent": accentMoment,
    "--chart-1": primary[600],
    "--chart-2": secondary[600],
    "--chart-3": accentMoment,
    "--chart-4": highlight[500],
    "--badge-brand-bg": brandBadgeBg,
    "--badge-brand-text": brandBadgeText,
    "--badge-brand-border": brandBadgeBorder,
    "--badge-highlight-bg": highlightSoft,
    "--badge-highlight-text": highlightTextSafe,
    "--badge-highlight-border": darkMode ? withAlpha(highlight[300], 0.24) : highlight[200],
    "--shadow-soft": getShadowValue(neutral[950], 20, 60, 0.08, elevationScale),
    "--shadow-raised": getShadowValue(neutral[950], 32, 100, 0.12, elevationScale),
    "--shadow-brand": getShadowValue(primary[600], 28, 84, 0.18, elevationScale),
    "--dark-color-bg": adjustDerivedColorDistance(
      "#000000",
      neutral[950],
      derivation.backgroundDistancePercent,
      primary[600],
    ),
    "--dark-color-surface": adjustDerivedColorDistance(
      neutral[950],
      mixHex(neutral[950], primary[900], 0.24),
      derivation.neutralSurfaceDistancePercent,
      primary[500],
    ),
    "--dark-color-text": neutral[50],
    "--dark-color-border": withAlpha(primary[300], 0.22),
    "--color-nav-bg": navBackground,
    "--color-nav-border": navBorder,
    "--color-nav-lockup-logo": navLockupLogo,
    "--color-nav-link": navLink,
    "--color-nav-link-hover": navLinkHover,
    "--color-marquee-logo": marqueeLogo,
    "--color-footer-bg": footerBackground,
    "--color-footer-border": footerBorder,
    "--color-footer-text": footerText,
    "--color-footer-link": footerLink,
    "--color-footer-link-hover": footerLinkHover,
    "--color-footer-lockup-logo": footerLockupLogo,
    "--color-footer-muted": footerMuted,
  };
}

export function generatePaletteRemix(seeds = {}, options = {}) {
  const normalizedSeeds = sanitizeBrandSeeds(seeds);
  const requestedScheme = PALETTE_REMIX_SCHEMES.find(
    (scheme) => scheme.id === options.scheme,
  );
  const step = Number.isFinite(options.step) ? Math.max(0, Math.floor(options.step)) : 0;
  const salt = Number.isFinite(options.salt) ? Math.max(0, Math.floor(options.salt)) : 0;
  const remixStep = step + salt;
  const scheme = requestedScheme ?? PALETTE_REMIX_SCHEMES[remixStep % PALETTE_REMIX_SCHEMES.length];
  const profile = requestedScheme
    ? null
    : PALETTE_REMIX_PROFILES[remixStep % PALETTE_REMIX_PROFILES.length];
  const base = rgbToHsl(hexToRgb(normalizedSeeds.primary));
  const hueStep = requestedScheme ? 0 : remixStep;
  const hueCycle = Math.floor(hueStep / REMIX_HUE_SHIFTS.length);
  const primaryShift = requestedScheme
    ? 0
    : REMIX_HUE_SHIFTS[hueStep % REMIX_HUE_SHIFTS.length] +
      hueCycle * (GOLDEN_ANGLE / 3);
  const baseHue = wrapHue(base.h + primaryShift);
  const baseSaturation = clampNumber(base.s || 72, 46, 88);
  const baseLightness = clampNumber(base.l || 54, 42, 66);
  const [primary, secondary, accent, highlight] = BRAND_SEED_KEYS.map((key, index) => {
    const saturationJitter = requestedScheme
      ? 0
      : (getDeterministicRemixRatio(remixStep, index + 11) - 0.5) *
        profile.saturationJitter;
    const lightnessJitter = requestedScheme
      ? 0
      : (getDeterministicRemixRatio(remixStep, index + 23) - 0.5) *
        profile.lightnessJitter;
    const hue = wrapHue(baseHue + scheme.offsets[index] + (profile?.hueOffset?.[index] ?? 0));
    const saturation = profile
      ? clampNumber(
          profile.saturation[index] +
            saturationJitter +
            (baseSaturation - 72) * 0.1,
          index === 3 ? 18 : 22,
          index === 3 ? 84 : 98,
        )
      : clampNumber(
          baseSaturation * scheme.saturation[index] + (index === 3 ? -6 : 0),
          index === 3 ? 42 : 48,
          index === 3 ? 82 : 92,
        );
    const lightness = profile
      ? clampNumber(
          profile.lightness[index] +
            lightnessJitter +
            (baseLightness - 54) * 0.08,
          index === 3 ? 58 : 20,
          index === 3 ? 92 : 82,
        )
      : clampNumber(
          baseLightness * scheme.lightness[index] + (index === 3 ? 8 : 0),
          index === 3 ? 62 : 42,
          index === 3 ? 84 : 64,
        );

    return [key, hslToHex({ h: hue, s: saturation, l: lightness })];
  }).map(([, value]) => value);

  return {
    palette: { primary, secondary, accent, highlight },
    scheme: scheme.id,
    schemeLabel: scheme.label,
  };
}

export function generateBrandDerivationRemix(options = {}) {
  const step = Number.isFinite(options.step) ? Math.max(0, Math.floor(options.step)) : 0;

  return sanitizeBrandDerivationControls(
    Object.fromEntries(
      BRAND_DERIVATION_KEYS.map((key, index) => {
        const [min, max] = DERIVATION_REMIX_RANGES[key];
        const ratio = getDeterministicRemixRatio(step, index);
        return [key, Math.round(min + (max - min) * ratio)];
      }),
    ),
  );
}

export function getHeroBackgroundCopyColors(
  tone,
  seedColors = {},
) {
  const primary = normalizeHexColor(seedColors.primary ?? DEFAULT_BRAND_SEEDS.primary);
  const secondary = normalizeHexColor(seedColors.secondary ?? DEFAULT_BRAND_SEEDS.secondary);
  const gradientTint = mixHex(primary, secondary, 0.38);
  const scrimBase = tone === "light" ? "#ffffff" : "#000000";
  const scrimWeight = tone === "light" ? 0.76 : 0.58;
  const representativeBg = mixHex(gradientTint, scrimBase, scrimWeight);
  const text = getContrastText(representativeBg);
  const muted = ensureContrastColor(
    mixHex(text, representativeBg, 0.42),
    representativeBg,
    3,
  );

  return { text, muted, representativeBg };
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

function getContrastText(background, minimumRatio = 4.5) {
  const candidates = ["#ffffff", "#111416", "#000000"];

  for (const candidate of candidates) {
    if (getContrastRatio(candidate, background) >= minimumRatio) return candidate;
  }

  return ensureContrastColor("#111416", background, minimumRatio);
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

function ensureContrastColor(foreground, background, minimumRatio = 4.5) {
  if (getContrastRatio(foreground, background) >= minimumRatio) return foreground;
  if (getContrastRatio("#111416", background) >= minimumRatio) return "#111416";
  const blackRatio = getContrastRatio("#000000", background);
  const whiteRatio = getContrastRatio("#ffffff", background);
  return blackRatio >= whiteRatio ? "#000000" : "#ffffff";
}

function ensureBackgroundContrastForText(background, foreground, minimumRatio = 4.5) {
  if (getContrastRatio(foreground, background) >= minimumRatio) return background;

  const target = getRelativeLuminance(foreground) > 0.5 ? "#000000" : "#ffffff";
  for (let weight = 0.08; weight <= 1; weight += 0.08) {
    const candidate = mixHex(background, target, weight);
    if (getContrastRatio(foreground, candidate) >= minimumRatio) return candidate;
  }

  return target;
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

function adjustDerivedColorDistance(origin, target, distance, extensionColor) {
  const factor = clampNumber(distance, 0, 220) / 100;
  if (factor <= 1) return mixHex(origin, target, factor);

  const extension =
    extensionColor ??
    (getRelativeLuminance(target) >= getRelativeLuminance(origin)
      ? "#ffffff"
      : "#000000");
  return mixHex(target, extension, factor - 1);
}

function scaleAlphaDistance(alpha, distance) {
  return clampNumber(alpha * (clampNumber(distance, 0, 160) / 100), 0.02, 0.42);
}

function rgbToHsl([red, green, blue]) {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const lightness = (max + min) / 2;
  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  let hue = 0;

  if (delta !== 0) {
    if (max === r) {
      hue = ((g - b) / delta) % 6;
    } else if (max === g) {
      hue = (b - r) / delta + 2;
    } else {
      hue = (r - g) / delta + 4;
    }
  }

  return {
    h: wrapHue(hue * 60),
    s: saturation * 100,
    l: lightness * 100,
  };
}

function hslToHex({ h, s, l }) {
  const hue = wrapHue(h);
  const saturation = clampNumber(s, 0, 100) / 100;
  const lightness = clampNumber(l, 0, 100) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - chroma / 2;
  const sector = Math.floor(hue / 60);
  const [r, g, b] =
    sector === 0
      ? [chroma, x, 0]
      : sector === 1
        ? [x, chroma, 0]
        : sector === 2
          ? [0, chroma, x]
          : sector === 3
            ? [0, x, chroma]
            : sector === 4
              ? [x, 0, chroma]
              : [chroma, 0, x];

  return rgbToHex([
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ]);
}

function wrapHue(hue) {
  return ((hue % 360) + 360) % 360;
}

function getDeterministicRemixRatio(step, index) {
  const seed = Math.sin((step + 1) * (index + 3) * 12.9898) * 43758.5453;
  return seed - Math.floor(seed);
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundNumber(value, decimals = 0) {
  return Number(value.toFixed(decimals));
}
