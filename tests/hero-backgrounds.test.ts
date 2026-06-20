import { describe, expect, it } from "vitest";
import { EXTERNAL_HERO_BACKGROUNDS } from "../src/components/overlay/externalHeroBackgrounds";
import {
  HERO_BACKGROUNDS,
  selectHeroGradientBackground,
} from "../src/components/overlay/heroGradientBackgrounds";
import { PATTERN_CRAFT_BACKGROUNDS } from "../src/components/overlay/patternCraftBackgrounds";

describe("hero background catalog", () => {
  it("includes PatternCraft hero backgrounds in palette matching", () => {
    const tealPattern = PATTERN_CRAFT_BACKGROUNDS.find(
      (background) => background.id === "patterncraft-top-teal-glow",
    );
    const selectedPattern = selectHeroGradientBackground({
      primaryColor: "#14b8a6",
      secondaryColor: "#10b981",
    });

    expect(PATTERN_CRAFT_BACKGROUNDS).toHaveLength(257);
    expect(HERO_BACKGROUNDS).toEqual(expect.arrayContaining([...PATTERN_CRAFT_BACKGROUNDS]));
    expect(tealPattern?.backgroundImage).toContain("#14b8a6");
    expect(tealPattern?.backgroundSize).toBe("100% 100%");
    expect(selectedPattern.source).toBe("patterncraft");
  });

  it("includes external library hero backgrounds in palette matching", () => {
    const countsBySource = EXTERNAL_HERO_BACKGROUNDS.reduce<Record<string, number>>(
      (counts, background) => {
        counts[background.source] = (counts[background.source] ?? 0) + 1;
        return counts;
      },
      {},
    );
    const selectedExternal = selectHeroGradientBackground({
      primaryColor: "#f43f5e",
      secondaryColor: "#8b5cf6",
    });

    expect(EXTERNAL_HERO_BACKGROUNDS).toHaveLength(88);
    expect(countsBySource).toMatchObject({
      aceternity: 11,
      animateui: 7,
      kokonutui: 4,
      magicui: 11,
      reactbits: 45,
      uilayouts: 3,
      vengenceui: 7,
    });
    expect(HERO_BACKGROUNDS).toEqual(expect.arrayContaining([...EXTERNAL_HERO_BACKGROUNDS]));
    expect(EXTERNAL_HERO_BACKGROUNDS.map((background) => background.id)).toEqual(
      expect.arrayContaining([
        "aceternity-aurora-background",
        "animateui-gradient-background",
        "kokonutui-flow-field",
        "magicui-flickering-grid",
        "reactbits-ferrofluid",
        "uilayouts-berries-mesh-gradient",
        "vengenceui-aurora-hero",
      ]),
    );
    expect(selectedExternal.backgroundImage).not.toBe("");
  });
});
