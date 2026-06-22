import { describe, expect, it } from "vitest";
import {
  DEFAULT_TYPOGRAPHY_SEEDS,
  TYPOGRAPHY_FONT_IDS,
  TYPOGRAPHY_GENERATED_MEDIA_TOKEN_NAMES,
  TYPOGRAPHY_GENERATED_TOKEN_NAMES,
  TYPOGRAPHY_PAIRING_OPTIONS,
  TYPOGRAPHY_STYLE_OPTIONS,
  generateTypographyMediaThemeTokens,
  generateTypographyRemix,
  generateTypographyThemeTokens,
  isSerifFontStack,
  resolveButtonFontStack,
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
    expect(tokens["--font-family-button"]).toContain("Roboto");
    expect(isSerifFontStack(tokens["--font-family-button"])).toBe(false);
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
    expect(tokens["--font-family-body"]).toContain("Inter");
    expect(tokens["--font-family-button"]).toContain("Inter");
    expect(isSerifFontStack(tokens["--font-family-button"])).toBe(false);
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
        primaryFont: "papyrus",
        scale: 140,
        secondaryFont: "comic_sans",
        style: "poster",
        tightness: -20,
        weight: 500,
      } as unknown as Parameters<typeof sanitizeTypographySeeds>[0]),
    ).toEqual({
      ...DEFAULT_TYPOGRAPHY_SEEDS,
      density: 0,
      headlineStyle: 100,
      primaryFont: "inter",
      scale: 100,
      secondaryFont: "roboto",
      tightness: 0,
      weight: 100,
    });
  });

  it("never resolves button fonts to a serif stack", () => {
    const remixes = Array.from({ length: 110 }, (_, step) =>
      generateTypographyRemix({ salt: 0, step }),
    );

    for (const remix of remixes) {
      const buttonFont = generateTypographyThemeTokens(remix)["--font-family-button"];
      expect(isSerifFontStack(buttonFont)).toBe(false);
    }
  });

  it("prefers the non-serif body stack for buttons before heading", () => {
    expect(
      resolveButtonFontStack({
        body: "Inter, ui-sans-serif, system-ui, sans-serif",
        heading: "Georgia, \"Times New Roman\", Times, serif",
      }),
    ).toBe("Inter, ui-sans-serif, system-ui, sans-serif");
    expect(
      resolveButtonFontStack({
        body: "Georgia, \"Times New Roman\", Times, serif",
        heading: "Inter, ui-sans-serif, system-ui, sans-serif",
      }),
    ).toBe("Inter, ui-sans-serif, system-ui, sans-serif");
    expect(
      resolveButtonFontStack({
        body: "Georgia, \"Times New Roman\", Times, serif",
        heading: "Lora, Georgia, \"Times New Roman\", serif",
      }),
    ).toContain("Roboto");
  });

  it("generates deterministic curated typography remixes", () => {
    expect(generateTypographyRemix({ salt: 0, step: 0 })).toEqual({
      density: 58,
      headlineStyle: 64,
      pairing: "display_plus_text",
      primaryFont: "inter",
      scale: 72,
      secondaryFont: "roboto",
      style: "geometric",
      tightness: 54,
      weight: 64,
    });
    expect(generateTypographyRemix({ salt: 0, step: 1 })).toEqual({
      density: 56,
      headlineStyle: 72,
      pairing: "display_plus_text",
      primaryFont: "space_grotesk",
      scale: 76,
      secondaryFont: "dm_sans",
      style: "geometric",
      tightness: 56,
      weight: 68,
    });
    expect(generateTypographyRemix({ salt: 0, step: 0 })).toEqual(
      generateTypographyRemix({ salt: 0, step: 0 }),
    );
    expect(generateTypographyRemix({ salt: 1, step: 0 })).toEqual(
      generateTypographyRemix({ salt: 0, step: 1 }),
    );
  });

  it("covers every typography style and pairing across remix presets", () => {
    expect(TYPOGRAPHY_FONT_IDS.length).toBeGreaterThanOrEqual(130);

    const remixes = Array.from({ length: 110 }, (_, step) =>
      generateTypographyRemix({ salt: 0, step }),
    );

    expect(new Set(remixes.map((remix) => remix.style))).toEqual(
      new Set(TYPOGRAPHY_STYLE_OPTIONS),
    );
    expect(new Set(remixes.map((remix) => remix.pairing))).toEqual(
      new Set(TYPOGRAPHY_PAIRING_OPTIONS),
    );
    expect(
      remixes.map((remix) => generateTypographyThemeTokens(remix)["--font-family-heading"]),
    ).toContain("Georgia, \"Times New Roman\", Times, serif");
    expect(
      new Set(remixes.map((remix) => `${remix.primaryFont}/${remix.secondaryFont}`)).size,
    ).toBeGreaterThanOrEqual(80);
    expect(new Set(remixes.map((remix) => remix.primaryFont)).size).toBeGreaterThanOrEqual(
      55,
    );
    expect(
      new Set(remixes.map((remix) => remix.secondaryFont)).size,
    ).toBeGreaterThanOrEqual(45);
    for (const remix of remixes) {
      expect(TYPOGRAPHY_FONT_IDS).toContain(remix.primaryFont);
      expect(TYPOGRAPHY_FONT_IDS).toContain(remix.secondaryFont);
    }
  });
});
