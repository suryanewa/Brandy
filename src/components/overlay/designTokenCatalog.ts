import type {
  BadgeTone,
  ButtonSize,
  ButtonVariant,
  CardVariant,
  ClusterAlign,
  ClusterGap,
  ContainerSize,
  GridColumns,
  HeadingElement,
  HeadingSize,
  SectionSize,
  SectionVariant,
  SplitRatio,
  StackGap,
  TextAlign,
  TextSize,
} from "../../types/design-system";

export type DesignTokenControlType = "boolean" | "color" | "number" | "select" | "text";

export type DesignTokenCatalogGroup =
  | "component-size"
  | "design-system"
  | "elevation"
  | "layout"
  | "layering"
  | "motion"
  | "overlay"
  | "palette"
  | "radii"
  | "semantic-color"
  | "spacing"
  | "stroke"
  | "typography";

export type DesignTokenCatalogSource = "css-variable" | "design-system" | "overlay-setting";

export type DesignTokenCssVariableName = `--${string}`;
export type DesignTokenNumberUnit = "%" | "ch" | "em" | "fr" | "ms" | "px" | "rem" | "s" | "svh";
export type DesignTokenSelectValue = number | string;

export interface DesignTokenSelectOption<
  Value extends DesignTokenSelectValue = DesignTokenSelectValue,
> {
  label: string;
  value: Value;
}

interface DesignTokenCatalogBase<
  Source extends DesignTokenCatalogSource,
  Name extends string,
  Control extends DesignTokenControlType,
  DefaultValue,
> {
  control: Control;
  defaultValue: DefaultValue;
  description?: string;
  group: DesignTokenCatalogGroup;
  label: string;
  name: Name;
  source: Source;
}

export type DesignTokenColorEntry = DesignTokenCatalogBase<
  "css-variable",
  DesignTokenCssVariableName,
  "color",
  string
>;

export type DesignTokenNumberEntry = DesignTokenCatalogBase<
  "css-variable",
  DesignTokenCssVariableName,
  "number",
  number
> & {
  max: number;
  min: number;
  step: number;
  unit?: DesignTokenNumberUnit;
};

export type DesignTokenTextEntry = DesignTokenCatalogBase<
  "css-variable",
  DesignTokenCssVariableName,
  "text",
  string
>;

export type DesignTokenSelectEntry<
  Value extends DesignTokenSelectValue = DesignTokenSelectValue,
> = DesignTokenCatalogBase<
  "css-variable",
  DesignTokenCssVariableName,
  "select",
  Value
> & {
  options: readonly DesignTokenSelectOption<Value>[];
};

export type DesignTokenCssVariableEntry =
  | DesignTokenColorEntry
  | DesignTokenNumberEntry
  | DesignTokenSelectEntry
  | DesignTokenTextEntry;

export type DesignSystemSelectName =
  | "badge.tone" | "button.size" | "button.variant" | "card.variant"
  | "cluster.align" | "cluster.gap" | "container.size" | "grid.columns"
  | "heading.element" | "heading.size" | "section.size" | "section.variant"
  | "split.ratio" | "stack.gap" | "text.align" | "text.size";

export type DesignSystemSelectDescriptor<
  Name extends DesignSystemSelectName = DesignSystemSelectName,
  Value extends DesignTokenSelectValue = DesignTokenSelectValue,
> = DesignTokenCatalogBase<"design-system", Name, "select", Value> & {
  options: readonly DesignTokenSelectOption<Value>[];
};

export type DesignOverlaySettingName =
  | "highContrast"
  | "mutedMode"
  | "reducedMotion";

export type DesignOverlaySettingDescriptor =
  DesignTokenCatalogBase<
    "overlay-setting",
    DesignOverlaySettingName,
    "boolean",
    boolean
  >;

export type DesignTokenCatalogEntry =
  | DesignOverlaySettingDescriptor
  | DesignSystemSelectDescriptor
  | DesignTokenCssVariableEntry;

export type DesignTokenGroupKey =
  | "alignment"
  | "base"
  | "components"
  | "effects"
  | "layout"
  | "motion"
  | "semantic"
  | "spacing"
  | "typography"
  | "zIndex";

export type DesignTokenVariableName = DesignTokenCssVariableName;
export type DesignTokenValueMap = Partial<Record<DesignTokenVariableName, string>>;

type DesignTokenControlBase<
  Type extends "color" | "number" | "select" | "text" | "variable",
> = {
  defaultValue: string;
  group: DesignTokenGroupKey;
  label: string;
  type: Type;
  variable: DesignTokenVariableName;
};

export type DesignTokenColorControl = DesignTokenControlBase<"color">;
export type DesignTokenTextControl = DesignTokenControlBase<"text">;
export type DesignTokenVariableReferenceValue =
  `var(${DesignTokenCssVariableName})`;
export type DesignTokenVariableReferenceOption = {
  group: DesignTokenGroupKey;
  label: string;
  value: DesignTokenVariableReferenceValue;
  variable: DesignTokenVariableName;
};
export type DesignTokenVariableControl = DesignTokenControlBase<"variable"> & {
  options: readonly DesignTokenVariableReferenceOption[];
};
export type DesignTokenNumberControl = DesignTokenControlBase<"number"> & {
  max: number;
  min: number;
  step: number;
  unit?: DesignTokenNumberUnit;
};
export type DesignTokenSelectControl = DesignTokenControlBase<"select"> & {
  options: readonly DesignTokenSelectOption<string>[];
};
export type DesignTokenControl =
  | DesignTokenColorControl
  | DesignTokenNumberControl
  | DesignTokenSelectControl
  | DesignTokenTextControl
  | DesignTokenVariableControl;

type NumberRange = {
  max: number;
  min: number;
  step: number;
  unit?: DesignTokenNumberUnit;
};

