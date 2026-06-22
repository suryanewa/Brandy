import { describe, expect, it } from "vitest";
import {
  getHeroShaderDisplayScale,
  getHeroShaderRenderProps,
  selectHeroShader,
} from "../src/components/overlay/heroShaderSelection";

describe("hero shader selection", () => {
  it("picks a deterministic shader for the same palette", () => {
    const palette = {
      primary: "#635bff",
      secondary: "#00d4ff",
      accent: "#ff6b35",
      highlight: "#fde68a",
    };

    expect(selectHeroShader(palette)).toEqual(selectHeroShader(palette));
  });

  it("changes shader selection when palette seeds change", () => {
    const initial = selectHeroShader({
      primary: "#177527",
      secondary: "#00d4ff",
      accent: "#ff6b35",
      highlight: "#fde68a",
    });
    const remixed = selectHeroShader({
      primary: "#f97316",
      secondary: "#00d4ff",
      accent: "#ff6b35",
      highlight: "#fde68a",
    });

    expect(remixed).not.toEqual(initial);
  });

  it("forces cover sizing props after preset defaults", () => {
    const shader = selectHeroShader({
      primary: "#635bff",
      secondary: "#00d4ff",
      accent: "#ff6b35",
      highlight: "#fde68a",
    });

    expect(getHeroShaderRenderProps(shader).fit).toBe("cover");
    expect(getHeroShaderRenderProps(shader).scale).toBeGreaterThanOrEqual(1);
  });

  it("scales the shader canvas to cover tall hero sections", () => {
    expect(
      getHeroShaderDisplayScale(1440, 960, "water", 1280, 720),
    ).toBeGreaterThan(1.5);
  });

  it("varies shader selection across remix generations", () => {
    const palette = {
      primary: "#635bff",
      secondary: "#00d4ff",
      accent: "#ff6b35",
      highlight: "#fde68a",
    };

    const selections = Array.from({ length: 6 }, (_, generation) =>
      JSON.stringify(selectHeroShader(palette, { generation })),
    );

    expect(new Set(selections).size).toBeGreaterThan(1);
  });
});
