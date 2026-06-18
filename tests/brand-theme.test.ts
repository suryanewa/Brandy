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
});
