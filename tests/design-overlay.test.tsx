import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  window.localStorage.clear();
  document.documentElement.removeAttribute("style");
});

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

  it("supports the settings keyboard shortcut and Escape close", () => {
    render(<DesignOverlay />);

    fireEvent.keyDown(window, { key: ",", metaKey: true });
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
    expect(screen.getByRole("radiogroup", { name: "Hero" })).toBeTruthy();
    expect(screen.getByRole("radiogroup", { name: "Grid density" })).toBeTruthy();
    expect(screen.getByLabelText("Spacing value")).toBeTruthy();
    expect(screen.getByLabelText("Corners value")).toBeTruthy();
    expect(screen.getByLabelText("Page gutter value")).toBeTruthy();
    expect(screen.getByLabelText("Hero balance value")).toBeTruthy();
    expect(screen.getByLabelText("Text width value")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Motion" })).toBeNull();

    fireEvent.click(screen.getByRole("radio", { name: "Wide" }));
    expect(document.documentElement.style.getPropertyValue("--container-lg")).toBe(
      "1328px",
    );
    fireEvent.change(screen.getByLabelText("Hero balance value"), {
      target: { value: "40" },
    });
    fireEvent.blur(screen.getByLabelText("Hero balance value"));
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

    expect(screen.getByRole("combobox", { name: "Type style" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Pairing" })).toBeTruthy();
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

    expect(screen.getByLabelText("Primary hex color")).toBeTruthy();
    expect(screen.getByLabelText("Secondary hex color")).toBeTruthy();
    expect(screen.getByLabelText("Accent hex color")).toBeTruthy();
    expect(screen.getByLabelText("Highlight hex color")).toBeTruthy();
    expect(screen.getByRole("switch", { name: "Dark mode" })).toBeTruthy();
    expect(screen.queryByLabelText("Primary presets")).toBeNull();
    expect(screen.queryByLabelText("Secondary presets")).toBeNull();
    expect(screen.queryByLabelText("Accent presets")).toBeNull();
    expect(screen.queryByLabelText("Highlight presets")).toBeNull();
    expect(screen.getByText("Primary hover")).toBeTruthy();
    expect(screen.getByText("Secondary surface")).toBeTruthy();
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
    ).toBe("#958fff");
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

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });
    vi.useRealTimers();

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
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    fireEvent.change(screen.getByRole("combobox", { name: "Type style" }), {
      target: { value: "editorial" },
    });
    fireEvent.change(screen.getByLabelText("Tightness value"), {
      target: { value: "80" },
    });
    fireEvent.blur(screen.getByLabelText("Tightness value"));

    expect(
      document.documentElement.style.getPropertyValue("--font-family-heading"),
    ).toContain("Georgia");
    expect(
      document.documentElement.style.getPropertyValue("--letter-spacing-heading"),
    ).toBe("-0.042em");
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

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });
    vi.useRealTimers();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const requestInit = fetchMock.mock.calls[0][1] as RequestInit;
    const payload = JSON.parse(String(requestInit.body)) as {
      brand: Record<string, string>;
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
      scale: 70,
      style: "geometric",
      tightness: 50,
      weight: 85,
    });
    expect(payload.values["--section-padding-y-md"]).toBeUndefined();
    expect(payload.values["--font-size-body"]).toBeUndefined();
    expect(payload.values["--font-weight-heading"]).toBeUndefined();
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

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });
    vi.useRealTimers();

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
    expect(variables["--section-padding-y-md"]).toBe("3.5rem");
    expect(variables["--container-lg"]).toBe("1120px");
    expect(variables["--hero-grid-visual-fr"]).toBe("1.14fr");
    expect(variables["--hero-headline-max-width"]).toBe("9ch");
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
