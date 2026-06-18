import { describe, expect, it } from "vitest";
import {
  DEFAULT_LAYOUT_SEEDS,
  LAYOUT_GENERATED_TOKEN_NAMES,
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

    expect(tokens["--section-padding-y-md"]).toBe("3.5rem");
    expect(tokens["--container-lg"]).toBe("1120px");
    expect(tokens["--content-readable-max"]).toBe("38rem");
    expect(tokens["--hero-grid-visual-fr"]).toBe("1.14fr");
    expect(tokens["--hero-headline-max-width"]).toBe("9ch");
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

    expect(tokens["--section-padding-x"]).toBe("clamp(1rem, 2.4vw, 1.8rem)");
    expect(tokens["--section-padding-y-md"]).toBe("3rem");
    expect(tokens["--container-lg"]).toBe("960px");
    expect(tokens["--brandy-grid-default-columns"]).toBe(
      "repeat(4, minmax(0, 1fr))",
    );
    expect(tokens["--hero-grid-text-fr"]).toBe("1.2fr");
    expect(tokens["--hero-grid-visual-fr"]).toBe("0.8fr");
    expect(tokens["--hero-headline-max-width"]).toBe("16ch");
    expect(tokens["--hero-copy-max-width"]).toBe("16ch");
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
      textWidth: 28,
    });
  });
});
