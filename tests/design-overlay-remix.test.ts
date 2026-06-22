import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_DESIGN_OVERLAY_VALUES } from "../src/components/overlay/designOverlayModel";
import { buildPaletteRemixPatch, resetPaletteRemixHistory } from "../src/components/overlay/designOverlayRemix";

describe("buildPaletteRemixPatch", () => {
  afterEach(() => {
    resetPaletteRemixHistory();
  });
  it("returns a different palette than the current seeds", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.42);

    let step = 0;
    const patch = buildPaletteRemixPatch(DEFAULT_DESIGN_OVERLAY_VALUES, () => {
      const current = step;
      step += 1;
      return current;
    });

    expect(patch.primaryColor).not.toBe(DEFAULT_DESIGN_OVERLAY_VALUES.primaryColor);
    expect(patch.secondaryColor).not.toBe(DEFAULT_DESIGN_OVERLAY_VALUES.secondaryColor);
    expect(patch.accentColor).not.toBe(DEFAULT_DESIGN_OVERLAY_VALUES.accentColor);
    expect(patch.highlightColor).not.toBe(DEFAULT_DESIGN_OVERLAY_VALUES.highlightColor);
  });

  it("changes palette again when remixing from the previous result", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.42);

    let step = 0;
    const consumeStep = () => {
      const current = step;
      step += 1;
      return current;
    };

    const firstPatch = buildPaletteRemixPatch(DEFAULT_DESIGN_OVERLAY_VALUES, consumeStep);
    const secondPatch = buildPaletteRemixPatch(
      { ...DEFAULT_DESIGN_OVERLAY_VALUES, ...firstPatch },
      consumeStep,
    );

    expect(secondPatch.primaryColor).not.toBe(firstPatch.primaryColor);
  });

  it("avoids repeating a palette from the recent remix history", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.42);

    let step = 0;
    const consumeStep = () => {
      const current = step;
      step += 1;
      return current;
    };

    let current = DEFAULT_DESIGN_OVERLAY_VALUES;
    const primaries: string[] = [];

    for (let index = 0; index < 4; index += 1) {
      const patch = buildPaletteRemixPatch(current, consumeStep);
      primaries.push(String(patch.primaryColor));
      current = { ...current, ...patch };
    }

    expect(new Set(primaries).size).toBe(primaries.length);
  });
});
