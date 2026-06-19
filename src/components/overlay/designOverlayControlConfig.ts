import { LOCKUP_SHAPE_OPTIONS } from "../../lib/lockupTheme.mjs";
import { TYPOGRAPHY_FONT_OPTIONS } from "../../lib/typographyTheme.mjs";
import type {
  DesignCssVariableName,
  DesignOverlayGroupKey,
  DesignOverlayValues,
} from "./designOverlayModel";

export type NumberSettingKey =
  | "accentMomentDistancePercent"
  | "backgroundDistancePercent"
  | "borderDistancePercent"
  | "buttonPrimaryBgDistancePercent"
  | "buttonSecondaryBorderDistancePercent"
  | "buttonSecondaryHoverDistancePercent"
  | "highlightSoftDistancePercent"
  | "linkColorDistancePercent"
  | "linkHoverDistancePercent"
  | "footerBackgroundDistancePercent"
  | "footerBorderDistancePercent"
  | "navbarBackgroundDistancePercent"
  | "navbarBorderDistancePercent"
  | "neutralSurfaceDistancePercent"
  | "sectionSpacing"
  | "radius"
  | "pageGutter"
  | "heroBalance"
  | "lockupGap"
  | "lockupLogoSize"
  | "lockupWordmarkSize"
  | "lockupWordmarkTracking"
  | "primaryHoverDistancePercent"
  | "readableTextDistancePercent"
  | "secondaryTextDistancePercent"
  | "secondarySurfaceDistancePercent"
  | "textWidth"
  | "typographyScale"
  | "typographyDensity"
  | "typographyWeight"
  | "headlineStyle"
  | "typographyTightness";
export type LayoutSelectSettingKey = "gridDensity" | "heroScale" | "pageWidth";
export type LockupSelectSettingKey = "lockupShape" | "lockupWordmarkFont";
export type TypographySelectSettingKey = "typographyPairing" | "typographyStyle";
export type TypographyFontSettingKey =
  | "typographyPrimaryFont"
  | "typographySecondaryFont";
export type SelectSettingKey =
  | LayoutSelectSettingKey
  | LockupSelectSettingKey
  | TypographyFontSettingKey
  | TypographySelectSettingKey;
export type BooleanSettingKey = "darkMode" | "mutedMode" | "highContrast";
export type ResetKey = keyof DesignOverlayValues;

export type SliderControlConfig = {
  endLabel?: string;
  key: NumberSettingKey;
  label: string;
  max: number;
  min: number;
  startLabel?: string;
  step: number;
  suffix?: string;
};
export type SegmentedControlConfig<Key extends SelectSettingKey> = {
  key: Key;
  label: string;
  options: readonly {
    label: string;
    value: DesignOverlayValues[Key];
  }[];
};
export type SelectControlConfig<Key extends SelectSettingKey> =
  SegmentedControlConfig<Key>;
export type ToggleControlConfig = { key: BooleanSettingKey; label: string };

