import { describe, expect, it } from "vitest";
import {
  BRAND_GENERATED_TOKEN_NAMES,
  DEFAULT_BRAND_SEEDS,
  generateBrandDerivationRemix,
  generateBrandThemeTokens,
  generatePaletteRemix,
  isHexColor,
  PALETTE_REMIX_SCHEMES,
  normalizeHexColor,
  sanitizeBrandSeeds,
} from "../src/lib/brandTheme.mjs";

describe("brand theme generator", () => {
  it("normalizes the four expressive brand seeds", () => {
    expect(
      sanitizeBrandSeeds({
        accent: "dc2626",
        highlight: "#FAcC15",
        primary: "635",
        secondary: "#0891B2",
      }),
    ).toEqual({
      accent: "#dc2626",
      highlight: "#facc15",
      primary: "#663355",
      secondary: "#0891b2",
    });
    expect(normalizeHexColor("ABCDEF")).toBe("#abcdef");
    expect(isHexColor("#abc123")).toBe(true);
    expect(isHexColor("not-a-color")).toBe(false);
  });

  it("derives a deterministic utility token system from default seeds", () => {
    const tokens = generateBrandThemeTokens(DEFAULT_BRAND_SEEDS);

    expect(tokens).toMatchObject({
      "--brand-primary-500": "#635bff",
      "--brand-secondary-500": "#00d4ff",
      "--brand-accent-500": "#ff6b35",
      "--brand-highlight-500": "#fde68a",
      "--neutral-50": "#fafaff",
      "--neutral-950": "#080916",
      "--color-accent": "#5750e0",
      "--color-on-accent": "#ffffff",
      "--button-primary-hover": "#4943bd",
      "--button-secondary-bg": "#f0fcff",
      "--button-secondary-border": "#bdf4ff",
      "--button-secondary-hover": "#dbf9ff",
      "--link-color": "#4943bd",
      "--link-hover": "#393594",
      "--focus-ring": "#958fff",
      "--chart-4": "#fde68a",
      "--color-warning": "var(--amber-500)",
    });
    expect(tokens["--color-accent-soft"]).not.toBe(tokens["--brand-primary-500"]);
    expect(tokens["--color-accent-border"]).toMatch(/^rgba\(/);
    expect(tokens["--shadow-brand"]).toMatch(/^0 28px 84px rgba\(/);
    expect(Object.keys(tokens).sort()).toEqual(
      [...BRAND_GENERATED_TOKEN_NAMES].sort(),
    );
  });

  it("uses readable text colors for bright and saturated seeds", () => {
    const tokens = generateBrandThemeTokens({
      accent: "#dc2626",
      highlight: "#facc15",
      primary: "#facc15",
      secondary: "#22d3ee",
    });

    expect(tokens["--button-primary-text"]).toBe("#111416");
    expect(tokens["--color-on-highlight"]).toBe("#111416");
  });

  it("adjusts derived color distance without changing brand seeds", () => {
    const tokens = generateBrandThemeTokens(DEFAULT_BRAND_SEEDS, {
      derivation: {
        backgroundDistancePercent: 0,
        borderDistancePercent: 0,
        buttonPrimaryBgDistancePercent: 50,
        buttonSecondaryBorderDistancePercent: 0,
        buttonSecondaryHoverDistancePercent: 50,
        highlightSoftDistancePercent: 0,
        linkColorDistancePercent: 0,
        linkHoverDistancePercent: 50,
        neutralSurfaceDistancePercent: 160,
        primaryHoverDistancePercent: 50,
        secondaryTextDistancePercent: 50,
      },
    });

    expect(tokens["--brand-primary-500"]).toBe("#635bff");
    expect(tokens["--color-bg"]).toBe("#ffffff");
    expect(tokens["--color-border"]).toBe("#fafaff");
    expect(tokens["--button-primary-bg"]).toBe("#5d56f0");
    expect(tokens["--button-primary-hover"]).toBe("#534dd7");
    expect(tokens["--button-secondary-border"]).toBe("#00d4ff");
    expect(tokens["--button-secondary-hover"]).toBe("#6ee7ff");
    expect(tokens["--link-color"]).toBe("#635bff");
    expect(tokens["--link-hover"]).toBe("#4e48ca");
    expect(tokens["--color-highlight-soft"]).toBe("#fde68a");
    expect(tokens["--color-muted"]).toBe("#1b1e3c");
    expect(tokens["--color-surface"]).toBe("#9f9aff");
  });

  it("derives harmonious dark semantic roles from the same seeds", () => {
    const tokens = generateBrandThemeTokens(DEFAULT_BRAND_SEEDS, {
      darkMode: true,
    });

    expect(tokens).toMatchObject({
      "--color-bg": "#080916",
      "--color-surface": "#0f0f28",
      "--color-surface-raised": "#17183b",
      "--color-text": "#fafaff",
      "--color-muted": "#dad8ff",
      "--color-border": "rgba(189, 186, 255, 0.22)",
      "--button-primary-bg": "#635bff",
      "--button-primary-hover": "#958fff",
      "--button-secondary-bg": "rgba(82, 226, 255, 0.14)",
      "--button-secondary-text": "#dbf9ff",
      "--badge-brand-bg": "rgba(149, 143, 255, 0.16)",
      "--badge-brand-text": "#e9e8ff",
      "--link-color": "#bdbaff",
      "--focus-ring": "#bdbaff",
    });
    expect(tokens["--color-bg"]).toBe(tokens["--dark-color-bg"]);
    expect(tokens["--color-surface"]).toBe(tokens["--dark-color-surface"]);
    expect(tokens["--color-text"]).toBe(tokens["--dark-color-text"]);
  });

  it("remixes brand seeds with deterministic harmony schemes", () => {
    const remix = generatePaletteRemix(DEFAULT_BRAND_SEEDS, {
      scheme: "triadic",
      step: 3,
    });
    const repeat = generatePaletteRemix(DEFAULT_BRAND_SEEDS, {
      scheme: "triadic",
      step: 99,
    });

    expect(remix).toMatchObject({
      scheme: "triadic",
      schemeLabel: "Triadic",
      palette: {
        primary: "#574ff4",
        secondary: "#ef5f57",
        accent: "#4ff857",
        highlight: "#eabaf2",
      },
    });
    expect(repeat).toEqual(remix);
    expect(Object.values(remix.palette).every(isHexColor)).toBe(true);
    expect(remix.palette).not.toEqual(sanitizeBrandSeeds(DEFAULT_BRAND_SEEDS));
  });

  it("cycles through all supported palette remix families", () => {
    const schemeIds = PALETTE_REMIX_SCHEMES.map((scheme) => scheme.id);
    const remixedSchemeIds = schemeIds.map(
      (_, step) => generatePaletteRemix(DEFAULT_BRAND_SEEDS, { step }).scheme,
    );

    expect(remixedSchemeIds).toEqual(schemeIds);
  });

  it("covers the hue wheel across early remix steps", () => {
    const primaryHueBuckets = new Set(
      Array.from({ length: 12 }, (_, step) =>
        getHueBucket(generatePaletteRemix(DEFAULT_BRAND_SEEDS, { step }).palette.primary),
      ),
    );

    expect(primaryHueBuckets.size).toBeGreaterThanOrEqual(10);
  });

  it("varies saturation and lightness across remix styles", () => {
    const primaryMetrics = Array.from({ length: 24 }, (_, step) =>
      getHslMetrics(generatePaletteRemix(DEFAULT_BRAND_SEEDS, { step }).palette.primary),
    );

    expect(Math.min(...primaryMetrics.map((color) => color.s))).toBeLessThan(45);
    expect(Math.max(...primaryMetrics.map((color) => color.s))).toBeGreaterThan(90);
    expect(Math.min(...primaryMetrics.map((color) => color.l))).toBeLessThan(32);
    expect(Math.max(...primaryMetrics.map((color) => color.l))).toBeGreaterThan(74);
  });

  it("remixes derived color distances while preserving readable contrast", () => {
    const derivation = generateBrandDerivationRemix({ step: 0 });
    const repeat = generateBrandDerivationRemix({ step: 0 });

    expect(derivation).toMatchObject({
      backgroundDistancePercent: 161,
      buttonPrimaryBgDistancePercent: 100,
      footerBackgroundDistancePercent: 196,
      footerBorderDistancePercent: 98,
      linkHoverDistancePercent: 121,
      primaryHoverDistancePercent: 146,
      secondaryTextDistancePercent: 112,
    });
    expect(repeat).toEqual(derivation);

    for (let step = 0; step < PALETTE_REMIX_SCHEMES.length * 2; step += 1) {
      const remix = generatePaletteRemix(DEFAULT_BRAND_SEEDS, { step });
      const tokens = generateBrandThemeTokens(remix.palette, {
        derivation: generateBrandDerivationRemix({ step }),
      });

      expect(contrastRatio(tokens["--color-text"], tokens["--color-bg"])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(tokens["--color-muted"], tokens["--color-bg"])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(tokens["--color-section-text"], tokens["--color-bg"])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(tokens["--color-section-muted"], tokens["--color-bg"])).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(tokens["--color-surface-text"], tokens["--color-surface"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(tokens["--color-surface-muted"], tokens["--color-surface"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(tokens["--color-card-text"], tokens["--color-surface-raised"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(tokens["--color-card-muted"], tokens["--color-surface-raised"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(tokens["--color-accent-text"], tokens["--color-accent"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(tokens["--color-accent-muted"], tokens["--color-accent"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(tokens["--color-inverted-text"], tokens["--color-footer-bg"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(tokens["--color-inverted-muted"], tokens["--color-footer-bg"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(tokens["--color-footer-text"], tokens["--color-footer-bg"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(tokens["--color-footer-muted"], tokens["--color-footer-bg"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(tokens["--color-footer-link"], tokens["--color-footer-bg"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(tokens["--color-footer-link-hover"], tokens["--color-footer-bg"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(tokens["--color-footer-lockup-logo"], tokens["--color-footer-bg"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(tokens["--link-color"], tokens["--color-bg"])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(tokens["--link-hover"], tokens["--color-bg"])).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(tokens["--color-nav-link"], tokens["--color-nav-bg"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(tokens["--color-nav-link-hover"], tokens["--color-nav-bg"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(tokens["--color-nav-lockup-logo"], tokens["--color-nav-bg"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(tokens["--color-marquee-logo"], tokens["--color-surface"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(tokens["--button-primary-text"], tokens["--button-primary-bg"]),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(tokens["--button-secondary-text"], tokens["--button-secondary-bg"]),
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(hex: string): number {
  const [red, green, blue] = hexToRgb(hex).map((channel) => {
    const scaled = channel / 255;
    return scaled <= 0.03928
      ? scaled / 12.92
      : ((scaled + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.slice(1);
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function getHueBucket(hex: string): number {
  return Math.floor(getHslMetrics(hex).h / 30);
}

function getHslMetrics(hex: string): { h: number; s: number; l: number } {
  const [red, green, blue] = hexToRgb(hex).map((channel) => channel / 255);
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;
  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  let hue = 0;

  if (delta !== 0) {
    if (max === red) {
      hue = ((green - blue) / delta) % 6;
    } else if (max === green) {
      hue = (blue - red) / delta + 2;
    } else {
      hue = (red - green) / delta + 4;
    }
  }

  return {
    h: (((hue * 60) % 360) + 360) % 360,
    s: saturation * 100,
    l: lightness * 100,
  };
}
