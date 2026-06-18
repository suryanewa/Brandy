import { describe, expect, it } from "vitest";
import {
  BRAND_GENERATED_TOKEN_NAMES,
  DEFAULT_BRAND_SEEDS,
  generateBrandThemeTokens,
  isHexColor,
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
      "--link-color": "#4943bd",
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
});