export const LAYOUT_SLIDERS: readonly SliderControlConfig[] = [
  {
    key: "sectionSpacing",
    label: "Spacing",
    min: 50,
    max: 130,
    startLabel: "Compact",
    endLabel: "Airy",
    step: 1,
  },
  {
    key: "radius",
    label: "Corners",
    min: 0,
    max: 24,
    startLabel: "Sharp",
    endLabel: "Pillowy",
    step: 1,
    suffix: "px",
  },
  {
    key: "pageGutter",
    label: "Page gutter",
    min: 50,
    max: 130,
    startLabel: "Tight",
    endLabel: "Open",
    step: 1,
  },
  {
    key: "heroBalance",
    label: "Hero emphasis",
    min: 35,
    max: 65,
    startLabel: "More copy",
    endLabel: "More interface",
    step: 1,
  },
  {
    key: "textWidth",
    label: "Text width",
    min: 22,
    max: 52,
    startLabel: "Focused",
    endLabel: "Expanded",
    step: 1,
    suffix: "rem",
  },
];
export const LAYOUT_SEGMENTED_CONTROLS = [
  {
    key: "pageWidth",
    label: "Page width",
    options: [
      { label: "Narrow", value: "narrow" },
      { label: "Standard", value: "standard" },
      { label: "Wide", value: "wide" },
      { label: "Full", value: "full" },
    ],
  },
  {
    key: "heroScale",
    label: "Hero presence",
    options: [
      { label: "Compact", value: "compact" },
      { label: "Roomy", value: "balanced" },
      { label: "Showcase", value: "immersive" },
    ],
  },
  {
    key: "gridDensity",
    label: "Grid density",
    options: [
      { label: "Sparse", value: "sparse" },
      { label: "Balanced", value: "balanced" },
      { label: "Dense", value: "dense" },
    ],
  },
] as const satisfies readonly SegmentedControlConfig<LayoutSelectSettingKey>[];
export const TYPOGRAPHY_SLIDERS: readonly SliderControlConfig[] = [
  {
    key: "typographyScale",
    label: "Scale",
    min: 0,
    max: 100,
    startLabel: "Subtle",
    endLabel: "Dramatic",
    step: 1,
  },
  {
    key: "typographyDensity",
    label: "Density",
    min: 0,
    max: 100,
    startLabel: "Compact",
    endLabel: "Airy",
    step: 1,
  },
  {
    key: "typographyWeight",
    label: "Weight",
    min: 0,
    max: 100,
    startLabel: "Light",
    endLabel: "Bold",
    step: 1,
  },
  {
    key: "headlineStyle",
    label: "Headline style",
    min: 0,
    max: 100,
    startLabel: "Quiet",
    endLabel: "Expressive",
    step: 1,
  },
  {
    key: "typographyTightness",
    label: "Tightness",
    min: 0,
    max: 100,
    startLabel: "Loose",
    endLabel: "Tight",
    step: 1,
  },
];
export const TYPOGRAPHY_SELECT_CONTROLS = [
  {
    key: "typographyStyle",
    label: "Type style",
    options: [
      { label: "Geometric", value: "geometric" },
      { label: "Grotesk", value: "grotesk" },
      { label: "Humanist", value: "humanist" },
      { label: "Editorial", value: "editorial" },
      { label: "Mono tech", value: "mono_tech" },
      { label: "Playful", value: "playful" },
      { label: "Luxury", value: "luxury" },
    ],
  },
  {
    key: "typographyPairing",
    label: "Pairing",
    options: [
      { label: "Single family", value: "single_family" },
      { label: "Display + text", value: "display_plus_text" },
      { label: "Editorial contrast", value: "editorial_contrast" },
      { label: "Mono accent", value: "mono_accent" },
    ],
  },
  {
    key: "typographyPrimaryFont",
    label: "Primary font",
    options: TYPOGRAPHY_FONT_OPTIONS.map((font) => ({
      label: font.label,
      value: font.id,
    })),
  },
  {
    key: "typographySecondaryFont",
    label: "Secondary font",
    options: TYPOGRAPHY_FONT_OPTIONS.map((font) => ({
      label: font.label,
      value: font.id,
    })),
  },
] as const satisfies readonly SelectControlConfig<
  TypographyFontSettingKey | TypographySelectSettingKey
