import { describe, expect, it } from "vitest";
import { getStaticLogoFitCount } from "../src/components/sections/logoMarqueeLockups";

describe("getStaticLogoFitCount", () => {
  it("counts only logos that fit within the available row width", () => {
    const group = document.createElement("div");
    group.style.display = "flex";
    group.style.gap = "48px";

    const widths = [120, 80, 100, 90];
    for (const width of widths) {
      const item = document.createElement("span");
      item.className = "marquee__item";
      item.style.width = `${width}px`;
      item.style.height = "20px";
      item.getBoundingClientRect = () =>
        ({
          width,
          height: 20,
          top: 0,
          left: 0,
          right: width,
          bottom: 20,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }) as DOMRect;
      group.append(item);
    }

    document.body.append(group);

    expect(getStaticLogoFitCount(299, group)).toBe(2);
    expect(getStaticLogoFitCount(300, group)).toBe(3);
    expect(getStaticLogoFitCount(1000, group)).toBe(4);

    group.remove();
  });
});
