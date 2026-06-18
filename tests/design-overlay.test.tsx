import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
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

    fireEvent.change(screen.getByLabelText("Accent hex color"), {
      target: { value: "#2563eb" },
    });
    fireEvent.blur(screen.getByLabelText("Accent hex color"));

    expect(
      document.documentElement.style.getPropertyValue("--color-accent"),
    ).toBe("#2563eb");
    expect(
      document.documentElement.style.getPropertyValue("--green-700"),
    ).not.toBe("");
    expect(
      screen.getByRole("button", { name: "Reset design" }).hasAttribute("disabled"),
    ).toBe(false);
  });

  it("searches visible token sections without group filter chips", () => {
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    expect(document.querySelector('[aria-label="Body font size value"]')).toBeTruthy();
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
    expect(screen.getByLabelText("Reset Layout tokens")).toBeTruthy();
    expect(screen.getByLabelText("Reset Typography tokens")).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText("Search tokens"), {
      target: { value: "Space 4" },
    });

    expect(screen.queryByText("No tokens match the filters.")).toBeNull();

    fireEvent.change(screen.getByPlaceholderText("Search tokens"), {
      target: { value: "" },
    });

    expect(document.querySelector('[aria-label="Body font size value"]')).toBeTruthy();
  });

  it("keeps quick palette controls minimal when color variants are automatic", () => {
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    expect(screen.getByText("Accent soft")).toBeTruthy();
    expect(screen.queryByLabelText("Surface hex color")).toBeNull();
    expect(screen.queryByLabelText("Raised hex color")).toBeNull();
    expect(screen.queryByLabelText("Base palette")).toBeNull();
    expect(screen.queryByLabelText("Semantic colors")).toBeNull();
    const paletteTokens = screen.getByLabelText("Palette token values");

    expect(within(paletteTokens).getByLabelText("White")).toBeTruthy();
    expect(within(paletteTokens).getByLabelText("Green 600")).toBeTruthy();
    expect(within(paletteTokens).getByLabelText("Page background")).toBeTruthy();

    fireEvent.change(within(paletteTokens).getByLabelText("White"), {
      target: { value: "#ffffff" },
    });
    fireEvent.change(within(paletteTokens).getByLabelText("Page background"), {
      target: { value: "var(--white)" },
    });

    expect(document.documentElement.style.getPropertyValue("--white")).toBe(
      "#ffffff",
    );
    expect(document.documentElement.style.getPropertyValue("--color-bg")).toBe(
      "var(--white)",
    );

    fireEvent.click(screen.getByLabelText("Reset Palette tokens"));

    expect(document.documentElement.style.getPropertyValue("--white")).toBe("");
    expect(document.documentElement.style.getPropertyValue("--color-bg")).toBe("");

    fireEvent.click(screen.getByRole("switch", { name: "Auto variants" }));

    expect(screen.getByLabelText("Surface hex color")).toBeTruthy();
    expect(screen.getByLabelText("Raised hex color")).toBeTruthy();
  });

  it("persists only changed settings and hydrates stored values", () => {
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    fireEvent.change(screen.getByLabelText("Type scale value"), {
      target: { value: "111" },
    });
    fireEvent.blur(screen.getByLabelText("Type scale value"));

    expect(JSON.parse(window.localStorage.getItem(DESIGN_OVERLAY_STORAGE_KEY) ?? "{}")).toEqual({
      typeScale: 111,
    });
    expect(
      readStoredDesignValues(DEFAULT_DESIGN_OVERLAY_VALUES).typeScale,
    ).toBe(111);
  });

  it("edits individual design tokens directly", () => {
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    fireEvent.change(screen.getByLabelText("Body font size value"), {
      target: { value: "1.25rem" },
    });
    fireEvent.blur(screen.getByLabelText("Body font size value"));

    expect(
      document.documentElement.style.getPropertyValue("--font-size-body"),
    ).toBe("1.25rem");
    expect(JSON.parse(window.localStorage.getItem(DESIGN_TOKEN_STORAGE_KEY) ?? "{}")).toEqual({
      "--font-size-body": "1.25rem",
    });
  });

  it("edits CSS variable references from token dropdowns", () => {
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    const paletteTokens = screen.getByLabelText("Palette token values");
    const warningColor = within(paletteTokens).getByLabelText("Warning");

    expect(within(warningColor).getByRole("option", {
      name: "Mist 100 (--mist-100)",
    })).toBeTruthy();

    fireEvent.change(warningColor, {
      target: { value: "var(--mist-100)" },
    });

    expect(document.documentElement.style.getPropertyValue("--color-warning")).toBe(
      "var(--mist-100)",
    );
    expect(JSON.parse(window.localStorage.getItem(DESIGN_TOKEN_STORAGE_KEY) ?? "{}")).toEqual({
      "--color-warning": "var(--mist-100)",
    });
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

    fireEvent.change(screen.getByLabelText("Section spacing value"), {
      target: { value: "110" },
    });
    fireEvent.blur(screen.getByLabelText("Section spacing value"));
    fireEvent.change(screen.getByLabelText("Body font size value"), {
      target: { value: "1.2rem" },
    });
    fireEvent.change(screen.getByLabelText("Body font size value"), {
      target: { value: "1.25rem" },
    });
    fireEvent.blur(screen.getByLabelText("Body font size value"));

    expect(fetchMock).not.toHaveBeenCalled();

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });
    vi.useRealTimers();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const requestInit = fetchMock.mock.calls[0][1] as RequestInit;
    const payload = JSON.parse(String(requestInit.body)) as {
      reload: boolean;
      values: Record<string, string>;
    };

    expect(screen.queryByRole("button", { name: "Sync YAML" })).toBeNull();
    expect(fetchMock.mock.calls[0][0]).toBe("/__brandy/sync/design");
    expect(requestInit.method).toBe("POST");
    expect(payload.reload).toBe(false);
    expect(payload.values["--section-padding-y-md"]).toBe("5.5rem");
    expect(payload.values["--font-size-body"]).toBe("1.25rem");
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
    expect(screen.queryByText("Auto-synced to YAML")).toBeNull();
  });

  it("resets design changes and clears persisted diffs", () => {
    render(<DesignOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Open design settings" }));

    fireEvent.change(screen.getByLabelText("Section spacing value"), {
      target: { value: "110" },
    });
    fireEvent.blur(screen.getByLabelText("Section spacing value"));
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

    expect(variables["--color-accent"]).toBe("#0f9f6e");
    expect(variables["--green-600"]).toBe(variables["--color-accent"]);
    expect(variables["--green-700"]).toBe(variables["--color-accent-hover"]);
    expect(variables["--green-100"]).toBe(variables["--color-accent-soft"]);
    expect(variables["--container-lg"]).toBe("1180px");
    expect(variables["--duration-base"]).toBe("260ms");
  });

  it("derives readable colors and lighter variants from fewer base colors", () => {
    const variables = getDesignCssVariables({
      ...DEFAULT_DESIGN_OVERLAY_VALUES,
      accentColor: "#dc2626",
      backgroundColor: "#111416",
      brandColor: "#4f46e5",
    });

    expect(variables["--color-accent"]).toBe("#dc2626");
    expect(variables["--color-accent-hover"]).not.toBe("#dc2626");
    expect(variables["--color-accent-soft"]).not.toBe("#dc2626");
    expect(variables["--color-blue-soft"]).not.toBe("#4f46e5");
    expect(variables["--color-text"]).not.toBe("#111416");
  });
});
