import {
  act,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DesignOverlay } from "../src/components/overlay";
import {
  DEFAULT_DESIGN_OVERLAY_VALUES,
  DESIGN_OVERLAY_STORAGE_KEY,
  getDesignCssVariables,
  readStoredDesignValues,
  snapToStep,
} from "../src/components/overlay/designOverlayModel";
import { DESIGN_TOKEN_STORAGE_KEY } from "../src/components/overlay/designTokenCatalog";
import {
  getHeroVisualGeneration,
  resetHeroBackgroundRuntimeState,
} from "../src/components/overlay/heroBackgroundRuntime";
import { resetPaletteRemixHistory } from "../src/components/overlay/designOverlayRemix";
vi.setConfig({ testTimeout: 10000 });

const SOURCE_SYNC_TEST_WAIT_MS = 700;

async function waitForSourceSyncDebounce() {
  await act(async () => {
    vi.advanceTimersByTime(SOURCE_SYNC_TEST_WAIT_MS);
    await Promise.resolve();
  });
  vi.useRealTimers();
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  window.localStorage.clear();
  resetHeroBackgroundRuntimeState();
  resetPaletteRemixHistory();
  delete document.documentElement.dataset.brandyHeroBackground;
  delete document.documentElement.dataset.brandyHeroBackgroundId;
  delete document.documentElement.dataset.brandyHeroBackgroundSource;
  delete document.documentElement.dataset.brandyHeroBackgroundTone;
  delete document.documentElement.dataset.brandyHeroShader;
  delete document.documentElement.dataset.brandyHeroShaderType;
  delete document.documentElement.dataset.brandyHeroShaderPreset;
  document.documentElement.removeAttribute("style");
});

function getCheckedRadioValue<Value extends string>(
  groupName: string,
  options: Record<string, Value>,
): Value {
  const group = screen.getByRole("radiogroup", { name: groupName });

  for (const [label, value] of Object.entries(options)) {
    if (
      within(group)
        .getByRole("radio", { name: label })
        .getAttribute("aria-checked") === "true"
    ) {
      return value;
    }
  }

  throw new Error(`No checked radio found in ${groupName}`);
}