const remSpaceRange = { min: 0, max: 12, step: 0.25, unit: "rem" } as const;
const containerRange = { min: 320, max: 1920, step: 10, unit: "px" } as const;
const framePxRange = { min: 240, max: 760, step: 8, unit: "px" } as const;
const radiusRange = { min: 0, max: 999, step: 1, unit: "px" } as const;
const strokeRange = { min: 0, max: 8, step: 1, unit: "px" } as const;
const durationRange = { min: 0, max: 2000, step: 10, unit: "ms" } as const;
const zIndexRange = { min: 0, max: 1000, step: 1 } as const;
const fontRemRange = { min: 0.5, max: 8, step: 0.01, unit: "rem" } as const;
const componentRemRange = { min: 0, max: 40, step: 0.125, unit: "rem" } as const;
const fractionRange = { min: 0, max: 3, step: 0.01, unit: "fr" } as const;
const fontWeightRange = { min: 100, max: 900, step: 10 } as const;
const lineHeightRange = { min: 0.8, max: 2, step: 0.01 } as const;

function cssColor(
  name: DesignTokenCssVariableName,
  label: string,
  group: DesignTokenCatalogGroup,
  defaultValue: string,
): DesignTokenColorEntry {
  return { source: "css-variable", name, label, group, control: "color", defaultValue };
}

function cssNumber(
  name: DesignTokenCssVariableName,
  label: string,
  group: DesignTokenCatalogGroup,
  defaultValue: number,
  range: NumberRange,
  description?: string,
): DesignTokenNumberEntry {
  return {
    source: "css-variable",
    name,
    label,
    group,
    control: "number",
    defaultValue,
    ...range,
    description,
  };
}

function cssText(
  name: DesignTokenCssVariableName,
  label: string,
  group: DesignTokenCatalogGroup,
  defaultValue: string,
): DesignTokenTextEntry {
  return { source: "css-variable", name, label, group, control: "text", defaultValue };
}

function cssSelect<Value extends DesignTokenSelectValue>(
  name: DesignTokenCssVariableName,
  label: string,
  group: DesignTokenCatalogGroup,
  defaultValue: Value,
  options: readonly DesignTokenSelectOption<Value>[],
  description?: string,
): DesignTokenSelectEntry<Value> {
  return {
    source: "css-variable",
    name,
    label,
    group,
    control: "select",
    defaultValue,
    options,
    description,
  };
}

const defineSelectOptions = <Value extends DesignTokenSelectValue>(
  options: readonly DesignTokenSelectOption<Value>[],
) => options;

function designSystemSelect<
  Name extends DesignSystemSelectName,
  Value extends DesignTokenSelectValue,
>(
  name: Name,
  label: string,
  defaultValue: Value,
  options: readonly DesignTokenSelectOption<Value>[],
): DesignSystemSelectDescriptor<Name, Value> {
  return {
    source: "design-system",
    name,
    label,
    group: "design-system",
    control: "select",
    defaultValue,
    options,
  };
}

const SECTION_VARIANT_OPTIONS = defineSelectOptions<SectionVariant>([
  { value: "default", label: "Default" },
  { value: "muted", label: "Muted" },
  { value: "accent", label: "Accent" },
  { value: "inverted", label: "Inverted" },
]);

const SECTION_SIZE_OPTIONS = defineSelectOptions<SectionSize>([
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "hero", label: "Hero" },
]);

const CONTAINER_SIZE_OPTIONS = defineSelectOptions<ContainerSize>([
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra large" },
  { value: "full", label: "Full" },
]);

