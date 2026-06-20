import { describe, expect, it } from "vitest";
import {
  DEFAULT_LAYOUT_SEEDS,
  GRID_DENSITY_OPTIONS,
  HERO_SCALE_OPTIONS,
  LAYOUT_GENERATED_TOKEN_NAMES,
  LAYOUT_WIDTH_OPTIONS,
  generateLayoutRemix,
  generateLayoutThemeTokens,
  sanitizeLayoutSeeds,
} from "../src/lib/layoutTheme.mjs";

describe("layout theme generator", () => {
  it("generates exactly the declared layout token set", () => {
    expect(Object.keys(generateLayoutThemeTokens(DEFAULT_LAYOUT_SEEDS)).sort()).toEqual(
      [...LAYOUT_GENERATED_TOKEN_NAMES].sort(),
    );
  });

  it("maps default layout seeds to Brandy layout tokens", () => {
    const tokens = generateLayoutThemeTokens(DEFAULT_LAYOUT_SEEDS);

    expect(tokens["--section-padding-x"]).toBe("clamp(1.25rem, 2.8vw, 2.1rem)");
    expect(tokens["--section-padding-y-md"]).toBe("3.5rem");
    expect(tokens["--section-hero-min-height"]).toBe(
      "calc(100svh - var(--navbar-min-height) - var(--stroke-thin))",
    );
    expect(tokens["--container-lg"]).toBe("1120px");
    expect(tokens["--content-readable-max"]).toBe("38rem");
    expect(tokens["--hero-grid-visual-fr"]).toBe("1.14fr");
    expect(tokens["--hero-headline-max-width"]).toBe("56rem");
    expect(tokens["--hero-description-max-width"]).toBe("52rem");
    expect(tokens["--radius-lg"]).toBe("2px");
  });

  it("derives raw tokens from compact dense layout seeds", () => {
    const tokens = generateLayoutThemeTokens({
      gridDensity: "dense",
      heroBalance: 40,
      heroScale: "compact",
      pageGutter: 60,
      radius: 4,
      spacing: 60,
      textWidth: 32,
      width: "narrow",
    });

    expect(tokens["--section-padding-x"]).toBe("clamp(1.25rem, 2.4vw, 1.8rem)");
    expect(tokens["--section-padding-y-md"]).toBe("3rem");
    expect(tokens["--section-hero-min-height"]).toBe(
      "calc(100svh - var(--navbar-min-height) - var(--stroke-thin))",
    );
    expect(tokens["--container-lg"]).toBe("820px");
    expect(tokens["--brandy-grid-default-columns"]).toBe(
      "repeat(4, minmax(0, 1fr))",
    );
    expect(tokens["--hero-grid-text-fr"]).toBe("1.2fr");
    expect(tokens["--hero-grid-visual-fr"]).toBe("0.8fr");
    expect(tokens["--hero-headline-max-width"]).toBe("56rem");
    expect(tokens["--hero-copy-max-width"]).toBe("56rem");
    expect(tokens["--hero-description-max-width"]).toBe("52rem");
    expect(tokens["--footer-columns"]).toBe("1fr 1fr auto");
    expect(tokens["--radius-lg"]).toBe("4px");
  });

  it("clamps and normalizes invalid seed patches", () => {
    expect(
      sanitizeLayoutSeeds({
        gridDensity: "crowded",
        heroBalance: 90,
        heroScale: "cinematic",
        pageGutter: 10,
        radius: -4,
        spacing: 180,
        textWidth: 8,
        width: "mega",
      } as unknown as Parameters<typeof sanitizeLayoutSeeds>[0]),
    ).toEqual({
      ...DEFAULT_LAYOUT_SEEDS,
      heroBalance: 65,
      pageGutter: 50,
      radius: 0,
      spacing: 130,
      textWidth: 22,
    });
  });

  it("generates deterministic sanitized layout remixes", () => {
    const firstRemix = generateLayoutRemix({ salt: 0, step: 0 });
    const repeatedRemix = generateLayoutRemix({ salt: 0, step: 0 });
    const nextRemix = generateLayoutRemix({ salt: 0, step: 1 });

    expect(firstRemix).toEqual(repeatedRemix);
    expect(firstRemix).toEqual(sanitizeLayoutSeeds(firstRemix));
    expect(firstRemix).not.toEqual(DEFAULT_LAYOUT_SEEDS);
    expect(nextRemix).not.toEqual(firstRemix);

    const tokens = generateLayoutThemeTokens(firstRemix);
    expect(tokens["--section-padding-y-md"]).not.toBe("");
    expect(tokens["--section-hero-min-height"]).toBe(
      "calc(100svh - var(--navbar-min-height) - var(--stroke-thin))",
    );
    expect(tokens["--container-lg"]).not.toBe("");
    expect(tokens["--hero-grid-text-fr"]).not.toBe("");
  });

  it("keeps remix seeds inside edge-safe layout guardrails", () => {
    for (let step = 0; step < 96; step += 1) {
      const remix = generateLayoutRemix({ salt: 0, step });
      const tokens = generateLayoutThemeTokens(remix);

      expect(remix.heroBalance).toBeGreaterThanOrEqual(40);
      expect(remix.heroBalance).toBeLessThanOrEqual(60);
      expect(remix.pageGutter).toBeGreaterThanOrEqual(64);
      expect(remix.spacing).toBeGreaterThanOrEqual(60);
      expect(remix.textWidth).toBeGreaterThanOrEqual(24);
      expect(remix.textWidth).toBeLessThanOrEqual(48);
      expect(tokens["--section-padding-x"]).toMatch(/^clamp\(1\.25rem,/);
      expect(tokens["--hero-grid-text-fr"]).not.toBe("0.7fr");
      expect(tokens["--hero-grid-visual-fr"]).not.toBe("1.3fr");
    }
  });

  it("covers the layout option space across remix steps", () => {
    const remixes = Array.from({ length: 16 }, (_, step) =>
      generateLayoutRemix({ salt: 0, step }),
    );

    expect(new Set(remixes.map((remix) => remix.width))).toEqual(
      new Set(LAYOUT_WIDTH_OPTIONS),
    );
    expect(new Set(remixes.map((remix) => remix.heroScale))).toEqual(
      new Set(HERO_SCALE_OPTIONS),
    );
    expect(new Set(remixes.map((remix) => remix.gridDensity))).toEqual(
      new Set(GRID_DENSITY_OPTIONS),
    );
    expect(new Set(remixes.map((remix) => remix.spacing)).size).toBeGreaterThan(4);

    for (const remix of remixes) {
      expect(remix).toEqual(sanitizeLayoutSeeds(remix));
    }
  });
});