describe("DesignOverlay", () => {
  it("opens as a side-panel dialog from the floating trigger", () => {
    render(<DesignOverlay />);

    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    expect(
      screen.getByRole("dialog", { name: "Design Settings" }).getAttribute(
        "aria-modal",
      ),
    ).toBe("true");
    expect(
      screen.getByRole("button", { name: "Reset design" }).hasAttribute("disabled"),
    ).toBe(true);
  });

  it("toggles the settings pane with Cmd+, and closes with Escape", () => {
    render(<DesignOverlay />);

    fireEvent.keyDown(window, { key: ",", code: "Comma", metaKey: true });
    expect(screen.getByRole("dialog", { name: "Design Settings" })).toBeTruthy();

    fireEvent.keyDown(window, { key: ",", code: "Comma", metaKey: true });
    expect(screen.queryByRole("dialog", { name: "Design Settings" })).toBeNull();

    fireEvent.keyDown(window, { key: ",", code: "Comma", metaKey: true });
    expect(screen.getByRole("dialog", { name: "Design Settings" })).toBeTruthy();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Design Settings" })).toBeNull();
  });

  it("applies design control changes as CSS variables", () => {
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    for (const hiddenControl of [
      "Elevation value",
      "Container width value",
      "Navbar blur value",
      "Browser height value",
      "Demo height value",
      "Chrome height value",
    ]) {
      expect(screen.queryByLabelText(hiddenControl)).toBeNull();
    }
    expect(screen.queryByRole("button", { name: "Demo frames" })).toBeNull();
    expect(screen.getByRole("radiogroup", { name: "Page width" })).toBeTruthy();
    expect(screen.getByRole("radiogroup", { name: "Hero presence" })).toBeTruthy();
    expect(screen.getByRole("radiogroup", { name: "Grid density" })).toBeTruthy();
    expect(screen.getByLabelText("Spacing value")).toBeTruthy();
    expect(screen.getByLabelText("Corners value")).toBeTruthy();
    expect(screen.getByLabelText("Page gutter value")).toBeTruthy();
    expect(screen.getByLabelText("Hero emphasis value")).toBeTruthy();
    expect(screen.getByLabelText("Text width value")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Remix layout" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Motion" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Mode preview" })).toBeNull();
    expect(screen.getByRole("switch", { name: "Muted mode" })).toBeTruthy();
    expect(screen.getByRole("switch", { name: "High contrast" })).toBeTruthy();

    fireEvent.click(screen.getByRole("radio", { name: "Wide" }));
    expect(document.documentElement.style.getPropertyValue("--container-lg")).toBe(
      "1328px",
    );
    fireEvent.change(screen.getByLabelText("Hero emphasis value"), {
      target: { value: "40" },
    });
    fireEvent.blur(screen.getByLabelText("Hero emphasis value"));
    expect(document.documentElement.style.getPropertyValue("--hero-grid-text-fr")).toBe(
      "1.2fr",
    );

    fireEvent.change(screen.getByLabelText("Primary hex color"), {
      target: { value: "#2563eb" },
    });
    fireEvent.blur(screen.getByLabelText("Primary hex color"));

    expect(
      document.documentElement.style.getPropertyValue("--color-accent"),
    ).toBe("#2157cf");
    expect(
      document.documentElement.style.getPropertyValue("--brand-primary-500"),
    ).toBe("#2563eb");
    expect(
      document.documentElement.style.getPropertyValue("--button-primary-hover"),
    ).not.toBe("");
    expect(
      screen.getByRole("button", { name: "Reset design" }).hasAttribute("disabled"),
    ).toBe(false);
  });

  it("orders typography above layout in the settings panel", () => {
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    const panelText =
      screen.getByRole("dialog", { name: "Design Settings" }).textContent ?? "";

    expect(panelText.indexOf("Palette")).toBeLessThan(
      panelText.indexOf("Typography"),
    );
    expect(panelText.indexOf("Typography")).toBeLessThan(
      panelText.indexOf("Layout"),
    );
  });

  it("blurs section toggles after pointer activation so actions can hide on hover out", () => {
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    const paletteToggle = screen.getByRole("button", { name: "Palette" });
    paletteToggle.focus();
    expect(document.activeElement).toBe(paletteToggle);

    fireEvent.pointerUp(paletteToggle);

    expect(document.activeElement).not.toBe(paletteToggle);
  });

  it("locks viewport-height layout controls by default", () => {
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    const spacingLock = screen.getByRole("button", { name: "Unlock Spacing" });
    const heroPresenceLock = screen.getByRole("button", {
      name: "Unlock Hero presence",
    });

    expect(spacingLock.getAttribute("aria-pressed")).toBe("true");
    expect(heroPresenceLock.getAttribute("aria-pressed")).toBe("true");
    expect(
      screen.getByRole("button", { name: "Reset Spacing" }).hasAttribute("disabled"),
    ).toBe(true);
    expect(
      screen.getByRole("button", { name: "Reset Hero presence" }).hasAttribute("disabled"),
    ).toBe(true);
  });

  it("locks whole sections from reset, remix, and spacebar remix", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.9);
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));
    fireEvent.click(screen.getByRole("button", { name: "Lock Palette" }));

    expect(
      screen.getByRole("button", { name: "Remix palette" }).hasAttribute("disabled"),
    ).toBe(true);
    expect(
      screen.getByRole("button", { name: "Reset Palette" }).hasAttribute("disabled"),
    ).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Remix palette" }));
    fireEvent.keyDown(window, { key: " " });

    expect(document.documentElement.style.getPropertyValue("--brand-primary-500")).toBe("#635bff");
    expect((screen.getByLabelText("Primary hex color") as HTMLInputElement).value).toBe(
      "#635bff",
    );
    expect(document.documentElement.style.getPropertyValue("--font-size-display")).not.toBe(
      "",
    );
  });

  it("adds a palette-matched hero background from the sections tab", async () => {
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));
    fireEvent.click(screen.getByRole("tab", { name: "Sections" }));
    fireEvent.click(screen.getByRole("button", { name: "Hero" }));

    const backgroundToggle = screen.getByRole("switch", {
      name: "Background",
    }) as HTMLInputElement;
    expect(backgroundToggle.checked).toBe(false);
    expect(document.documentElement.dataset.brandyHeroBackground).toBeUndefined();

    fireEvent.click(backgroundToggle);

    const initialBackground = document.documentElement.style.getPropertyValue(
      "--brandy-hero-background-image",
    );
    const initialBackgroundId = document.documentElement.dataset.brandyHeroBackgroundId;
    expect(backgroundToggle.checked).toBe(true);
    expect(document.documentElement.dataset.brandyHeroBackground).toBe("on");
    expect(document.documentElement.dataset.brandyHeroBackgroundId).toBeTruthy();
    expect(document.documentElement.dataset.brandyHeroBackgroundSource).toBe("hiro");
    expect(document.documentElement.dataset.brandyHeroBackgroundTone).toMatch(
      /^(dark|light)$/,
    );
    expect(initialBackground).not.toBe("");
    expect(
      document.documentElement.style.getPropertyValue("--brandy-hero-background-size"),
    ).not.toBe("");
    expect(
      document.documentElement.style.getPropertyValue("--brandy-hero-background-position"),
    ).not.toBe("");
    expect(
      document.documentElement.style.getPropertyValue("--brandy-hero-background-repeat"),
    ).not.toBe("");

    fireEvent.click(screen.getByRole("tab", { name: "Design" }));
    fireEvent.change(screen.getByLabelText("Primary hex color"), {
      target: { value: "#f97316" },
    });
    fireEvent.blur(screen.getByLabelText("Primary hex color"));

    await waitFor(() => {
      const rematchedBackground = document.documentElement.style.getPropertyValue(
        "--brandy-hero-background-image",
      );
      expect(rematchedBackground).not.toBe("");
      expect(document.documentElement.dataset.brandyHeroBackgroundId).not.toBe(
        initialBackgroundId,
      );
    });

    fireEvent.click(screen.getByRole("tab", { name: "Sections" }));
    fireEvent.click(screen.getByRole("button", { name: "Hero" }));
    fireEvent.click(screen.getByRole("switch", { name: "Background" }));

    expect(document.documentElement.dataset.brandyHeroBackground).toBeUndefined();
    expect(
      document.documentElement.style.getPropertyValue("--brandy-hero-background-image"),
    ).toBe("");
    expect(
      document.documentElement.style.getPropertyValue("--brandy-hero-background-size"),
    ).toBe("");
  });

  it("adds a palette-matched hero shader layer from the sections tab", async () => {
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));
    fireEvent.click(screen.getByRole("tab", { name: "Sections" }));
    fireEvent.click(screen.getByRole("button", { name: "Hero" }));

    const shaderToggle = screen.getByRole("switch", {
      name: "Shader",
    }) as HTMLInputElement;
    expect(shaderToggle.checked).toBe(false);
    expect(document.documentElement.dataset.brandyHeroShader).toBeUndefined();

    fireEvent.click(shaderToggle);

    await waitFor(() => {
      expect(shaderToggle.checked).toBe(true);
      expect(document.documentElement.dataset.brandyHeroBackground).toBe("on");
      expect(document.documentElement.dataset.brandyHeroShader).toBe("on");
      expect(document.documentElement.dataset.brandyHeroShaderType).toBeTruthy();
    });
    expect(
      document.documentElement.style.getPropertyValue("--brandy-hero-background-image"),
    ).toBe("");

    fireEvent.click(shaderToggle);
    expect(shaderToggle.checked).toBe(false);
    expect(document.documentElement.dataset.brandyHeroShader).toBeUndefined();
  });

  it("omits vertical navbar presets from the sections tab", () => {
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));
    fireEvent.click(screen.getByRole("tab", { name: "Sections" }));
    fireEvent.click(screen.getByRole("button", { name: "Navbar" }));

    const options = Array.from(
      screen.getByRole("combobox", { name: "Preset" }).querySelectorAll("option"),
    ).map((option) => option.textContent);

    expect(options).toEqual(["Default", "Centered logo", "Split"]);
  });

  it("only adjusts slider values by wheel over the numeric value", () => {
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    const spacingValue = screen.getByLabelText(
      "Spacing value",
    ) as HTMLInputElement;
    const spacingRow = spacingValue.closest(".design-overlay__slider-row");
    const spacingNumber = spacingValue.closest(".design-overlay__number-shell");
    const dialog = screen.getByRole("dialog", { name: "Design Settings" });
    const panelWheelSpy = vi.fn();

    expect(spacingRow).toBeTruthy();
    expect(spacingNumber).toBeTruthy();
    dialog.addEventListener("wheel", panelWheelSpy);

    fireEvent.wheel(spacingRow as Element, { deltaY: -100 });
    expect(spacingValue.value).toBe("70");
    expect(panelWheelSpy).toHaveBeenCalledTimes(1);
    expect(
      document.documentElement.style.getPropertyValue("--section-padding-y-md"),
    ).toBe("");

    fireEvent.wheel(spacingNumber as Element, { deltaY: -100 });
    expect(spacingValue.value).toBe("71");
    expect(panelWheelSpy).toHaveBeenCalledTimes(1);
    expect(
      document.documentElement.style.getPropertyValue("--section-padding-y-md"),
    ).toBe("3.55rem");
  });

  it("shows compact typography controls without raw typography token rows", () => {
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    expect(screen.getByRole("button", { name: "Remix typography" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Type style" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Pairing" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Primary font" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Secondary font" })).toBeTruthy();
    expect(screen.queryByRole("radiogroup", { name: "Type style" })).toBeNull();
    expect(screen.queryByRole("radiogroup", { name: "Pairing" })).toBeNull();
    expect(screen.getByLabelText("Scale value")).toBeTruthy();
    expect(screen.getByLabelText("Density value")).toBeTruthy();
    expect(screen.getByLabelText("Weight value")).toBeTruthy();
    expect(screen.getByLabelText("Headline style value")).toBeTruthy();
    expect(screen.getByLabelText("Tightness value")).toBeTruthy();
    expect(screen.queryByLabelText("Body font size value")).toBeNull();
    expect(screen.queryByLabelText("Root line height value")).toBeNull();
    expect(screen.queryByLabelText("Heading letter spacing value")).toBeNull();
    expect(screen.queryByPlaceholderText("Search tokens")).toBeNull();
    expect(screen.queryByLabelText("Token group filters")).toBeNull();
    expect(screen.queryByText(/tokens shown/)).toBeNull();
    for (const hiddenGroup of [
      "Alignment",
      "Base palette",
      "Components",
      "Effects",
      "Layout",
      "Motion",
      "Semantic colors",
      "Spacing",
      "Typography",
      "Z-index",
    ]) {
      expect(
        screen.queryByLabelText(`Toggle ${hiddenGroup} token group`),
      ).toBeNull();
    }
    expect(screen.queryByLabelText("Reset Layout tokens")).toBeNull();
    expect(screen.queryByLabelText("Reset Typography tokens")).toBeNull();
    expect(screen.queryByText("Token values")).toBeNull();
    expect(screen.queryByText("No tokens match the filters.")).toBeNull();
  });

  it("uses four brand seeds and derives the palette utility system", () => {
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    expect(screen.getByRole("button", { name: "Remix palette" })).toBeTruthy();
    expect(screen.getByLabelText("Primary hex color")).toBeTruthy();
    expect(screen.getByLabelText("Secondary hex color")).toBeTruthy();
    expect(screen.getByLabelText("Accent hex color")).toBeTruthy();
    expect(screen.getByLabelText("Highlight hex color")).toBeTruthy();
    expect(screen.getByRole("switch", { name: "Dark mode" })).toBeTruthy();
    expect(screen.getByRole("switch", { name: "Muted mode" })).toBeTruthy();
    expect(screen.getByRole("switch", { name: "High contrast" })).toBeTruthy();
    expect(screen.queryByLabelText("Primary presets")).toBeNull();
    expect(screen.queryByLabelText("Secondary presets")).toBeNull();
    expect(screen.queryByLabelText("Accent presets")).toBeNull();
    expect(screen.queryByLabelText("Highlight presets")).toBeNull();
    expect(screen.getByText("Primary hover")).toBeTruthy();
    expect(screen.getByText("Primary button")).toBeTruthy();
    expect(screen.getByText("Secondary surface")).toBeTruthy();
    expect(screen.getByText("Secondary border")).toBeTruthy();
    expect(screen.getByText("Secondary hover")).toBeTruthy();
    expect(screen.getByText("Link")).toBeTruthy();
    expect(screen.getByText("Link hover")).toBeTruthy();
    expect(screen.getByText("Border")).toBeTruthy();
    expect(screen.getByText("Primary text")).toBeTruthy();
    expect(screen.getByText("Secondary text")).toBeTruthy();
    expect(screen.queryByText("Readable text")).toBeNull();
    expect(screen.getByText("Highlight soft")).toBeTruthy();
    expect(screen.queryByLabelText("Page hex color")).toBeNull();
    expect(screen.queryByLabelText("Surface hex color")).toBeNull();
    expect(screen.queryByLabelText("Raised hex color")).toBeNull();
    expect(screen.queryByLabelText("Text hex color")).toBeNull();
    expect(screen.queryByRole("switch", { name: "Auto variants" })).toBeNull();
    expect(screen.queryByLabelText("Base palette")).toBeNull();
    expect(screen.queryByLabelText("Semantic colors")).toBeNull();
    expect(screen.queryByLabelText("Palette token values")).toBeNull();

    fireEvent.change(screen.getByLabelText("Highlight hex color"), {
      target: { value: "#fef08a" },
    });
    fireEvent.blur(screen.getByLabelText("Highlight hex color"));
    fireEvent.change(screen.getByLabelText("Accent hex color"), {
      target: { value: "#dc2626" },
    });
    fireEvent.blur(screen.getByLabelText("Accent hex color"));

    expect(document.documentElement.style.getPropertyValue("--brand-highlight-500")).toBe(
      "#fef08a",
    );
    expect(document.documentElement.style.getPropertyValue("--gradient-hero-accent")).toBe(
      "#c22121",
    );
    expect(document.documentElement.style.getPropertyValue("--color-on-highlight")).toBe(
      "#111416",
    );
  });

  it("opens derived color distance sliders from calculated palette colors", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, changedCount: 1 }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );

    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    expect(screen.getByText("Background")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Adjust Background derivation" }),
    );

    const backgroundDistancePercent = screen.getByLabelText(
      "Background distance value",
    ) as HTMLInputElement;
    expect(backgroundDistancePercent.value).toBe("100");
    expect(screen.getByText("%")).toBeTruthy();

    fireEvent.change(backgroundDistancePercent, { target: { value: "0" } });
    fireEvent.blur(backgroundDistancePercent);

    expect(document.documentElement.style.getPropertyValue("--color-bg")).toBe(
      "#ffffff",
    );

    expect(screen.queryByLabelText("Primary hover distance value")).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Adjust Primary hover derivation" }),
    );

    const primaryHoverDistancePercent = screen.getByLabelText(
      "Primary hover distance value",
    ) as HTMLInputElement;
    expect(primaryHoverDistancePercent.value).toBe("100");

    fireEvent.change(primaryHoverDistancePercent, { target: { value: "50" } });
    fireEvent.blur(primaryHoverDistancePercent);

    expect(document.documentElement.style.getPropertyValue("--button-primary-hover")).toBe(
      "#504acf",
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Adjust Primary button derivation" }),
    );

    const buttonPrimaryBgDistancePercent = screen.getByLabelText(
      "Primary button distance value",
    ) as HTMLInputElement;
    expect(buttonPrimaryBgDistancePercent.value).toBe("100");

    fireEvent.change(buttonPrimaryBgDistancePercent, { target: { value: "50" } });
    fireEvent.blur(buttonPrimaryBgDistancePercent);

    expect(document.documentElement.style.getPropertyValue("--button-primary-bg")).toBe(
      "#5d56f0",
    );

    fireEvent.click(screen.getByRole("button", { name: "Adjust Link derivation" }));
    expect(screen.getByLabelText("Link distance value")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Adjust Link hover derivation" }),
    );
    expect(screen.getByLabelText("Link hover distance value")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Adjust Border derivation" }));
    expect(screen.getByLabelText("Border distance value")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Adjust Secondary text derivation" }),
    );
    const secondaryTextDistancePercent = screen.getByLabelText(
      "Secondary text distance value",
    ) as HTMLInputElement;
    expect(secondaryTextDistancePercent.value).toBe("100");
    fireEvent.change(secondaryTextDistancePercent, { target: { value: "50" } });
    fireEvent.blur(secondaryTextDistancePercent);
    expect(document.documentElement.style.getPropertyValue("--color-muted")).toBe(
      "#1b1e3c",
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Adjust Secondary border derivation" }),
    );
    expect(screen.getByLabelText("Secondary border distance value")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Adjust Secondary hover derivation" }),
    );
    expect(screen.getByLabelText("Secondary hover distance value")).toBeTruthy();

    await waitForSourceSyncDebounce();

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const requestInit = fetchMock.mock.calls[0][1] as RequestInit;
    const payload = JSON.parse(String(requestInit.body)) as {
      brandDerivation: Record<string, number>;
      values: Record<string, string>;
    };

    expect(payload.brandDerivation).toMatchObject({
      accentMomentDistancePercent: 100,
      backgroundDistancePercent: 0,
      borderDistancePercent: 100,
      buttonPrimaryBgDistancePercent: 50,
      buttonSecondaryBorderDistancePercent: 100,
      buttonSecondaryHoverDistancePercent: 100,
      footerBackgroundDistancePercent: 100,
      footerBorderDistancePercent: 100,
      highlightSoftDistancePercent: 100,
      linkColorDistancePercent: 100,
      linkHoverDistancePercent: 100,
      navbarBackgroundDistancePercent: 100,
      navbarBorderDistancePercent: 100,
      neutralSurfaceDistancePercent: 100,
      primaryHoverDistancePercent: 50,
      readableTextDistancePercent: 100,
      secondaryTextDistancePercent: 50,
      secondarySurfaceDistancePercent: 100,
    });
    expect(payload.values["--button-primary-hover"]).toBeUndefined();
  });

  it("remixes palette seeds without source-sync churn", async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, changedCount: 1 }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );

    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    fireEvent.click(screen.getByRole("button", { name: "Remix palette" }));

    expect((screen.getByLabelText("Primary hex color") as HTMLInputElement).value).toBe(
      "#f7a036",
    );
    expect((screen.getByLabelText("Secondary hex color") as HTMLInputElement).value).toBe(
      "#dfe83b",
    );
    expect((screen.getByLabelText("Accent hex color") as HTMLInputElement).value).toBe(
      "#fc4232",
    );
    expect((screen.getByLabelText("Highlight hex color") as HTMLInputElement).value).toBe(
      "#d6eec0",
    );
    expect((screen.getByRole("switch", { name: "Dark mode" }) as HTMLInputElement).checked).toBe(
      false,
    );
    expect(
      document.documentElement.style.getPropertyValue("--brand-primary-500"),
    ).toBe("#f7a036");
    expect(
      document.documentElement.style.getPropertyValue("--gradient-hero-accent"),
    ).toBe("#99281e");
    expect(
      document.documentElement.style.getPropertyValue("--color-bg"),
    ).toBe("#fac482");
    expect(
      document.documentElement.style.getPropertyValue("--color-muted"),
    ).toBe("#4c4135");

    await waitForSourceSyncDebounce();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("randomizes palette toggles on section remix unless they are locked", () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));
    fireEvent.click(screen.getByRole("button", { name: "Lock Dark mode" }));

    randomSpy.mockReturnValue(0.9);
    fireEvent.click(screen.getByRole("button", { name: "Remix palette" }));

    expect((screen.getByRole("switch", { name: "Dark mode" }) as HTMLInputElement).checked).toBe(
      false,
    );
    expect((screen.getByRole("switch", { name: "Muted mode" }) as HTMLInputElement).checked).toBe(
      true,
    );
    expect(
      (screen.getByRole("switch", { name: "High contrast" }) as HTMLInputElement).checked,
    ).toBe(true);
  });

  it("remixes palette, typography, and layout with the Space shortcut", () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
    render(<DesignOverlay />);

    randomSpy.mockReturnValue(0.9);
    fireEvent.keyDown(window, { key: " " });

    const primary = document.documentElement.style.getPropertyValue("--brand-primary-500");
    expect(primary).not.toBe("");
    expect(primary).not.toBe("#635bff");
    expect(
      document.documentElement.style.getPropertyValue("--gradient-hero-accent"),
    ).not.toBe("");
    expect(document.documentElement.style.getPropertyValue("--color-muted")).not.toBe(
      "",
    );
    expect(document.documentElement.style.getPropertyValue("--font-size-display")).not.toBe(
      "",
    );
    expect(
      document.documentElement.style.getPropertyValue("--section-padding-y-md"),
    ).not.toBe("");
    expect(
      readStoredDesignValues(DEFAULT_DESIGN_OVERLAY_VALUES).highContrast,
    ).toBe(true);
  });

  it("commits one stable remix generation per shortcut or button in StrictMode", () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
    render(
      <StrictMode>
        <DesignOverlay />
      </StrictMode>,
    );

    randomSpy.mockReturnValue(0.9);
    fireEvent.keyDown(window, { key: " " });

    expect(getHeroVisualGeneration()).toBe(1);
    expect(document.documentElement.style.getPropertyValue("--font-size-display")).not.toBe(
      "",
    );
    expect(
      document.documentElement.style.getPropertyValue("--section-padding-y-md"),
    ).not.toBe("");

    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));
    fireEvent.click(screen.getByRole("button", { name: "Remix palette" }));

    expect(getHeroVisualGeneration()).toBe(2);
  });

  it("remixes with Space while focus is inside the settings panel", () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    const paletteToggle = screen.getByRole("button", { name: "Palette" });
    paletteToggle.focus();

    randomSpy.mockReturnValue(0.9);
    fireEvent.keyDown(paletteToggle, { key: " " });

    const primary = document.documentElement.style.getPropertyValue("--brand-primary-500");
    expect(primary).not.toBe("");
    expect(primary).not.toBe("#635bff");
    expect(document.activeElement).not.toBe(paletteToggle);
  });

  it("does not remix with Tab because Tab remains focus navigation", () => {
    render(<DesignOverlay />);

    fireEvent.keyDown(window, { key: "Tab" });

    expect(document.documentElement.style.getPropertyValue("--brand-primary-500")).toBe(
      "",
    );
    expect(document.documentElement.style.getPropertyValue("--font-size-display")).toBe(
      "",
    );
    expect(
      document.documentElement.style.getPropertyValue("--section-padding-y-md"),
    ).toBe("");
  });

  it("keeps sequential palette remixes producing different colors", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    fireEvent.click(screen.getByRole("button", { name: "Remix palette" }));
    const firstPrimary = (screen.getByLabelText("Primary hex color") as HTMLInputElement).value;

    fireEvent.click(screen.getByRole("button", { name: "Remix palette" }));
    const secondPrimary = (screen.getByLabelText("Primary hex color") as HTMLInputElement).value;

    expect(firstPrimary).not.toBe("#635bff");
    expect(secondPrimary).not.toBe(firstPrimary);
  });

  it("does not remix with Space while typing in controls", () => {
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    const primaryInput = screen.getByLabelText("Primary hex color");
    primaryInput.focus();
    fireEvent.keyDown(primaryInput, { key: " " });

    expect(document.documentElement.style.getPropertyValue("--brand-primary-500")).toBe(
      "",
    );
  });

  it("prevents Space from activating focused settings controls", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    render(<DesignOverlay />);

    const trigger = screen.getByRole("button", { name: "Open design settings" });
    trigger.focus();
    const triggerEventAllowed = fireEvent.keyDown(trigger, { key: " " });
    expect(triggerEventAllowed).toBe(false);
    expect(document.activeElement).not.toBe(trigger);
    expect(
      screen.getByRole("button", { name: "Open design settings" }).getAttribute(
        "aria-expanded",
      ),
    ).toBe("false");

    fireEvent.click(trigger);
    const panel = screen.getByRole("dialog", { name: "Design Settings" });
    expect(document.activeElement).toBe(panel);
    const panelEventAllowed = fireEvent.keyDown(panel, { key: " " });
    expect(panelEventAllowed).toBe(false);
    expect(document.activeElement).not.toBe(panel);

    const darkMode = screen.getByRole("switch", { name: "Dark mode" });
    darkMode.focus();
    const darkModeEventAllowed = fireEvent.keyDown(darkMode, { key: " " });
    expect(darkModeEventAllowed).toBe(false);
    expect(document.activeElement).not.toBe(darkMode);
    expect((darkMode as HTMLInputElement).checked).toBe(false);
  });

  it("toggles dark mode from palette and recalculates semantic colors", () => {
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    fireEvent.click(screen.getByRole("switch", { name: "Dark mode" }));

    expect(document.documentElement.style.getPropertyValue("--color-bg")).toBe(
      "#080916",
    );
    expect(document.documentElement.style.getPropertyValue("--color-surface")).toBe(
      "#0f0f28",
    );
    expect(document.documentElement.style.getPropertyValue("--color-text")).toBe(
      "#fafaff",
    );
    expect(
      document.documentElement.style.getPropertyValue("--button-primary-bg"),
    ).toBe("#635bff");
    expect(
      document.documentElement.style.getPropertyValue("--button-primary-hover"),
    ).toBe("#6561ad");
    expect(
      document.documentElement.style.getPropertyValue("--badge-brand-bg"),
    ).toBe("rgba(149, 143, 255, 0.16)");
  });

  it("keeps dark mode as a local palette preview without source sync", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, changedCount: 1 }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );

    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));
    fireEvent.click(screen.getByRole("switch", { name: "Dark mode" }));

    await waitForSourceSyncDebounce();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(
      JSON.parse(window.localStorage.getItem(DESIGN_OVERLAY_STORAGE_KEY) ?? "{}"),
    ).toMatchObject({ darkMode: true });
  });

  it("toggles dark mode with the D shortcut outside editable fields", () => {
    render(<DesignOverlay />);

    fireEvent.keyDown(window, { key: "d" });

    expect(document.documentElement.style.getPropertyValue("--color-bg")).toBe(
      "#080916",
    );

    fireEvent.keyDown(window, { key: "D" });

    expect(document.documentElement.style.getPropertyValue("--color-bg")).toBe("");
  });

  it("does not toggle dark mode with D while typing in controls", () => {
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    const primaryInput = screen.getByLabelText("Primary hex color");
    primaryInput.focus();
    fireEvent.keyDown(primaryInput, { key: "d" });

    expect(document.documentElement.style.getPropertyValue("--color-bg")).toBe("");
  });

  it("persists only changed settings and hydrates stored values", () => {
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    fireEvent.change(screen.getByLabelText("Scale value"), {
      target: { value: "82" },
    });
    fireEvent.blur(screen.getByLabelText("Scale value"));

    expect(JSON.parse(window.localStorage.getItem(DESIGN_OVERLAY_STORAGE_KEY) ?? "{}")).toEqual({
      typographyScale: 82,
    });
    expect(
      readStoredDesignValues(DEFAULT_DESIGN_OVERLAY_VALUES).typographyScale,
    ).toBe(82);
  });

  it("derives typography tokens from compact typography controls", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    fireEvent.change(screen.getByRole("combobox", { name: "Type style" }), {
      target: { value: "editorial" },
    });

    expect((screen.getByRole("combobox", { name: "Primary font" }) as HTMLSelectElement).value).toBe(
      "georgia",
    );
    expect((screen.getByRole("combobox", { name: "Secondary font" }) as HTMLSelectElement).value).toBe(
      "inter",
    );
    expect(
      document.documentElement.style.getPropertyValue("--font-family-heading"),
    ).toContain("Georgia");
    expect(document.documentElement.style.getPropertyValue("--font-size-display")).toBe(
      "6.7262rem",
    );
  });

  it("remixes typography pairings without source-sync churn", async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, changedCount: 1 }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );

    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    fireEvent.click(screen.getByRole("button", { name: "Remix typography" }));

    expect((screen.getByRole("combobox", { name: "Type style" }) as HTMLSelectElement).value).toBe(
      "geometric",
    );
    expect((screen.getByRole("combobox", { name: "Pairing" }) as HTMLSelectElement).value).toBe(
      "display_plus_text",
    );
    expect((screen.getByRole("combobox", { name: "Primary font" }) as HTMLSelectElement).value).toBe(
      "space_grotesk",
    );
    expect((screen.getByRole("combobox", { name: "Secondary font" }) as HTMLSelectElement).value).toBe(
      "dm_sans",
    );
    expect((screen.getByLabelText("Scale value") as HTMLInputElement).value).toBe(
      "76",
    );
    expect((screen.getByLabelText("Density value") as HTMLInputElement).value).toBe(
      "56",
    );
    expect((screen.getByLabelText("Weight value") as HTMLInputElement).value).toBe(
      "68",
    );
    expect(
      document.documentElement.style.getPropertyValue("--font-size-display"),
    ).not.toBe("");
    expect(
      document.documentElement.style.getPropertyValue("--letter-spacing-heading"),
    ).not.toBe("");

    fireEvent.click(screen.getByRole("button", { name: "Remix typography" }));

    expect((screen.getByRole("combobox", { name: "Type style" }) as HTMLSelectElement).value).toBe(
      "geometric",
    );
    expect((screen.getByRole("combobox", { name: "Pairing" }) as HTMLSelectElement).value).toBe(
      "display_plus_text",
    );
    expect((screen.getByRole("combobox", { name: "Primary font" }) as HTMLSelectElement).value).toBe(
      "inter",
    );
    expect((screen.getByRole("combobox", { name: "Secondary font" }) as HTMLSelectElement).value).toBe(
      "roboto",
    );
    expect(
      document.documentElement.style.getPropertyValue("--font-family-heading"),
    ).toContain("Inter");

    await waitForSourceSyncDebounce();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("samples typography remixes from the random source at click time", () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    const callsBeforeRemix = randomSpy.mock.calls.length;
    randomSpy.mockReturnValue(0.37);
    fireEvent.click(screen.getByRole("button", { name: "Remix typography" }));

    expect(randomSpy.mock.calls.length).toBeGreaterThan(callsBeforeRemix);
  });

  it("remixes layout controls without source-sync churn", async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, changedCount: 1 }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );

    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    fireEvent.click(screen.getByRole("button", { name: "Remix layout" }));

    const pageWidth = getCheckedRadioValue("Page width", {
      Full: "full",
      Narrow: "narrow",
      Standard: "standard",
      Wide: "wide",
    });
    const heroScale = getCheckedRadioValue("Hero presence", {
      Compact: "compact",
      Roomy: "balanced",
      Showcase: "immersive",
    });
    const gridDensity = getCheckedRadioValue("Grid density", {
      Balanced: "balanced",
      Dense: "dense",
      Sparse: "sparse",
    });
    const spacing = Number(
      (screen.getByLabelText("Spacing value") as HTMLInputElement).value,
    );
    const radius = Number(
      (screen.getByLabelText("Corners value") as HTMLInputElement).value,
    );
    const pageGutter = Number(
      (screen.getByLabelText("Page gutter value") as HTMLInputElement).value,
    );
    const heroBalance = Number(
      (screen.getByLabelText("Hero emphasis value") as HTMLInputElement).value,
    );
    const textWidth = Number(
      (screen.getByLabelText("Text width value") as HTMLInputElement).value,
    );

    expect({
      gridDensity,
      heroBalance,
      heroScale,
      pageGutter,
      radius,
      spacing,
      textWidth,
      width: pageWidth,
    }).not.toEqual({
      gridDensity: DEFAULT_DESIGN_OVERLAY_VALUES.gridDensity,
      heroBalance: DEFAULT_DESIGN_OVERLAY_VALUES.heroBalance,
      heroScale: DEFAULT_DESIGN_OVERLAY_VALUES.heroScale,
      pageGutter: DEFAULT_DESIGN_OVERLAY_VALUES.pageGutter,
      radius: DEFAULT_DESIGN_OVERLAY_VALUES.radius,
      spacing: DEFAULT_DESIGN_OVERLAY_VALUES.sectionSpacing,
      textWidth: DEFAULT_DESIGN_OVERLAY_VALUES.textWidth,
      width: DEFAULT_DESIGN_OVERLAY_VALUES.pageWidth,
    });
    expect(
      document.documentElement.style.getPropertyValue("--section-padding-y-md"),
    ).not.toBe("");
    expect(document.documentElement.style.getPropertyValue("--container-lg")).not.toBe(
      "",
    );
    expect(
      document.documentElement.style.getPropertyValue("--hero-grid-text-fr"),
    ).not.toBe("");

    await waitForSourceSyncDebounce();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("randomizes concrete font pairings when type style or pairing selections repeat", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    const typeStyle = screen.getByRole("combobox", {
      name: "Type style",
    }) as HTMLSelectElement;
    const pairing = screen.getByRole("combobox", {
      name: "Pairing",
    }) as HTMLSelectElement;
    const primaryFont = screen.getByRole("combobox", {
      name: "Primary font",
    }) as HTMLSelectElement;
    const secondaryFont = screen.getByRole("combobox", {
      name: "Secondary font",
    }) as HTMLSelectElement;

    fireEvent.change(typeStyle, { target: { value: "editorial" } });
    const firstEditorialPair = `${primaryFont.value}/${secondaryFont.value}`;

    fireEvent.change(typeStyle, { target: { value: "geometric" } });
    fireEvent.change(typeStyle, { target: { value: "editorial" } });
    const secondEditorialPair = `${primaryFont.value}/${secondaryFont.value}`;

    expect(typeStyle.value).toBe("editorial");
    expect(firstEditorialPair).not.toBe(secondEditorialPair);

    fireEvent.change(pairing, { target: { value: "mono_accent" } });
    const firstMonoPair = `${primaryFont.value}/${secondaryFont.value}`;
    fireEvent.change(pairing, { target: { value: "display_plus_text" } });
    fireEvent.change(pairing, { target: { value: "mono_accent" } });
    const secondMonoPair = `${primaryFont.value}/${secondaryFont.value}`;

    expect(pairing.value).toBe("mono_accent");
    expect(firstMonoPair).not.toBe(secondMonoPair);
  });

  it("automatically debounces source sync updates without forcing a reload", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, changedCount: 1 }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );

    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    fireEvent.change(screen.getByLabelText("Spacing value"), {
      target: { value: "110" },
    });
    fireEvent.blur(screen.getByLabelText("Spacing value"));
    fireEvent.change(screen.getByLabelText("Weight value"), {
      target: { value: "85" },
    });
    fireEvent.blur(screen.getByLabelText("Weight value"));

    expect(fetchMock).not.toHaveBeenCalled();

    await waitForSourceSyncDebounce();

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const requestInit = fetchMock.mock.calls[0][1] as RequestInit;
    const payload = JSON.parse(String(requestInit.body)) as {
      brand: Record<string, string>;
      brandDerivation: Record<string, number>;
      layout: Record<string, string | number>;
      reload: boolean;
      typography: Record<string, string | number>;
      values: Record<string, string>;
    };

    expect(screen.queryByRole("button", { name: "Sync YAML" })).toBeNull();
    expect(fetchMock.mock.calls[0][0]).toBe("/__brandy/sync/design");
    expect(requestInit.method).toBe("POST");
    expect(payload.brand).toEqual({
      accent: "#ff6b35",
      highlight: "#fde68a",
      primary: "#635bff",
      secondary: "#00d4ff",
    });
    expect(payload.brandDerivation).toEqual({
      accentMomentDistancePercent: 100,
      backgroundDistancePercent: 100,
      borderDistancePercent: 100,
      buttonPrimaryBgDistancePercent: 100,
      buttonSecondaryBorderDistancePercent: 100,
      buttonSecondaryHoverDistancePercent: 100,
      footerBackgroundDistancePercent: 100,
      footerBorderDistancePercent: 100,
      highlightSoftDistancePercent: 100,
      linkColorDistancePercent: 100,
      linkHoverDistancePercent: 100,
      navbarBackgroundDistancePercent: 100,
      navbarBorderDistancePercent: 100,
      neutralSurfaceDistancePercent: 100,
      primaryHoverDistancePercent: 100,
      readableTextDistancePercent: 100,
      secondaryTextDistancePercent: 100,
      secondarySurfaceDistancePercent: 100,
    });
    expect(payload.reload).toBe(false);
    expect(payload.layout).toEqual({
      gridDensity: "balanced",
      heroBalance: 57,
      heroScale: "immersive",
      pageGutter: 70,
      radius: 2,
      spacing: 110,
      textWidth: 38,
      width: "standard",
    });
    expect(payload.typography).toEqual({
      density: 60,
      headlineStyle: 60,
      pairing: "display_plus_text",
      primaryFont: "inter",
      scale: 70,
      secondaryFont: "roboto",
      style: "geometric",
      tightness: 50,
      weight: 85,
    });
    expect(payload.values["--section-padding-y-md"]).toBeUndefined();
    expect(payload.values["--font-size-body"]).toBeUndefined();
    expect(payload.values["--font-weight-heading"]).toBeUndefined();
    expect(
      JSON.parse(window.localStorage.getItem(DESIGN_OVERLAY_STORAGE_KEY) ?? "{}"),
    ).toMatchObject({
      sectionSpacing: 110,
      typographyWeight: 85,
    });
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
    expect(screen.queryByText("Auto-synced to YAML")).toBeNull();
  });

  it("does not show raw network sync failures in the panel footer", async () => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("Failed to fetch"),
    );

    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));
    fireEvent.change(screen.getByLabelText("Spacing value"), {
      target: { value: "110" },
    });
    fireEvent.blur(screen.getByLabelText("Spacing value"));

    await waitForSourceSyncDebounce();

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByText("Failed to fetch")).toBeNull();
  });

  it("resets design changes and clears persisted diffs", () => {
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    fireEvent.change(screen.getByLabelText("Spacing value"), {
      target: { value: "110" },
    });
    fireEvent.blur(screen.getByLabelText("Spacing value"));
    fireEvent.click(
      document.querySelector(".design-overlay__reset-all") as HTMLButtonElement,
    );

    expect(window.localStorage.getItem(DESIGN_OVERLAY_STORAGE_KEY)).toBeNull();
    expect(
      document.documentElement.style.getPropertyValue("--section-padding-y-md"),
    ).toBe("");
    expect(window.localStorage.getItem(DESIGN_TOKEN_STORAGE_KEY)).toBeNull();
  });
});