const STACK_GAP_OPTIONS = defineSelectOptions<StackGap>([
  { value: "xs", label: "Extra small" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra large" },
]);

const GRID_COLUMN_OPTIONS = defineSelectOptions<GridColumns>([
  { value: 2, label: "2 columns" },
  { value: 3, label: "3 columns" },
  { value: 4, label: "4 columns" },
]);

const SPLIT_RATIO_OPTIONS = defineSelectOptions<SplitRatio>([
  { value: "even", label: "Even" },
  { value: "text-heavy", label: "Text heavy" },
  { value: "visual-heavy", label: "Visual heavy" },
]);

const CLUSTER_GAP_OPTIONS = defineSelectOptions<ClusterGap>([
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
]);

const CLUSTER_ALIGN_OPTIONS = defineSelectOptions<ClusterAlign>([
  { value: "start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "end", label: "End" },
]);

const CARD_VARIANT_OPTIONS = defineSelectOptions<CardVariant>([
  { value: "default", label: "Default" },
  { value: "raised", label: "Raised" },
  { value: "ghost", label: "Ghost" },
  { value: "accent", label: "Accent" },
]);

const BUTTON_VARIANT_OPTIONS = defineSelectOptions<ButtonVariant>([
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "ghost", label: "Ghost" },
]);

const BUTTON_SIZE_OPTIONS = defineSelectOptions<ButtonSize>([
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
]);

const BADGE_TONE_OPTIONS = defineSelectOptions<BadgeTone>([
  { value: "neutral", label: "Neutral" },
  { value: "accent", label: "Accent" },
  { value: "blue", label: "Blue" },
]);

const HEADING_ELEMENT_OPTIONS = defineSelectOptions<HeadingElement>([
  { value: "h1", label: "H1" },
  { value: "h2", label: "H2" },
  { value: "h3", label: "H3" },
  { value: "h4", label: "H4" },
]);

const HEADING_SIZE_OPTIONS = defineSelectOptions<HeadingSize>([
  { value: "display", label: "Display" },
  { value: "h1", label: "H1" },
  { value: "h2", label: "H2" },
  { value: "h3", label: "H3" },
  { value: "h4", label: "H4" },
]);

const TEXT_SIZE_OPTIONS = defineSelectOptions<TextSize>([
  { value: "body", label: "Body" },
  { value: "body-lg", label: "Large body" },
  { value: "caption", label: "Caption" },
  { value: "eyebrow", label: "Eyebrow" },
]);

const TEXT_ALIGN_OPTIONS = defineSelectOptions<TextAlign>([
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
]);

export const DESIGN_TOKEN_CATALOG = [
  cssColor("--brand-primary-50", "Primary 50", "palette", "#fbf1f3"),
  cssColor("--brand-primary-100", "Primary 100", "palette", "#f6dee4"),
  cssColor("--brand-primary-200", "Primary 200", "palette", "#eec1cc"),
  cssColor("--brand-primary-300", "Primary 300", "palette", "#e49bad"),
  cssColor("--brand-primary-400", "Primary 400", "palette", "#d35e7a"),
  cssColor("--brand-primary-500", "Primary 500", "palette", "#be123c"),
  cssColor("--brand-primary-600", "Primary 600", "palette", "#a71035"),
  cssColor("--brand-primary-700", "Primary 700", "palette", "#8d0d2c"),
  cssColor("--brand-primary-800", "Primary 800", "palette", "#6e0a23"),
  cssColor("--brand-primary-900", "Primary 900", "palette", "#480717"),
  cssColor("--brand-primary-950", "Primary 950", "palette", "#2a040d"),
  cssColor("--brand-secondary-50", "Secondary 50", "palette", "#f6f7f8"),
  cssColor("--brand-secondary-100", "Secondary 100", "palette", "#e9ecef"),
  cssColor("--brand-secondary-200", "Secondary 200", "palette", "#d7dbe1"),
  cssColor("--brand-secondary-300", "Secondary 300", "palette", "#bec5ce"),
  cssColor("--brand-secondary-400", "Secondary 400", "palette", "#96a0b0"),
  cssColor("--brand-secondary-500", "Secondary 500", "palette", "#64748b"),
  cssColor("--brand-secondary-600", "Secondary 600", "palette", "#58667a"),
  cssColor("--brand-secondary-700", "Secondary 700", "palette", "#4a5667"),
  cssColor("--brand-secondary-800", "Secondary 800", "palette", "#3a4351"),
  cssColor("--brand-secondary-900", "Secondary 900", "palette", "#262c35"),
  cssColor("--brand-secondary-950", "Secondary 950", "palette", "#161a1f"),
  cssColor("--brand-accent-50", "Accent 50", "palette", "#fff6f3"),
  cssColor("--brand-accent-100", "Accent 100", "palette", "#ffeae3"),
  cssColor("--brand-accent-200", "Accent 200", "palette", "#ffd9ca"),
  cssColor("--brand-accent-300", "Accent 300", "palette", "#ffc1aa"),
  cssColor("--brand-accent-400", "Accent 400", "palette", "#ff9a76"),
  cssColor("--brand-accent-500", "Accent 500", "palette", "#ff6b35"),
  cssColor("--brand-accent-600", "Accent 600", "palette", "#e05e2f"),
  cssColor("--brand-accent-700", "Accent 700", "palette", "#bd4f27"),
  cssColor("--brand-accent-800", "Accent 800", "palette", "#943e1f"),
  cssColor("--brand-accent-900", "Accent 900", "palette", "#612914"),
  cssColor("--brand-accent-950", "Accent 950", "palette", "#38180c"),
  cssColor("--brand-highlight-50", "Highlight 50", "palette", "#fffef8"),
  cssColor("--brand-highlight-100", "Highlight 100", "palette", "#fffcef"),
  cssColor("--brand-highlight-200", "Highlight 200", "palette", "#fef9e1"),
  cssColor("--brand-highlight-300", "Highlight 300", "palette", "#fef5ce"),
  cssColor("--brand-highlight-400", "Highlight 400", "palette", "#feeeaf"),
  cssColor("--brand-highlight-500", "Highlight 500", "palette", "#fde68a"),
  cssColor("--brand-highlight-600", "Highlight 600", "palette", "#dfca79"),
  cssColor("--brand-highlight-700", "Highlight 700", "palette", "#bbaa66"),
  cssColor("--brand-highlight-800", "Highlight 800", "palette", "#938550"),
  cssColor("--brand-highlight-900", "Highlight 900", "palette", "#605734"),
  cssColor("--brand-highlight-950", "Highlight 950", "palette", "#38331e"),
  cssColor("--neutral-50", "Neutral 50", "palette", "#fdf8f9"),
  cssColor("--neutral-100", "Neutral 100", "palette", "#faecef"),
  cssColor("--neutral-200", "Neutral 200", "palette", "#f5d9e0"),
  cssColor("--neutral-300", "Neutral 300", "palette", "#edbdc8"),
  cssColor("--neutral-400", "Neutral 400", "palette", "#e297a9"),
  cssColor("--neutral-500", "Neutral 500", "palette", "#5a344e"),
  cssColor("--neutral-600", "Neutral 600", "palette", "#422438"),
  cssColor("--neutral-700", "Neutral 700", "palette", "#30172b"),
  cssColor("--neutral-800", "Neutral 800", "palette", "#24162c"),
  cssColor("--neutral-900", "Neutral 900", "palette", "#1a0c16"),
  cssColor("--neutral-950", "Neutral 950", "palette", "#0d050a"),
  cssColor("--white", "White", "palette", "#ffffff"),
  cssColor("--ink-950", "Ink 950", "palette", "#0c0509"),
  cssColor("--ink-800", "Ink 800", "palette", "#24162c"),
  cssColor("--ink-600", "Ink 600", "palette", "#422438"),
  cssColor("--ink-500", "Ink 500", "palette", "#5a344e"),
  cssColor("--mist-100", "Mist 100", "palette", "#fcf6f7"),
  cssColor("--mist-200", "Mist 200", "palette", "#faecef"),
  cssColor("--mist-300", "Mist 300", "palette", "#f5d9e0"),
  cssColor("--green-600", "Green 600", "palette", "#a71035"),
  cssColor("--green-700", "Green 700", "palette", "#8d0d2c"),
  cssColor("--green-100", "Green 100", "palette", "#f6dee4"),
  cssColor("--blue-600", "Blue 600", "palette", "#58667a"),
  cssColor("--blue-100", "Blue 100", "palette", "#e9ecef"),
  cssColor("--amber-500", "Amber 500", "palette", "#dc760a"),
  cssText("--color-bg", "Page background", "semantic-color", "#fdf8f9"),
  cssText("--color-surface", "Surface", "semantic-color", "#fcf6f7"),
  cssText("--color-surface-raised", "Raised surface", "semantic-color", "#ffffff"),
  cssText("--color-surface-strong", "Strong surface", "semantic-color", "#faecef"),
  cssText("--color-text", "Text", "semantic-color", "#0c0509"),
  cssText("--color-muted", "Muted text", "semantic-color", "#422438"),
  cssText("--color-border", "Border", "semantic-color", "#f5d9e0"),
  cssText("--color-accent", "Accent", "semantic-color", "#a71035"),
  cssText("--color-accent-hover", "Accent hover", "semantic-color", "#8d0d2c"),
  cssText("--color-accent-soft", "Soft accent", "semantic-color", "#f6dee4"),
  cssText("--color-accent-border", "Accent border", "semantic-color", "rgba(190, 18, 60, 0.32)"),
  cssText("--color-blue", "Blue", "semantic-color", "#58667a"),
  cssText("--color-blue-soft", "Soft blue", "semantic-color", "#e9ecef"),
  cssText("--color-on-accent", "On accent", "semantic-color", "#ffffff"),
  cssText("--color-highlight", "Highlight", "semantic-color", "#feeeaf"),
  cssText("--color-highlight-soft", "Soft highlight", "semantic-color", "#fffcef"),
  cssText("--color-on-highlight", "On highlight", "semantic-color", "#111416"),
  cssText("--color-warning", "Warning", "semantic-color", "var(--amber-500)"),
  cssText("--color-success", "Success", "semantic-color", "#239749"),
  cssText("--color-error", "Error", "semantic-color", "#df2c27"),
  cssText("--color-info", "Info", "semantic-color", "#315ddd"),
  cssText("--button-primary-bg", "Primary button background", "semantic-color", "#a71035"),
  cssText("--button-primary-hover", "Primary button hover", "semantic-color", "#8d0d2c"),
  cssText("--button-primary-text", "Primary button text", "semantic-color", "#ffffff"),
  cssText("--button-secondary-bg", "Secondary button background", "semantic-color", "#f6f7f8"),
  cssText("--button-secondary-hover", "Secondary button hover", "semantic-color", "#e9ecef"),
  cssText("--button-secondary-text", "Secondary button text", "semantic-color", "#3a4351"),
  cssText("--button-secondary-border", "Secondary button border", "semantic-color", "#d7dbe1"),
  cssText("--link-color", "Link", "semantic-color", "#8d0d2c"),
  cssText("--link-hover", "Link hover", "semantic-color", "#6e0a23"),
  cssText("--focus-ring", "Focus ring", "semantic-color", "#d35e7a"),
  cssText("--gradient-hero-start", "Hero gradient start", "semantic-color", "#a71035"),
  cssText("--gradient-hero-end", "Hero gradient end", "semantic-color", "#64748b"),
  cssText("--gradient-hero-accent", "Hero gradient accent", "semantic-color", "#e05e2f"),
  cssColor("--chart-1", "Chart 1", "palette", "#a71035"),
  cssColor("--chart-2", "Chart 2", "palette", "#58667a"),
  cssColor("--chart-3", "Chart 3", "palette", "#e05e2f"),
  cssColor("--chart-4", "Chart 4", "palette", "#fde68a"),
  cssText("--badge-brand-bg", "Brand badge background", "semantic-color", "#f6dee4"),
  cssText("--badge-brand-text", "Brand badge text", "semantic-color", "#8d0d2c"),
  cssText("--badge-brand-border", "Brand badge border", "semantic-color", "#eec1cc"),
  cssText("--badge-highlight-bg", "Highlight badge background", "semantic-color", "#fffcef"),
  cssText("--badge-highlight-text", "Highlight badge text", "semantic-color", "#938550"),
  cssText("--badge-highlight-border", "Highlight badge border", "semantic-color", "#fef9e1"),
  cssText("--dark-color-bg", "Dark page background", "semantic-color", "#0d050a"),
  cssText("--dark-color-surface", "Dark surface", "semantic-color", "#1b050d"),
  cssText("--dark-color-text", "Dark text", "semantic-color", "#fdf8f9"),
  cssText("--dark-color-border", "Dark border", "semantic-color", "rgba(228, 155, 173, 0.22)"),
  cssText("--color-nav-bg", "Navigation background", "semantic-color", "rgba(255, 255, 255, 0.9)"),
  cssText("--color-footer-muted", "Footer muted text", "semantic-color", "rgba(253, 248, 249, 0.76)"),
  cssNumber("--space-0", "Space 0", "spacing", 0, { min: 0, max: 0, step: 1 }),
  cssNumber("--space-1", "Space 1", "spacing", 0.25, remSpaceRange),
  cssNumber("--space-2", "Space 2", "spacing", 0.5, remSpaceRange),
  cssNumber("--space-3", "Space 3", "spacing", 0.75, remSpaceRange),
  cssNumber("--space-4", "Space 4", "spacing", 1, remSpaceRange),
  cssNumber("--space-5", "Space 5", "spacing", 1.25, remSpaceRange),
  cssNumber("--space-6", "Space 6", "spacing", 1.5, remSpaceRange),
  cssNumber("--space-8", "Space 8", "spacing", 2, remSpaceRange),
  cssNumber("--space-10", "Space 10", "spacing", 2.5, remSpaceRange),
  cssNumber("--space-12", "Space 12", "spacing", 3, remSpaceRange),
  cssNumber("--space-14", "Space 14", "spacing", 3.5, remSpaceRange),
  cssNumber("--space-16", "Space 16", "spacing", 4, remSpaceRange),
  cssNumber("--space-20", "Space 20", "spacing", 5, remSpaceRange),
  cssNumber("--space-24", "Space 24", "spacing", 6, remSpaceRange),
  cssNumber("--space-32", "Space 32", "spacing", 8, remSpaceRange),
  cssText("--section-padding-x", "Section horizontal padding", "layout", "clamp(1rem, 2.8vw, 2.1rem)"),
  cssText("--section-padding-y-sm", "Small section padding", "layout", "3.9rem"),
  cssText("--section-padding-y-md", "Medium section padding", "layout", "6.5rem"),
  cssText("--section-padding-y-lg", "Large section padding", "layout", "7.8rem"),
  cssNumber("--section-hero-min-height", "Hero section min height", "layout", 78, {
    min: 40,
    max: 100,
    step: 1,
    unit: "svh",
  }),
  cssText(
    "--brandy-section-default-padding-y",
    "Default section padding",
    "layout", "var(--section-padding-y-md)",
  ),
  cssNumber("--container-sm", "Small container", "layout", 683, containerRange),
  cssNumber("--container-md", "Medium container", "layout", 907, containerRange),
  cssNumber("--container-lg", "Large container", "layout", 1120, containerRange),
  cssNumber("--container-xl", "Extra large container", "layout", 1328, containerRange),
  cssText("--content-readable-max", "Readable content max", "layout", "52rem"),
  cssText(
    "--brandy-container-default-max-width",
    "Default container max width",
    "layout", "var(--container-lg)",
  ),
  cssText(
    "--brandy-grid-default-columns",
    "Default grid columns",
    "layout", "repeat(3, minmax(0, 1fr))",
  ),
  cssText(
    "--brandy-split-default-columns",
    "Default split columns",
    "layout", "minmax(0, 1fr) minmax(0, 1fr)",
  ),
  cssSelect(
    "--brandy-cluster-default-justify",
    "Default cluster justify",
    "layout", "center",
    [
      { value: "flex-start", label: "Start" },
      { value: "center", label: "Center" },
      { value: "flex-end", label: "End" },
      { value: "space-between", label: "Space between" },
    ],
  ),
  cssText("--brandy-cluster-default-gap", "Default cluster gap", "layout", "var(--space-5)"),
  cssText("--brandy-stack-default-gap", "Default stack gap", "layout", "var(--space-6)"),
  cssNumber("--hero-grid-text-fr", "Hero grid text fraction", "layout", 0.86, fractionRange),
  cssNumber("--hero-grid-visual-fr", "Hero grid visual fraction", "layout", 1.14, fractionRange),
  cssNumber("--hero-grid-visual-min", "Hero visual min width", "layout", 28, componentRemRange),
  cssNumber("--hero-headline-max-width", "Hero headline max width", "layout", 9, {
    min: 4,
    max: 24,
    step: 1,
    unit: "ch",
  }),
  cssNumber("--hero-copy-max-width", "Hero copy max width", "layout", 9, {
    min: 4,
    max: 24,
    step: 1,
    unit: "ch",
  }),
  cssNumber("--hero-description-max-width", "Hero description max width", "layout", 52, componentRemRange),
  cssNumber("--footer-copy-max-width", "Footer copy max width", "layout", 40, componentRemRange),
  cssText("--footer-columns", "Footer columns", "layout", "1.2fr 1fr auto"),
  cssText("--button-height-sm", "Small button height", "component-size", "calc(2rem + 0.25rem)"),
  cssText("--button-height-md", "Medium button height", "component-size", "calc(2.5rem + 0.25rem)"),
  cssText("--button-height-lg", "Large button height", "component-size", "calc(3rem + 0.25rem)"),
  cssNumber("--button-font-size", "Button font size", "component-size", 0.9016, fontRemRange),
  cssNumber("--button-font-weight", "Button font weight", "component-size", 710, fontWeightRange),
  cssNumber("--button-hover-lift", "Button hover lift", "component-size", -1, {
    min: -8,
    max: 0,
    step: 1,
    unit: "px",
  }),
  cssText("--button-padding-sm", "Small button padding", "component-size", "var(--space-4)"),
  cssText("--button-padding-md", "Medium button padding", "component-size", "var(--space-5)"),
  cssText("--button-padding-lg", "Large button padding", "component-size", "var(--space-6)"),
  cssNumber("--badge-font-weight", "Badge font weight", "component-size", 710, fontWeightRange),
  cssText("--card-padding", "Card padding", "component-size", "1.95rem"),
  cssNumber("--navbar-min-height", "Navbar min height", "component-size", 4.25, componentRemRange),
  cssNumber("--navbar-link-font-size", "Navbar link font size", "component-size", 0.9016, fontRemRange),
  cssNumber(
    "--navbar-brand-mark-size",
    "Navbar brand mark size",
    "component-size", 1.2,
    componentRemRange,
  ),
  cssNumber(
    "--navbar-menu-button-size",
    "Navbar menu button size",
    "component-size", 2.5,
    componentRemRange,
  ),
  cssText("--browser-bar-height", "Browser bar height", "component-size", "60px"),
  cssNumber("--browser-content-min-height", "Browser content min height", "component-size", 360, framePxRange),
  cssNumber("--browser-dot-size", "Browser dot size", "component-size", 0.625, componentRemRange),
  cssNumber("--demo-frame-min-height", "Demo frame min height", "component-size", 480, framePxRange),
  cssText("--demo-preview-nav-height", "Demo preview nav height", "component-size", "52px"),
  cssNumber("--hero-demo-height", "Hero demo height", "component-size", 360, framePxRange),
  cssNumber("--demo-sidebar-width", "Demo sidebar width", "component-size", 14, componentRemRange),
  cssNumber("--demo-canvas-left-fr", "Demo canvas left fraction", "component-size", 1.1, fractionRange),
  cssNumber("--demo-canvas-min-column", "Demo canvas min column", "component-size", 16, componentRemRange),
  cssNumber("--demo-canvas-right-fr", "Demo canvas right fraction", "component-size", 0.9, fractionRange),
  cssNumber("--demo-layer-font-size", "Demo layer font size", "component-size", 0.9016, fontRemRange),
  cssNumber("--demo-layer-min-height", "Demo layer min height", "component-size", 2.5, componentRemRange),
  cssNumber("--demo-accent-bar-height", "Demo accent bar height", "component-size", 0.5, componentRemRange),
  cssNumber("--demo-accent-bar-width", "Demo accent bar width", "component-size", 5, componentRemRange),
  cssNumber("--feature-card-min-height", "Feature card min height", "component-size", 14, componentRemRange),
  cssNumber("--step-card-min-height", "Step card min height", "component-size", 16, componentRemRange),
  cssNumber("--faq-trigger-min-height", "FAQ trigger min height", "component-size", 5.85, componentRemRange),
  cssNumber("--radius-sm", "Small radius", "radii", 0, radiusRange),
  cssNumber("--radius-md", "Medium radius", "radii", 0, radiusRange),
  cssNumber("--radius-lg", "Large radius", "radii", 0, radiusRange),
  cssNumber("--radius-full", "Full radius", "radii", 999, radiusRange),
  cssNumber("--stroke-thin", "Thin stroke", "stroke", 1, strokeRange),
  cssNumber("--stroke-medium", "Medium stroke", "stroke", 2, strokeRange),
  cssText("--shadow-soft", "Soft shadow", "elevation", "0 20px 60px rgba(13, 5, 10, 0.08)"),
  cssText("--shadow-raised", "Raised shadow", "elevation", "0 32px 100px rgba(13, 5, 10, 0.12)"),
  cssText("--shadow-brand", "Brand shadow", "elevation", "0 28px 84px rgba(167, 16, 53, 0.18)"),
  cssText("--ease-out", "Ease out", "motion", "cubic-bezier(0.16, 1, 0.3, 1)"),
  cssText("--ease-in-out", "Ease in out", "motion", "cubic-bezier(0.65, 0, 0.35, 1)"),
  cssNumber("--duration-fast", "Fast duration", "motion", 161, durationRange),
  cssNumber("--duration-base", "Base duration", "motion", 260, durationRange),
  cssNumber("--duration-slow", "Slow duration", "motion", 499, durationRange),
  cssNumber("--z-base", "Base layer", "layering", 0, zIndexRange),
  cssNumber("--z-raised", "Raised layer", "layering", 10, zIndexRange),
  cssNumber("--z-header", "Header layer", "layering", 50, zIndexRange),
  cssNumber("--z-modal", "Modal layer", "layering", 100, zIndexRange),
  cssText(
    "--font-family-heading",
    "Heading font family",
    "typography", "\"Avenir Next\", Avenir, \"Segoe UI\", ui-sans-serif, system-ui, sans-serif",
  ),
  cssText(
    "--font-family-body",
    "Body font family",
    "typography", "\"Avenir Next\", Avenir, \"Segoe UI\", ui-sans-serif, system-ui, sans-serif",
  ),
  cssNumber("--font-size-display", "Display font size", "typography", 6.4672, fontRemRange),
  cssNumber("--font-size-h1", "H1 font size", "typography", 4.0592, fontRemRange),
  cssNumber("--font-size-h2", "H2 font size", "typography", 3.2336, fontRemRange),
  cssNumber("--font-size-h3", "H3 font size", "typography", 2.1976, fontRemRange),
  cssNumber("--font-size-h4", "H4 font size", "typography", 1.5983, fontRemRange),
  cssNumber("--font-size-body-lg", "Large body font size", "typography", 1.288, fontRemRange),
  cssNumber("--font-size-body", "Body font size", "typography", 1.0304, fontRemRange),
  cssNumber("--font-size-caption", "Caption font size", "typography", 0.7728, {
    ...fontRemRange,
    step: 0.001,
  }),
  cssNumber("--font-size-eyebrow", "Eyebrow font size", "typography", 0.644, fontRemRange),
  cssNumber("--line-height-root", "Root line height", "typography", 1.538, lineHeightRange),
  cssNumber("--line-height-display", "Display line height", "typography", 1.02, lineHeightRange),
  cssNumber("--line-height-h1", "H1 line height", "typography", 1.05, lineHeightRange),
  cssNumber("--line-height-h2", "H2 line height", "typography", 1.08, lineHeightRange),
  cssNumber("--line-height-h3", "H3 line height", "typography", 1.15, lineHeightRange),
  cssNumber("--line-height-h4", "H4 line height", "typography", 1.33, lineHeightRange),
  cssNumber("--line-height-body-lg", "Large body line height", "typography", 1.661, lineHeightRange),
  cssNumber("--line-height-body", "Body line height", "typography", 1.553, lineHeightRange),
  cssNumber("--line-height-caption", "Caption line height", "typography", 1.53, lineHeightRange),
  cssNumber("--line-height-eyebrow", "Eyebrow line height", "typography", 1.6, lineHeightRange),
  cssNumber("--font-weight-heading", "Heading font weight", "typography", 730, fontWeightRange),
  cssNumber("--font-weight-body", "Body font weight", "typography", 400, fontWeightRange),
  cssNumber("--font-weight-strong", "Strong font weight", "typography", 770, fontWeightRange),
  cssNumber("--font-weight-label", "Label font weight", "typography", 750, fontWeightRange),
  cssNumber("--letter-spacing-heading", "Heading letter spacing", "typography", 0.006, {
    min: -0.1,
    max: 0.2,
    step: 0.001,
    unit: "em",
  }),
  cssNumber("--letter-spacing-eyebrow", "Eyebrow letter spacing", "typography", 0.006, {
    min: -0.1,
    max: 0.2,
    step: 0.001,
    unit: "em",
  }),
  cssSelect(
    "--text-transform-eyebrow",
    "Eyebrow text transform",
    "typography", "none",
    [
      { value: "none", label: "None" },
      { value: "uppercase", label: "Uppercase" },
    ],
  ),
  cssSelect(
    "--section-header-align",
    "Section header alignment",
    "layout", "center",
    TEXT_ALIGN_OPTIONS,
  ),
  cssSelect(
    "--section-header-left-align",
    "Section header left alignment",
    "layout", "left",
    TEXT_ALIGN_OPTIONS,
  ),
  cssSelect("--final-cta-align", "Final CTA alignment", "layout", "center", TEXT_ALIGN_OPTIONS),
  cssSelect(
    "--demo-inspector-top-justify",
    "Demo inspector top justify",
    "component-size", "flex-start",
    [
      { value: "flex-start", label: "Start" },
      { value: "center", label: "Center" },
      { value: "flex-end", label: "End" },
      { value: "space-between", label: "Space between" },
    ],
  ),
  cssNumber(
    "--navbar-blur",
    "Navbar blur",
    "overlay", 16,
    { min: 0, max: 28, step: 1, unit: "px" },
    "Overlay-controlled navbar backdrop-filter blur.",
  ),
  cssSelect(
    "--brandy-scroll-behavior",
    "Scroll behavior",
    "overlay", "smooth",
    [
      { value: "smooth", label: "Smooth" },
      { value: "auto", label: "Auto" },
    ],
    "Overlay-controlled global scroll behavior.",
  ),
  cssNumber(
    "--brandy-marquee-duration",
    "Marquee duration",
    "overlay", 28,
    { min: 1, max: 80, step: 1, unit: "s" },
    "Overlay-controlled logo marquee animation duration.",
  ),
  cssSelect(
    "--brandy-animation-play-state",
    "Animation play state",
    "overlay", "running",
    [
      { value: "running", label: "Running" },
      { value: "paused", label: "Paused" },
    ],
    "Overlay-controlled animation play state.",
  ),
] as const satisfies readonly DesignTokenCssVariableEntry[];

export const DESIGN_SYSTEM_SELECT_DESCRIPTORS = [
  designSystemSelect<"section.variant", SectionVariant>(
    "section.variant",
    "Section variant",
    "default",
    SECTION_VARIANT_OPTIONS,
  ),
  designSystemSelect<"section.size", SectionSize>("section.size", "Section size", "md", SECTION_SIZE_OPTIONS),
  designSystemSelect<"container.size", ContainerSize>(
    "container.size",
    "Container size",
    "lg",
    CONTAINER_SIZE_OPTIONS,
  ),
  designSystemSelect<"stack.gap", StackGap>("stack.gap", "Stack gap", "md", STACK_GAP_OPTIONS),
  designSystemSelect<"grid.columns", GridColumns>("grid.columns", "Grid columns", 3, GRID_COLUMN_OPTIONS),
  designSystemSelect<"split.ratio", SplitRatio>("split.ratio", "Split ratio", "even", SPLIT_RATIO_OPTIONS),
  designSystemSelect<"cluster.gap", ClusterGap>("cluster.gap", "Cluster gap", "md", CLUSTER_GAP_OPTIONS),
  designSystemSelect<"cluster.align", ClusterAlign>(
    "cluster.align",
    "Cluster alignment",
    "start",
    CLUSTER_ALIGN_OPTIONS,
  ),
  designSystemSelect<"card.variant", CardVariant>("card.variant", "Card variant", "default", CARD_VARIANT_OPTIONS),
  designSystemSelect<"button.variant", ButtonVariant>(
    "button.variant",
    "Button variant",
    "primary",
    BUTTON_VARIANT_OPTIONS,
  ),
  designSystemSelect<"button.size", ButtonSize>("button.size", "Button size", "md", BUTTON_SIZE_OPTIONS),
  designSystemSelect<"badge.tone", BadgeTone>("badge.tone", "Badge tone", "neutral", BADGE_TONE_OPTIONS),
  designSystemSelect<"heading.element", HeadingElement>(
    "heading.element",
    "Heading element",
    "h2",
    HEADING_ELEMENT_OPTIONS,
  ),
  designSystemSelect<"heading.size", HeadingSize>("heading.size", "Heading size", "h2", HEADING_SIZE_OPTIONS),
  designSystemSelect<"text.size", TextSize>("text.size", "Text size", "body", TEXT_SIZE_OPTIONS),
  designSystemSelect<"text.align", TextAlign>("text.align", "Text alignment", "left", TEXT_ALIGN_OPTIONS),
] as const satisfies readonly DesignSystemSelectDescriptor[];

export const DESIGN_OVERLAY_SETTING_DESCRIPTORS = [
  {
    source: "overlay-setting",
    name: "mutedMode",
    label: "Muted mode",
    group: "overlay",
    control: "boolean",
    defaultValue: false,
  },
  {
    source: "overlay-setting",
    name: "highContrast",
    label: "High contrast",
    group: "overlay",
    control: "boolean",
    defaultValue: false,
  },
  {
    source: "overlay-setting",
    name: "reducedMotion",
    label: "Reduced motion",
    group: "overlay",
    control: "boolean",
    defaultValue: false,
  },
] as const satisfies readonly DesignOverlaySettingDescriptor[];

export const DESIGN_EDITOR_CATALOG = [
  ...DESIGN_TOKEN_CATALOG,
  ...DESIGN_SYSTEM_SELECT_DESCRIPTORS,
  ...DESIGN_OVERLAY_SETTING_DESCRIPTORS,
] as const satisfies readonly DesignTokenCatalogEntry[];

export const DESIGN_TOKEN_CSS_VARIABLE_NAMES = DESIGN_TOKEN_CATALOG.map(
  (entry) => entry.name,
);

const CATALOG_GROUP_TO_CONTROL_GROUP: Record<
  DesignTokenCatalogGroup,
  DesignTokenGroupKey
> = {
  "component-size": "components",
  "design-system": "alignment",
  elevation: "effects",
  layout: "layout",
  layering: "zIndex",
  motion: "motion",
  overlay: "motion",
  palette: "base",
  radii: "effects",
  "semantic-color": "semantic",
  spacing: "spacing",
  stroke: "effects",
  typography: "typography",
};

export const DESIGN_TOKEN_GROUPS = [
  { key: "base", title: "Base palette" },
  { key: "semantic", title: "Semantic colors" },
  { key: "spacing", title: "Spacing" },
  { key: "layout", title: "Layout" },
  { key: "alignment", title: "Alignment" },
  { key: "components", title: "Components" },
  { key: "typography", title: "Typography" },
  { key: "effects", title: "Effects" },
  { key: "motion", title: "Motion" },
  { key: "zIndex", title: "Z-index" },
] as const satisfies readonly { key: DesignTokenGroupKey; title: string }[];

const HIDDEN_DESIGN_TOKEN_EDITOR_GROUPS = new Set<DesignTokenGroupKey>([
  "alignment",
  "base",
  "components",
  "effects",
  "layout",
  "motion",
  "semantic",
  "spacing",
  "typography",
  "zIndex",
]);

export const DESIGN_TOKEN_EDITOR_GROUPS = DESIGN_TOKEN_GROUPS.filter(
  (group) => !HIDDEN_DESIGN_TOKEN_EDITOR_GROUPS.has(group.key),
);

export const DESIGN_TOKEN_CONTROLS = DESIGN_TOKEN_CATALOG.map(
  getDesignTokenControl,
) as readonly DesignTokenControl[];

export function isDesignTokenCssVariableEntry(
  entry: DesignTokenCatalogEntry,
): entry is DesignTokenCssVariableEntry {
  return entry.source === "css-variable";
}

export function getDesignTokenControlValue(
  control: DesignTokenControl,
  values: DesignTokenValueMap,
): string {
  return values[control.variable] ?? control.defaultValue;
}

export function getDesignTokenCssVariables(
  values: DesignTokenValueMap,
): DesignTokenValueMap {
  const variables: DesignTokenValueMap = {};

  for (const variable of DESIGN_TOKEN_CSS_VARIABLE_NAMES) {
    const value = values[variable];
    if (value) variables[variable] = value;
  }

  return variables;
}

export function readStoredDesignTokenValues(
  storage: Storage | undefined = getBrowserStorage(),
): DesignTokenValueMap {
  if (!storage) return {};

  try {
    const raw = storage.getItem(DESIGN_TOKEN_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return DESIGN_TOKEN_CSS_VARIABLE_NAMES.reduce<DesignTokenValueMap>(
      (values, variable) => {
        const value = parsed[variable];
        if (typeof value === "string" && value.trim()) {
          values[variable] = value.trim();
        }
        return values;
      },
      {},
    );
  } catch {
    return {};
  }
}

export function persistDesignTokenValueDiff(
  values: DesignTokenValueMap,
  storage: Storage | undefined = getBrowserStorage(),
) {
  if (!storage) return;

  if (Object.keys(values).length === 0) {
    storage.removeItem(DESIGN_TOKEN_STORAGE_KEY);
    return;
  }

  storage.setItem(DESIGN_TOKEN_STORAGE_KEY, JSON.stringify(values));
}

export function parseDesignTokenNumber(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatDesignTokenNumberValue(
  control: Pick<DesignTokenNumberControl, "step" | "unit">,
  value: number,
): string {
  const precision = control.step.toString().split(".")[1]?.length ?? 0;
  const roundedValue = Number(value.toFixed(precision));
  return `${roundedValue}${control.unit ?? ""}`;
}

export const DESIGN_TOKEN_STORAGE_KEY = "brandy:design-token-values:v1";

function getDesignTokenControl(entry: DesignTokenCssVariableEntry): DesignTokenControl {
  const base = {
    variable: entry.name,
    label: entry.label,
    group: getDesignTokenGroup(entry),
    defaultValue: getDesignTokenDefaultValue(entry),
  };

  switch (entry.control) {
    case "color":
      return { ...base, type: "color" };
    case "number":
      return {
        ...base,
        type: "number",
        min: entry.min,
        max: entry.max,
        step: entry.step,
        unit: entry.unit,
      };
    case "select":
      return {
        ...base,
        type: "select",
        options: entry.options.map((option) => ({
          value: String(option.value),
          label: option.label,
        })),
      };
    case "text":
      if (isVariableReferenceValue(base.defaultValue)) {
        return {
          ...base,
          type: "variable",
          options: getVariableReferenceOptions(entry),
        };
      }

      return { ...base, type: "text" };
  }
}

function getVariableReferenceOptions(
  entry: DesignTokenTextEntry,
): readonly DesignTokenVariableReferenceOption[] {
  const referencedEntry = getReferencedTokenEntry(entry);

  return DESIGN_TOKEN_CATALOG.filter(
    (candidate) =>
      candidate.name !== entry.name &&
      isCompatibleVariableReference(entry, referencedEntry, candidate),
  ).map((candidate) => ({
    group: getDesignTokenGroup(candidate),
    label: `${candidate.label} (${candidate.name})`,
    value: `var(${candidate.name})` as DesignTokenVariableReferenceValue,
    variable: candidate.name,
  }));
}

function getReferencedTokenEntry(
  entry: DesignTokenTextEntry,
): DesignTokenCssVariableEntry | undefined {
  const referencedName = entry.defaultValue.match(/^var\((--[a-z0-9-]+)\)$/)?.[1];
  return DESIGN_TOKEN_CATALOG.find(
    (candidate) => candidate.name === referencedName,
  );
}

function isCompatibleVariableReference(
  entry: DesignTokenTextEntry,
  referencedEntry: DesignTokenCssVariableEntry | undefined,
  candidate: DesignTokenCssVariableEntry,
): boolean {
  if (isColorTokenGroup(entry.group) || isColorTokenGroup(referencedEntry?.group)) {
    return isColorTokenGroup(candidate.group);
  }

  const referenceGroup = referencedEntry
    ? getDesignTokenGroup(referencedEntry)
    : getDesignTokenGroup(entry);

  return getDesignTokenGroup(candidate) === referenceGroup;
}

function isColorTokenGroup(
  group: DesignTokenCatalogGroup | undefined,
): group is "palette" | "semantic-color" {
  return group === "palette" || group === "semantic-color";
}

function isVariableReferenceValue(
  value: string,
): value is DesignTokenVariableReferenceValue {
  return /^var\(--[a-z0-9-]+\)$/.test(value.trim());
}

function getDesignTokenDefaultValue(entry: DesignTokenCssVariableEntry): string {
  if (entry.control === "number") {
    return formatDesignTokenNumberValue(entry, entry.defaultValue);
  }

  return String(entry.defaultValue);
}

function getDesignTokenGroup(entry: DesignTokenCssVariableEntry): DesignTokenGroupKey {
  if (entry.name.includes("align") || entry.name.includes("justify")) {
    return "alignment";
  }

  return CATALOG_GROUP_TO_CONTROL_GROUP[entry.group];
}

function getBrowserStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
}
