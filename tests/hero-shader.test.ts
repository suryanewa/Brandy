import { describe, expect, it } from "vitest";
import {
  getHeroShaderContainerSize,
  getHeroShaderDisplayScale,
  getHeroShaderRenderProps,
  measureHeroShaderDisplayScale,
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

  it("returns zero scale when the hero container has no measurable size", () => {
    expect(getHeroShaderDisplayScale(0, 960, "water", 1280, 720)).toBe(0);
    expect(getHeroShaderDisplayScale(1440, 0, "water", 1280, 720)).toBe(0);
  });

  it("falls back to the viewport hero footprint before the hero section mounts", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1600,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 900,
    });
    document.documentElement.style.setProperty("--navbar-min-height", "72px");
    document.documentElement.style.setProperty("--stroke-thin", "1px");

    const { height, width } = getHeroShaderContainerSize();
    expect(width).toBe(1600);
    expect(height).toBe(827);
    expect(
      measureHeroShaderDisplayScale("water", 1280, 720),
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
