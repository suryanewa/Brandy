import { describe, expect, it } from "vitest";
import tokensCss from "../src/styles/tokens.css?raw";
import {
  DESIGN_EDITOR_CATALOG,
  DESIGN_SYSTEM_SELECT_DESCRIPTORS,
  DESIGN_TOKEN_CATALOG,
  DESIGN_TOKEN_CONTROLS,
  DESIGN_TOKEN_CSS_VARIABLE_NAMES,
  isDesignTokenCssVariableEntry,
  type DesignSystemSelectName,
  type DesignTokenCatalogEntry,
  type DesignTokenCssVariableEntry,
  type DesignTokenCssVariableName,
  type DesignTokenSelectValue,
} from "../src/components/overlay/designTokenCatalog";

const OVERLAY_ADDED_VARIABLE_NAMES = [
  "--navbar-blur",
  "--brandy-scroll-behavior",
  "--brandy-marquee-duration",
  "--brandy-animation-play-state",
] as const;

const FRAME_SIZING_VARIABLE_NAMES = [
  "--browser-bar-height",
  "--browser-content-min-height",
  "--demo-frame-min-height",
  "--demo-preview-nav-height",
  "--hero-demo-height",
] as const;

const DESIGN_SYSTEM_SELECT_EXPECTATIONS = {
  "badge.tone": ["neutral", "accent", "blue"],
  "button.size": ["sm", "md", "lg"],
  "button.variant": ["primary", "secondary", "ghost"],
  "card.variant": ["default", "raised", "ghost", "accent"],
  "cluster.align": ["start", "center", "end"],
  "cluster.gap": ["sm", "md", "lg"],
  "container.size": ["sm", "md", "lg", "xl", "full"],
  "grid.columns": [2, 3, 4],
  "heading.element": ["h1", "h2", "h3", "h4"],
  "heading.size": ["display", "h1", "h2", "h3", "h4"],
  "section.size": ["sm", "md", "lg", "hero"],
  "section.variant": ["default", "muted", "accent", "inverted"],
  "split.ratio": ["even", "text-heavy", "visual-heavy"],
  "stack.gap": ["xs", "sm", "md", "lg", "xl"],
  "text.align": ["left", "center"],
  "text.size": ["body", "body-lg", "caption", "eyebrow"],
} as const satisfies Record<DesignSystemSelectName, readonly DesignTokenSelectValue[]>;

describe("design token catalog", () => {
  it("represents every variable declared in tokens.css", () => {
    const declaredDefaults = readDeclaredTokenDefaults();
    const catalogNames = new Set(DESIGN_TOKEN_CSS_VARIABLE_NAMES);
    const missingNames = [...declaredDefaults.keys()].filter(
      (name) => !catalogNames.has(name),
    );

    expect(missingNames).toEqual([]);
  });

  it("keeps catalog defaults in sync with tokens.css", () => {
    const declaredDefaults = readDeclaredTokenDefaults();
    const catalogDefaults = new Map(
      DESIGN_TOKEN_CATALOG.map((entry) => [
        entry.name,
        getCatalogCssDefaultValue(entry),
      ]),
    );

    for (const [name, defaultValue] of declaredDefaults) {
      expect(catalogDefaults.get(name)).toBe(defaultValue);
    }
  });

  it("includes overlay variables for runtime hardcoded parameters", () => {
    expect(DESIGN_TOKEN_CSS_VARIABLE_NAMES).toEqual(
      expect.arrayContaining([
        ...OVERLAY_ADDED_VARIABLE_NAMES,
        ...FRAME_SIZING_VARIABLE_NAMES,
      ]),
    );
  });

  it("renders exact CSS variable references as dropdown controls", () => {
    const warningColor = DESIGN_TOKEN_CONTROLS.find(
      (control) => control.variable === "--color-warning",
    );
    const shadow = DESIGN_TOKEN_CONTROLS.find(
      (control) => control.variable === "--shadow-soft",
    );

    expect(warningColor?.type).toBe("variable");
    expect(warningColor).toMatchObject({
      defaultValue: "var(--amber-500)",
      type: "variable",
    });
    if (warningColor?.type === "variable") {
      expect(warningColor.options.map((option) => option.value)).toContain(
        "var(--green-600)",
      );
      expect(warningColor.options.map((option) => option.value)).not.toContain(
        "var(--color-warning)",
      );
    }

    expect(shadow?.type).toBe("text");
  });

  it("includes union-backed design-system select descriptors", () => {
    const descriptorOptions = new Map(
      DESIGN_SYSTEM_SELECT_DESCRIPTORS.map((descriptor) => [
        descriptor.name,
        descriptor.options.map((option) => option.value),
      ]),
    );

    expect([...descriptorOptions.keys()].sort()).toEqual(
      Object.keys(DESIGN_SYSTEM_SELECT_EXPECTATIONS).sort(),
    );

    for (const [name, expectedValues] of Object.entries(
      DESIGN_SYSTEM_SELECT_EXPECTATIONS,
    ) as Array<[DesignSystemSelectName, readonly DesignTokenSelectValue[]]>) {
      expect(descriptorOptions.get(name)).toEqual(expectedValues);
    }
  });

  it("has internally valid controls, defaults, and options", () => {
    assertUniqueValues(
      DESIGN_EDITOR_CATALOG.map((entry) => `${entry.source}:${entry.name}`),
    );
    assertUniqueValues(DESIGN_TOKEN_CSS_VARIABLE_NAMES);

    for (const entry of DESIGN_EDITOR_CATALOG) {
      assertValidCatalogEntry(entry);
    }

    const controlTypes = new Set(
      DESIGN_EDITOR_CATALOG.map((entry) => entry.control),
    );
    expect(controlTypes).toEqual(
      new Set(["boolean", "color", "number", "select", "text"]),
    );
    expect(DESIGN_EDITOR_CATALOG.filter(isDesignTokenCssVariableEntry)).toHaveLength(
      DESIGN_TOKEN_CATALOG.length,
    );
  });
});

