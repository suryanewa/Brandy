import { describe, expect, it } from "vitest";
import {
  COOLSHAPES_CATEGORY_COUNTS,
  COOLSHAPES_MARK_SHAPE_OPTIONS,
  CUSTOM_LOCKUP_SHAPE_OPTIONS,
  DEFAULT_LOCKUP_SEEDS,
  LOCKUP_GENERATED_TOKEN_NAMES,
  LOCKUP_SHAPE_OPTIONS,
  generateLockupThemeTokens,
  sanitizeLockupSeeds,
} from "../src/lib/lockupTheme.mjs";

describe("lockup theme generator", () => {
  it("generates exactly the declared lockup token set", () => {
    expect(Object.keys(generateLockupThemeTokens(DEFAULT_LOCKUP_SEEDS)).sort()).toEqual(
      [...LOCKUP_GENERATED_TOKEN_NAMES].sort(),
    );
  });

  it("maps default lockup seeds to Brandy lockup tokens", () => {
    const tokens = generateLockupThemeTokens(DEFAULT_LOCKUP_SEEDS);

    expect(tokens["--lockup-logo-size"]).toBe("20px");
    expect(tokens["--lockup-wordmark-font"]).toContain("Archivo");
    expect(tokens["--lockup-wordmark-size"]).toBe("16px");
    expect(tokens["--lockup-wordmark-tracking"]).toBe("0px");
    expect(tokens["--lockup-gap"]).toBe("8px");
    expect(tokens["--navbar-brand-mark-size"]).toBe("var(--lockup-logo-size)");
  });

  it("clamps and normalizes invalid seed patches", () => {
    expect(
      sanitizeLockupSeeds({
        gap: -10,
        logoSize: 999,
        markShape: "star-0",
        wordmarkFont: "papyrus",
        wordmarkSize: -4,
        wordmarkTracking: 20,
      } as unknown as Parameters<typeof sanitizeLockupSeeds>[0]),
    ).toEqual({
      ...DEFAULT_LOCKUP_SEEDS,
      gap: 0,
      logoSize: 72,
      markShape: "coolshape:star:0",
      wordmarkSize: 12,
      wordmarkTracking: 10,
    });
  });

  it("includes every documented Coolshapes category and index", () => {
    expect(COOLSHAPES_MARK_SHAPE_OPTIONS).toHaveLength(
      Object.values(COOLSHAPES_CATEGORY_COUNTS).reduce(
        (total, count) => total + count,
        0,
      ),
    );

    for (const [category, count] of Object.entries(COOLSHAPES_CATEGORY_COUNTS)) {
      const options = COOLSHAPES_MARK_SHAPE_OPTIONS.filter(
        (option) => option.category === category,
      );

      expect(options.map((option) => option.index)).toEqual(
        Array.from({ length: count }, (_, index) => index),
      );
      expect(options.map((option) => option.value)).toEqual(
        Array.from(
          { length: count },
          (_, index) => `coolshape:${category}:${index}`,
        ),
      );
    }
  });

  it("includes the custom geometric mark shapes before Coolshapes", () => {
    expect(CUSTOM_LOCKUP_SHAPE_OPTIONS.map((option) => option.value)).toEqual([
      "square",
      "rounded_square",
      "triangle",
      "rounded_triangle",
      "diamond",
      "rounded_diamond",
      "circle",
      "grid_squares",
      "grid_triangles",
      "grid_circles",
    ]);
    expect(LOCKUP_SHAPE_OPTIONS.slice(0, CUSTOM_LOCKUP_SHAPE_OPTIONS.length)).toEqual(
      CUSTOM_LOCKUP_SHAPE_OPTIONS,
    );
  });
});