describe("design overlay model", () => {
  it("snaps values to the configured range and step", () => {
    expect(snapToStep(143, 20, 960, 1520)).toBe(960);
    expect(snapToStep(1411, 20, 960, 1520)).toBe(1420);
    expect(snapToStep(1900, 20, 960, 1520)).toBe(1520);
  });

  it("maps defaults to known Brandy CSS variables", () => {
    const variables = getDesignCssVariables(DEFAULT_DESIGN_OVERLAY_VALUES);

    expect(variables["--brand-primary-500"]).toBe("#635bff");
    expect(variables["--brand-secondary-500"]).toBe("#00d4ff");
    expect(variables["--brand-accent-500"]).toBe("#ff6b35");
    expect(variables["--brand-highlight-500"]).toBe("#fde68a");
    expect(variables["--color-accent"]).toBe("#5750e0");
    expect(variables["--green-600"]).toBe(variables["--color-accent"]);
    expect(variables["--green-700"]).toBe(variables["--color-accent-hover"]);
    expect(variables["--green-100"]).toBe(variables["--color-accent-soft"]);
    expect(variables["--button-primary-text"]).toBe("#ffffff");
    expect(variables["--chart-4"]).toBe("#fde68a");
    expect(variables["--section-padding-x"]).toBe("clamp(1.25rem, 2.8vw, 2.1rem)");
    expect(variables["--section-padding-y-md"]).toBe("3.5rem");
    expect(variables["--container-lg"]).toBe("1120px");
    expect(variables["--hero-grid-visual-fr"]).toBe("1.14fr");
    expect(variables["--hero-headline-max-width"]).toBe("56rem");
    expect(variables["--hero-description-max-width"]).toBe("52rem");
    expect(variables["--content-readable-max"]).toBe("38rem");
    expect(variables["--font-family-heading"]).toContain("Inter");
    expect(variables["--font-family-body"]).toContain("Roboto");
    expect(variables["--font-size-display"]).toBe("5.875rem");
    expect(variables["--line-height-display"]).toBe("1.02");
    expect(variables["--font-weight-heading"]).toBe("760");
    expect(variables["--letter-spacing-heading"]).toBe("0em");
    expect(variables["--duration-base"]).toBe("260ms");
  });

  it("derives surfaces, readable text, and interaction states from brand seeds", () => {
    const variables = getDesignCssVariables({
      ...DEFAULT_DESIGN_OVERLAY_VALUES,
      accentColor: "#dc2626",
      highlightColor: "#facc15",
      primaryColor: "#4f46e5",
      secondaryColor: "#0891b2",
    });

    expect(variables["--brand-primary-500"]).toBe("#4f46e5");
    expect(variables["--color-accent"]).toBe("#463eca");
    expect(variables["--button-primary-hover"]).toBe("#3a34a9");
    expect(variables["--gradient-hero-accent"]).toBe("#c22121");
    expect(variables["--color-highlight-soft"]).toBe("#fef8de");
    expect(variables["--color-text"]).toBe("#060712");
    expect(variables["--color-bg"]).toBe("#faf9fe");
  });
});
