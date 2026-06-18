import { describe, expect, it } from "vitest";
import {
  DEFAULT_TYPOGRAPHY_SEEDS,
  TYPOGRAPHY_GENERATED_MEDIA_TOKEN_NAMES,
  TYPOGRAPHY_GENERATED_TOKEN_NAMES,
  generateTypographyMediaThemeTokens,
  generateTypographyThemeTokens,
  sanitizeTypographySeeds,
} from "../src/lib/typographyTheme.mjs";

describe("typography theme generator", () => {
  it("generates exactly the declared typography token set", () => {
    expect(
      Object.keys(generateTypographyThemeTokens(DEFAULT_TYPOGRAPHY_SEEDS)).sort(),
    ).toEqual([...TYPOGRAPHY_GENERATED_TOKEN_NAMES].sort());
  });

  it("generates exactly the declared responsive typography token sets", () => {
    const mediaTokens = generateTypographyMediaThemeTokens(DEFAULT_TYPOGRAPHY_SEEDS);

    for (const [query, tokenNames] of Object.entries(
      TYPOGRAPHY_GENERATED_MEDIA_TOKEN_NAMES,
    )) {
      expect(Object.keys(mediaTokens[query] ?? {}).sort()).toEqual(
        [...tokenNames].sort(),
      );
    }
  });

  it("maps default typography seeds to Brandy typography tokens", () => {
    const tokens = generateTypographyThemeTokens(DEFAULT_TYPOGRAPHY_SEEDS);
    const mediaTokens = generateTypographyMediaThemeTokens(DEFAULT_TYPOGRAPHY_SEEDS);

    expect(tokens["--font-family-heading"]).toContain("Inter");
    expect(tokens["--font-family-body"]).toContain("Roboto");
    expect(tokens["--font-size-display"]).toBe("5.875rem");
    expect(tokens["--font-size-body"]).toBe("1rem");
    expect(tokens["--line-height-display"]).toBe("1.02");
    expect(tokens["--font-weight-heading"]).toBe("760");
    expect(tokens["--button-font-size"]).toBe("0.875rem");
    expect(tokens["--letter-spacing-heading"]).toBe("0em");
    expect(mediaTokens["max-width: 640px"]["--font-size-display"]).toBe(
      "3.5rem",
    );
  });

  it("derives raw tokens from expressive editorial typography seeds", () => {
    const seeds = {
      density: 80,
      headlineStyle: 85,
      pairing: "editorial_contrast",
      scale: 90,
      style: "editorial",
      tightness: 75,
      weight: 45,
    } as const;
    const tokens = generateTypographyThemeTokens(seeds);
    const mediaTokens = generateTypographyMediaThemeTokens(seeds);

    expect(tokens["--font-family-heading"]).toBe(
      "Georgia, \"Times New Roman\", Times, serif",
    );
    expect(tokens["--font-size-display"]).toBe("6.7825rem");
    expect(tokens["--font-size-body"]).toBe("1.016rem");
    expect(tokens["--line-height-display"]).toBe("0.945");
    expect(tokens["--font-weight-heading"]).toBe("670");
    expect(tokens["--letter-spacing-heading"]).toBe("-0.045em");
    expect(mediaTokens["max-width: 1100px"]["--font-size-display"]).toBe(
      "5.3394rem",
    );
  });

  it("clamps and normalizes invalid seed patches", () => {
    expect(
      sanitizeTypographySeeds({
        density: -10,
        headlineStyle: 130,
        pairing: "mismatch",
        scale: 140,
        style: "poster",
        tightness: -20,
        weight: 500,
      } as unknown as Parameters<typeof sanitizeTypographySeeds>[0]),
    ).toEqual({
      ...DEFAULT_TYPOGRAPHY_SEEDS,
      density: 0,
      headlineStyle: 100,
      scale: 100,
      tightness: 0,
      weight: 100,
    });
  });
});