>[];
export const LOCKUP_SELECT_CONTROLS = [
  {
    key: "lockupShape",
    label: "Logo shape",
    options: LOCKUP_SHAPE_OPTIONS,
  },
  {
    key: "lockupWordmarkFont",
    label: "Wordmark font",
    options: TYPOGRAPHY_FONT_OPTIONS.map((font) => ({
      label: font.label,
      value: font.id,
    })),
  },
] as const satisfies readonly SelectControlConfig<LockupSelectSettingKey>[];
export const LOCKUP_SLIDERS: readonly SliderControlConfig[] = [
  {
    key: "lockupLogoSize",
    label: "Logo size",
    min: 12,
    max: 72,
    startLabel: "Small",
    endLabel: "Large",
    step: 1,
    suffix: "px",
  },
  {
    key: "lockupWordmarkSize",
    label: "Wordmark size",
    min: 12,
    max: 42,
    startLabel: "Small",
    endLabel: "Large",
    step: 1,
    suffix: "px",
  },
  {
    key: "lockupWordmarkTracking",
    label: "Wordmark tracking",
    min: -2,
    max: 10,
    startLabel: "Tight",
    endLabel: "Spaced",
    step: 0.1,
    suffix: "px",
  },
  {
    key: "lockupGap",
    label: "Mark gap",
    min: 0,
    max: 32,
    startLabel: "Tight",
    endLabel: "Open",
    step: 1,
    suffix: "px",
  },
];
export const MODE_TOGGLES: readonly ToggleControlConfig[] = [
  { key: "mutedMode", label: "Muted mode" },
  { key: "highContrast", label: "High contrast" },
];
export const PALETTE_KEYS = [
  "primaryColor",
  "secondaryColor",
  "accentColor",
  "highlightColor",
  "backgroundDistancePercent",
  "borderDistancePercent",
  "buttonPrimaryBgDistancePercent",
  "buttonSecondaryBorderDistancePercent",
  "buttonSecondaryHoverDistancePercent",
  "linkColorDistancePercent",
  "linkHoverDistancePercent",
  "footerBackgroundDistancePercent",
  "footerBorderDistancePercent",
  "navbarBackgroundDistancePercent",
  "navbarBorderDistancePercent",
  "primaryHoverDistancePercent",
  "secondarySurfaceDistancePercent",
  "accentMomentDistancePercent",
  "highlightSoftDistancePercent",
  "neutralSurfaceDistancePercent",
  "readableTextDistancePercent",
  "secondaryTextDistancePercent",
  "darkMode",
  "mutedMode",
  "highContrast",
] as const satisfies readonly ResetKey[];
export const PALETTE_COLOR_KEYS = [
  "primaryColor",
  "secondaryColor",
  "accentColor",
  "highlightColor",
] as const satisfies readonly ResetKey[];
export const LOCKUP_KEYS = [
  "lockupShape",
  "lockupLogoSize",
  "lockupWordmarkFont",
  "lockupWordmarkSize",
  "lockupWordmarkTracking",
  "lockupGap",
] as const satisfies readonly ResetKey[];
export const LAYOUT_KEYS = [
  "sectionSpacing",
  "radius",
  "pageWidth",
  "pageGutter",
  "heroScale",
  "heroBalance",
  "textWidth",
  "gridDensity",
] as const satisfies readonly ResetKey[];
export const TYPOGRAPHY_KEYS = [
  "typographyStyle",
  "typographyPairing",
  "typographyPrimaryFont",
  "typographySecondaryFont",
  "typographyScale",
  "typographyDensity",
  "typographyWeight",
  "headlineStyle",
  "typographyTightness",
] as const satisfies readonly ResetKey[];
export const DEFAULT_LOCKED_KEYS = [
  "sectionSpacing",
  "heroScale",
] as const satisfies readonly ResetKey[];
export const INITIAL_GROUP_STATE: Record<DesignOverlayGroupKey, boolean> = {
  lockup: true,
  palette: true,
  layout: true,
  typography: true,
  motion: false,
  preview: false,
  modes: false,
};
export const DERIVED_COLOR_CONTROLS = [
  {
    id: "background",
    key: "backgroundDistancePercent",
    label: "Background",
    max: 220,
    sourceLabel: "Primary",
    token: "--color-bg",
  },
  {
    id: "primary-hover",
    key: "primaryHoverDistancePercent",
    label: "Primary hover",
    sourceLabel: "Primary",
    token: "--button-primary-hover",
  },
  {
    id: "primary-button",
    key: "buttonPrimaryBgDistancePercent",
    label: "Primary button",
    sourceLabel: "Primary",
    token: "--button-primary-bg",
  },
  {
    id: "secondary-surface",
    key: "secondarySurfaceDistancePercent",
    label: "Secondary surface",
    sourceLabel: "Secondary",
    token: "--button-secondary-bg",
  },
  {
    id: "secondary-border",
    key: "buttonSecondaryBorderDistancePercent",
    label: "Secondary border",
    sourceLabel: "Secondary",
    token: "--button-secondary-border",
  },
  {
    id: "secondary-hover",
    key: "buttonSecondaryHoverDistancePercent",
    label: "Secondary hover",
    sourceLabel: "Secondary",
    token: "--button-secondary-hover",
  },
  {
    id: "link-color",
    key: "linkColorDistancePercent",
    label: "Link",
    sourceLabel: "Primary",
    token: "--link-color",
  },
  {
    id: "link-hover",
    key: "linkHoverDistancePercent",
    label: "Link hover",
    sourceLabel: "Link",
    token: "--link-hover",
  },
  {
    id: "footer-background",
    key: "footerBackgroundDistancePercent",
    label: "Footer background",
    max: 220,
    sourceLabel: "Primary",
    token: "--color-footer-bg",
  },
  {
    id: "footer-border",
    key: "footerBorderDistancePercent",
    label: "Footer border",
    max: 220,
    sourceLabel: "Primary",
    token: "--color-footer-border",
  },
  {
    id: "navbar-background",
    key: "navbarBackgroundDistancePercent",
    label: "Navbar background",
    max: 220,
    sourceLabel: "Primary",
    token: "--color-nav-bg",
  },
  {
    id: "navbar-border",
    key: "navbarBorderDistancePercent",
    label: "Navbar border",
    max: 220,
    sourceLabel: "Primary",
    token: "--color-nav-border",
  },
  {
    id: "border",
    key: "borderDistancePercent",
    label: "Border",
    sourceLabel: "Surface",
    token: "--color-border",
  },
  {
    id: "accent-moment",
    key: "accentMomentDistancePercent",
    label: "Accent moment",
    sourceLabel: "Accent",
    token: "--gradient-hero-accent",
  },
  {
    id: "highlight-soft",
    key: "highlightSoftDistancePercent",
    label: "Highlight soft",
    sourceLabel: "Highlight",
    token: "--color-highlight-soft",
  },
  {
    id: "neutral-surface",
    key: "neutralSurfaceDistancePercent",
    label: "Neutral surface",
    max: 220,
    sourceLabel: "Primary",
    token: "--color-surface",
  },
  {
    id: "readable-text",
    key: "readableTextDistancePercent",
    label: "Primary text",
    sourceLabel: "Text base",
    token: "--color-text",
  },
  {
    id: "secondary-text",
    key: "secondaryTextDistancePercent",
    label: "Secondary text",
    sourceLabel: "Primary text",
    token: "--color-muted",
  },
] as const satisfies readonly {
  id: string;
  key: NumberSettingKey;
  label: string;
  max?: number;
  sourceLabel: string;
  token: DesignCssVariableName;
}[];

export type DerivedColorControlId = (typeof DERIVED_COLOR_CONTROLS)[number]["id"];