function readDeclaredTokenDefaults(): Map<DesignTokenCssVariableName, string> {
  const defaults = new Map<DesignTokenCssVariableName, string>();

  for (const match of tokensCss.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gm)) {
    const [, name, value] = match;
    const variableName = name as DesignTokenCssVariableName;
    if (!defaults.has(variableName)) {
      defaults.set(variableName, normalizeCssValue(value));
    }
  }

  return defaults;
}

function getCatalogCssDefaultValue(entry: DesignTokenCssVariableEntry): string {
  switch (entry.control) {
    case "color":
    case "select":
    case "text":
      return normalizeCssValue(String(entry.defaultValue));
    case "number":
      return `${entry.defaultValue}${entry.unit ?? ""}`;
  }
}

function normalizeCssValue(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function assertValidCatalogEntry(entry: DesignTokenCatalogEntry) {
  expect(entry.name.length).toBeGreaterThan(0);
  expect(entry.label.length).toBeGreaterThan(0);
  expect(entry.group.length).toBeGreaterThan(0);

  if (entry.source === "css-variable") {
    expect(entry.name.startsWith("--")).toBe(true);
  }

  switch (entry.control) {
    case "boolean":
      expect(typeof entry.defaultValue).toBe("boolean");
      break;
    case "color":
      expect(isCatalogColorValue(entry.defaultValue)).toBe(true);
      break;
    case "number":
      expect(Number.isFinite(entry.defaultValue)).toBe(true);
      expect(Number.isFinite(entry.min)).toBe(true);
      expect(Number.isFinite(entry.max)).toBe(true);
      expect(Number.isFinite(entry.step)).toBe(true);
      expect(entry.min).toBeLessThanOrEqual(entry.defaultValue);
      expect(entry.defaultValue).toBeLessThanOrEqual(entry.max);
      expect(entry.step).toBeGreaterThan(0);
      break;
    case "select": {
      expect(entry.options.length).toBeGreaterThan(0);
      const optionValues = entry.options.map((option) => option.value);
      assertUniqueValues(optionValues);
      expect(optionValues).toContain(entry.defaultValue);
      break;
    }
    case "text":
      expect(entry.defaultValue.trim().length).toBeGreaterThan(0);
      break;
  }
}

function assertUniqueValues(values: readonly DesignTokenSelectValue[]) {
  expect(new Set(values).size).toBe(values.length);
}

function isCatalogColorValue(value: string): boolean {
  return (
    /^#[0-9a-f]{6}$/i.test(value) ||
    /^rgba\(\d{1,3}, \d{1,3}, \d{1,3}, (?:0|1|0?\.\d+)\)$/.test(value)
  );
}
