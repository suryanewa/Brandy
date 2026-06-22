import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_DESIGN_OVERLAY_VALUES } from "../src/components/overlay/designOverlayModel";
import {
  resetHeroBackgroundRuntimeState,
  setGlobalHeroBackgroundEnabled,
  syncHeroVisualFromDesignValues,
} from "../src/components/overlay/heroBackgroundRuntime";

describe("hero background runtime", () => {
  beforeEach(() => {
    resetHeroBackgroundRuntimeState();
    document.documentElement.style.removeProperty("--brandy-hero-background-color");
    document.documentElement.style.removeProperty("--brandy-hero-background-image");
    document.documentElement.style.removeProperty("--brand-primary-500");
    document.documentElement.style.removeProperty("--brand-secondary-500");
    document.documentElement.style.removeProperty("--brand-accent-500");
    document.documentElement.style.removeProperty("--brand-highlight-500");
  });

  it("uses effective CSS brand tokens instead of stale overlay defaults", () => {
    document.documentElement.style.setProperty("--brand-primary-500", "#88e94c");
    document.documentElement.style.setProperty("--brand-secondary-500", "#45ea7a");
    document.documentElement.style.setProperty("--brand-accent-500", "#b95ff0");
    document.documentElement.style.setProperty("--brand-highlight-500", "#f1d3e8");

    setGlobalHeroBackgroundEnabled(true);
    syncHeroVisualFromDesignValues({
      ...DEFAULT_DESIGN_OVERLAY_VALUES,
      primaryColor: "#635bff",
      secondaryColor: "#00d4ff",
      accentColor: "#ff6b35",
      highlightColor: "#fde68a",
    });

    expect(
      document.documentElement.style.getPropertyValue("--brandy-hero-background-color"),
    ).toBe("#88e94c");
  });

  it("keeps the generated background image available for shader fallback", () => {
    document.documentElement.style.setProperty("--brand-primary-500", "#88e94c");
    document.documentElement.style.setProperty("--brand-secondary-500", "#45ea7a");
    document.documentElement.style.setProperty("--brand-accent-500", "#b95ff0");
    document.documentElement.style.setProperty("--brand-highlight-500", "#f1d3e8");

    setGlobalHeroBackgroundEnabled(true);

    expect(
      document.documentElement.style.getPropertyValue("--brandy-hero-background-image"),
    ).not.toBe("");
  });
});
