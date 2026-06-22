import { describe, expect, it } from "vitest";
import { generateHeroBackground } from "../src/components/overlay/heroGeneratedBackground";

describe("hero generated backgrounds", () => {
  it("builds a hiro gradient from the brand palette seeds", () => {
    const background = generateHeroBackground({
      primary: "#177527",
      secondary: "#00d4ff",
      accent: "#ff6b35",
      highlight: "#fde68a",
    });

    expect(background.source).toBe("hiro");
    expect(background.id).toMatch(/^hiro-[0-9a-f]+-\d+$/);
    expect(background.backgroundImage).toMatch(
      /^url\("data:image\/jpeg;base64,|^linear-gradient\(/,
    );
    expect(background.backgroundColor).toBe("#177527");
    expect(background.backgroundSize).toBe("cover");
    expect(background.tone).toMatch(/^(dark|light)$/);
  });

  it("changes the generated background when palette seeds change", () => {
    const initial = generateHeroBackground({
      primary: "#177527",
      secondary: "#00d4ff",
      accent: "#ff6b35",
      highlight: "#fde68a",
    });
    const remixed = generateHeroBackground({
      primary: "#f97316",
      secondary: "#00d4ff",
      accent: "#ff6b35",
      highlight: "#fde68a",
    });

    expect(remixed.id).not.toBe(initial.id);
    expect(remixed.backgroundImage).not.toBe(initial.backgroundImage);
  });

  it("keeps generation deterministic for the same palette", () => {
    const palette = {
      primary: "#635bff",
      secondary: "#00d4ff",
      accent: "#ff6b35",
      highlight: "#fde68a",
    };

    expect(generateHeroBackground(palette)).toEqual(generateHeroBackground(palette));
  });

  it("creates a fresh hero background on each remix generation", () => {
    const palette = {
      primary: "#635bff",
      secondary: "#00d4ff",
      accent: "#ff6b35",
      highlight: "#fde68a",
    };

    const initial = generateHeroBackground(palette, { generation: 0 });
    const remixed = generateHeroBackground(palette, { generation: 1 });

    expect(remixed.id).not.toBe(initial.id);
  });
});
