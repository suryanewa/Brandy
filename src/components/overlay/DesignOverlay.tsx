import {
  ChevronDown,
  Palette,
  RotateCcw,
  Settings,
  Shuffle,
  SlidersHorizontal,
  Type,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  BRAND_GENERATED_TOKEN_NAMES,
  generateBrandDerivationRemix,
  generatePaletteRemix,
} from "../../lib/brandTheme.mjs";
import {
  LAYOUT_GENERATED_TOKEN_NAMES,
  generateLayoutRemix,
} from "../../lib/layoutTheme.mjs";
import {
  TYPOGRAPHY_FONT_OPTIONS,
  TYPOGRAPHY_GENERATED_TOKEN_NAMES,
  generateTypographyRemix,
} from "../../lib/typographyTheme.mjs";
import {
  DEFAULT_DESIGN_OVERLAY_VALUES,
  DESIGN_CSS_VARIABLE_NAMES,
  DESIGN_OVERLAY_STORAGE_KEY,
  areDesignValuesEqual,
  getDesignBrandDerivation,
  getDesignBrandSeeds,
  getDesignCssVariables,
  getDesignLayoutSeeds,
  getDesignTypographySeeds,
  persistDesignValueDiff,
  readStoredDesignValues,
  type DesignCssVariableName,
  type DesignOverlayGroupKey,
  type DesignOverlayValues,
} from "./designOverlayModel";
import {
  ColorControl,
  DerivedColorPreview,
  SelectControl,
  SegmentedControl,
  SliderControl,
  ToggleControl,
} from "./DesignOverlayControls";
import {
  DESIGN_TOKEN_CSS_VARIABLE_NAMES,
  DESIGN_TOKEN_STORAGE_KEY,
  getDesignTokenCssVariables,
  persistDesignTokenValueDiff,
  readStoredDesignTokenValues,
  type DesignTokenValueMap,
  type DesignTokenVariableName,
} from "./designTokenCatalog";

export interface DesignOverlayProps {
  className?: string;
  defaults?: Partial<DesignOverlayValues>;
  initialOpen?: boolean;
  targetRoot?: HTMLElement | null;
  title?: string;
}

type InlineRestore = {
  previous: Map<`--${string}`, string>;
  target: HTMLElement;
};
type SourceSyncState = "idle" | "syncing" | "synced" | "error";
type NumberSettingKey =
  | "accentMomentDistancePercent"
  | "backgroundDistancePercent"
  | "borderDistancePercent"
  | "buttonPrimaryBgDistancePercent"
  | "buttonSecondaryBorderDistancePercent"
  | "buttonSecondaryHoverDistancePercent"
  | "highlightSoftDistancePercent"
  | "linkColorDistancePercent"
  | "linkHoverDistancePercent"
  | "neutralSurfaceDistancePercent"
  | "sectionSpacing"
  | "radius"
  | "pageGutter"
  | "heroBalance"
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
type LayoutSelectSettingKey = "gridDensity" | "heroScale" | "pageWidth";
type TypographySelectSettingKey = "typographyPairing" | "typographyStyle";
type TypographyFontSettingKey = "typographyPrimaryFont" | "typographySecondaryFont";
type SelectSettingKey =
  | LayoutSelectSettingKey
  | TypographyFontSettingKey
  | TypographySelectSettingKey;
type BooleanSettingKey = "darkMode" | "mutedMode" | "highContrast";
type ResetKey = keyof DesignOverlayValues;
type SliderControlConfig = {
  endLabel?: string;
  key: NumberSettingKey;
  label: string;
  max: number;
  min: number;
  startLabel?: string;
  step: number;
  suffix?: string;
};
type SegmentedControlConfig<Key extends SelectSettingKey> = {
  key: Key;
  label: string;
  options: readonly {
    label: string;
    value: DesignOverlayValues[Key];
  }[];
};
type SelectControlConfig<Key extends SelectSettingKey> = SegmentedControlConfig<Key>;
type ToggleControlConfig = { key: BooleanSettingKey; label: string };

const LAYOUT_SLIDERS: readonly SliderControlConfig[] = [
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
const LAYOUT_SEGMENTED_CONTROLS = [
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
const TYPOGRAPHY_SLIDERS: readonly SliderControlConfig[] = [
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
const TYPOGRAPHY_SELECT_CONTROLS = [
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
const MODE_TOGGLES: readonly ToggleControlConfig[] = [
  { key: "mutedMode", label: "Muted mode" },
  { key: "highContrast", label: "High contrast" },
];
const PALETTE_KEYS = [
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
const LAYOUT_KEYS = [
  "sectionSpacing",
  "radius",
  "pageWidth",
  "pageGutter",
  "heroScale",
  "heroBalance",
  "textWidth",
  "gridDensity",
] as const satisfies readonly ResetKey[];
const TYPOGRAPHY_KEYS = [
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
const INITIAL_GROUP_STATE: Record<DesignOverlayGroupKey, boolean> = {
  palette: true,
  layout: true,
  typography: true,
  motion: false,
  preview: false,
  modes: false,
};
const FOCUSABLE_PANEL_SELECTOR = [
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "a[href]",
  '[tabindex]:not([tabindex="-1"])',
].join(",");
const TRACKED_CSS_VARIABLE_NAMES = Array.from(
  new Set([...DESIGN_CSS_VARIABLE_NAMES, ...DESIGN_TOKEN_CSS_VARIABLE_NAMES]),
) as Array<`--${string}`>;
const SOURCE_GENERATED_TOKEN_NAMES = new Set<`--${string}`>([
  ...BRAND_GENERATED_TOKEN_NAMES,
  ...LAYOUT_GENERATED_TOKEN_NAMES,
  ...TYPOGRAPHY_GENERATED_TOKEN_NAMES,
]);
const SOURCE_SYNC_DEBOUNCE_MS = 650;
const PALETTE_REMIX_SALT_RANGE = 4096;
const LAYOUT_REMIX_SALT_RANGE = 4096;
const TYPOGRAPHY_REMIX_SALT_RANGE = 4096;
const DERIVED_COLOR_CONTROLS = [
  {
    id: "background",
    key: "backgroundDistancePercent",
    label: "Background",
    sourceLabel: "Page base",
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
    sourceLabel: "Neutral base",
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
  sourceLabel: string;
  token: DesignCssVariableName;
}[];
type DerivedColorControlId = (typeof DERIVED_COLOR_CONTROLS)[number]["id"];

export function DesignOverlay({
  className,
  defaults,
  initialOpen = false,
  targetRoot,
  title = "Design Settings",
}: DesignOverlayProps) {
  const baseId = useId();
  const panelId = `${baseId}-design-overlay-panel`;
  const headingId = `${baseId}-design-overlay-heading`;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const restoreRef = useRef<InlineRestore | null>(null);
  const lastSyncedSourcePayloadRef = useRef("");
  const latestSourceSyncPayloadRef = useRef("");
  const paletteRemixBaseRef = useRef<ReturnType<typeof getDesignBrandSeeds> | null>(
    null,
  );
  const paletteRemixSaltRef = useRef(getPaletteRemixSalt());
  const paletteRemixStepRef = useRef(0);
  const layoutRemixSaltRef = useRef(getLayoutRemixSalt());
  const layoutRemixStepRef = useRef(0);
  const typographyRemixSaltRef = useRef(getTypographyRemixSalt());
  const typographyRemixStepRef = useRef(0);
  const [open, setOpen] = useState(initialOpen);
  const [expandedGroups, setExpandedGroups] =
    useState<Record<DesignOverlayGroupKey, boolean>>(INITIAL_GROUP_STATE);

  const resolvedDefaults = useMemo<DesignOverlayValues>(
    () => ({
      ...DEFAULT_DESIGN_OVERLAY_VALUES,
      ...defaults,
    }),
    [defaults],
  );

  const [values, setValues] = useState<DesignOverlayValues>(() =>
    readStoredDesignValues(resolvedDefaults),
  );
  const [tokenValues, setTokenValues] = useState<DesignTokenValueMap>(() =>
    readStoredDesignTokenValues(),
  );
  const [sourceSyncState, setSourceSyncState] =
    useState<SourceSyncState>("idle");
  const [sourceSyncMessage, setSourceSyncMessage] = useState("");
  const [sourceSyncUserEdited, setSourceSyncUserEdited] = useState(false);
  const [activeDerivedColor, setActiveDerivedColor] =
    useState<DerivedColorControlId | null>(null);

  const resolveTargetRoot = useCallback((): HTMLElement | null => {
    if (targetRoot) return targetRoot;
    if (typeof document === "undefined") return null;
    return document.documentElement;
  }, [targetRoot]);

  const restoreInlineVariables = useCallback(() => {
    const restore = restoreRef.current;
    if (!restore) return;

    for (const [name, previousValue] of restore.previous) {
      if (previousValue) {
        restore.target.style.setProperty(name, previousValue);
      } else {
        restore.target.style.removeProperty(name);
      }
    }

    restoreRef.current = null;
  }, []);

  const closePanel = useCallback(() => {
    setOpen(false);
    triggerButtonRef.current?.focus({ preventScroll: true });
  }, []);

  const trapPanelFocus = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") return;

    const panel = panelRef.current;
    if (!panel) return;

    const focusableElements = Array.from(
      panel.querySelectorAll<HTMLElement>(FOCUSABLE_PANEL_SELECTOR),
    ).filter((element) => !element.closest("[hidden]"));
    const firstFocusable = focusableElements.at(0);
    const lastFocusable = focusableElements.at(-1);
    if (!firstFocusable || !lastFocusable) return;

    const activeElement = document.activeElement;
    const focusFirst = !event.shiftKey && activeElement === lastFocusable;
    const focusLast = event.shiftKey && activeElement === firstFocusable;

    if (focusFirst || focusLast) {
      event.preventDefault();
      (focusFirst ? firstFocusable : lastFocusable).focus();
    }
  }, []);

  useEffect(() => {
    const target = resolveTargetRoot();
    if (!target) return undefined;

    if (restoreRef.current?.target !== target) {
      restoreInlineVariables();
      restoreRef.current = {
	        target,
	        previous: new Map(
	          TRACKED_CSS_VARIABLE_NAMES.map((name) => [
	            name,
	            target.style.getPropertyValue(name),
	          ]),
	        ),
      };
    }

    return restoreInlineVariables;
  }, [resolveTargetRoot, restoreInlineVariables]);

  useEffect(() => {
    const target = resolveTargetRoot();
    if (!target) return;

    const designIsDirty = !areDesignValuesEqual(values, resolvedDefaults);
    const curatedVariables: Partial<Record<DesignCssVariableName, string>> =
      designIsDirty ? getDesignCssVariables(values) : {};
    const directVariables = getDesignTokenCssVariables(tokenValues);

    for (const name of TRACKED_CSS_VARIABLE_NAMES) {
      const nextValue =
        directVariables[name as DesignTokenVariableName] ??
        curatedVariables[name as DesignCssVariableName];

      if (nextValue) {
        target.style.setProperty(name, nextValue);
      } else {
        target.style.removeProperty(name);
      }
    }
  }, [resolveTargetRoot, resolvedDefaults, tokenValues, values]);

  useEffect(() => {
    persistDesignValueDiff(values, resolvedDefaults);
  }, [resolvedDefaults, values]);

  useEffect(() => {
    persistDesignTokenValueDiff(tokenValues);
  }, [tokenValues]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === ",") {
        event.preventDefault();
        setOpen((current) => !current);
        return;
      }

      if (isDarkModeShortcut(event)) {
        event.preventDefault();
        setValues((current) => ({
          ...current,
          darkMode: !current.darkMode,
        }));
        return;
      }

      if (open && event.key === "Escape") {
        event.preventDefault();
        closePanel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closePanel, open]);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus({ preventScroll: true });
  }, [open]);

  const tokenIsDirty = Object.keys(tokenValues).length > 0;
  const designIsDirty = !areDesignValuesEqual(values, resolvedDefaults);
  const isDirty = designIsDirty || tokenIsDirty;
  const sourceSyncValues = useMemo<DesignTokenValueMap>(() => {
    const next: DesignTokenValueMap = {};

    if (designIsDirty) {
      for (const [name, value] of Object.entries(getDesignCssVariables(values))) {
        const variable = name as `--${string}`;
        if (SOURCE_GENERATED_TOKEN_NAMES.has(variable)) continue;
        next[variable] = value;
      }
    }

    Object.assign(next, tokenValues);
    return next;
  }, [designIsDirty, tokenValues, values]);
  const derivedPaletteValues = useMemo(() => getDesignCssVariables(values), [values]);
  const sourceSyncDirty = sourceSyncUserEdited;
  const sourceSyncAvailable = import.meta.env.DEV;
  const sourceSyncPayload = useMemo(
    () =>
      JSON.stringify({
        brand: getDesignBrandSeeds(values),
        brandDerivation: getDesignBrandDerivation(values),
        layout: getDesignLayoutSeeds(values),
        reload: false,
        typography: getDesignTypographySeeds(values),
        values: sourceSyncValues,
      }),
    [sourceSyncValues, values],
  );

  const markSourceSyncDirty = useCallback(() => {
    setSourceSyncUserEdited(true);
    setSourceSyncState("idle");
    setSourceSyncMessage("");
  }, []);

  const updateValue = useCallback(
    <Key extends keyof DesignOverlayValues,>(
      key: Key,
      nextValue: DesignOverlayValues[Key],
    ) => {
      markSourceSyncDirty();
      setValues((current) => ({
        ...current,
        [key]: nextValue,
      }));
    },
    [markSourceSyncDirty],
  );
  const updatePreviewValue = useCallback(
    <Key extends keyof DesignOverlayValues,>(
      key: Key,
      nextValue: DesignOverlayValues[Key],
    ) => {
      setValues((current) => ({
        ...current,
        [key]: nextValue,
      }));
    },
    [],
  );
  const updateControlValue = useCallback(
    <Key extends keyof DesignOverlayValues,>(
      key: Key,
      nextValue: DesignOverlayValues[Key],
    ) => {
      if ((TYPOGRAPHY_KEYS as readonly ResetKey[]).includes(key)) {
        typographyRemixSaltRef.current = getTypographyRemixSalt();
        typographyRemixStepRef.current = 0;
      }
      if ((LAYOUT_KEYS as readonly ResetKey[]).includes(key)) {
        layoutRemixSaltRef.current = getLayoutRemixSalt();
        layoutRemixStepRef.current = 0;
      }
      updateValue(key, nextValue);
    },
    [updateValue],
  );
  const updateBrandColorValue = useCallback(
    (key: "primaryColor" | "secondaryColor" | "accentColor" | "highlightColor", value: string) => {
      paletteRemixBaseRef.current = null;
      paletteRemixSaltRef.current = getPaletteRemixSalt();
      paletteRemixStepRef.current = 0;
      updateValue(key, value);
    },
    [updateValue],
  );

  const getNextTypographyRemix = useCallback(
    (options: Parameters<typeof generateTypographyRemix>[0] = {}) => {
      const remixStep = typographyRemixStepRef.current;
      typographyRemixStepRef.current += 1;
      return generateTypographyRemix({
        ...options,
        salt: typographyRemixSaltRef.current,
        step: remixStep,
      });
    },
    [],
  );

  const remixPalette = useCallback(() => {
    markSourceSyncDirty();
    const remixStep = paletteRemixStepRef.current;
    paletteRemixStepRef.current += 1;
    setValues((current) => {
      const remixBase = paletteRemixBaseRef.current ?? getDesignBrandSeeds(current);
      paletteRemixBaseRef.current = remixBase;
      const remix = generatePaletteRemix(remixBase, {
        salt: paletteRemixSaltRef.current,
        step: remixStep,
      });

      return {
        ...current,
        ...generateBrandDerivationRemix({ step: remixStep }),
        primaryColor: remix.palette.primary,
        secondaryColor: remix.palette.secondary,
        accentColor: remix.palette.accent,
        highlightColor: remix.palette.highlight,
      };
    });
  }, [markSourceSyncDirty]);

  const remixTypography = useCallback(() => {
    markSourceSyncDirty();
    const remix = getNextTypographyRemix();

    setValues((current) => ({
      ...current,
      headlineStyle: remix.headlineStyle,
      typographyDensity: remix.density,
      typographyPairing: remix.pairing,
      typographyPrimaryFont: remix.primaryFont,
      typographyScale: remix.scale,
      typographySecondaryFont: remix.secondaryFont,
      typographyStyle: remix.style,
      typographyTightness: remix.tightness,
      typographyWeight: remix.weight,
    }));
  }, [getNextTypographyRemix, markSourceSyncDirty]);

  const remixLayout = useCallback(() => {
    markSourceSyncDirty();
    const remixStep = layoutRemixStepRef.current;
    layoutRemixStepRef.current += 1;
    const remix = generateLayoutRemix({
      salt: layoutRemixSaltRef.current,
      step: remixStep,
    });

    setValues((current) => ({
      ...current,
      gridDensity: remix.gridDensity,
      heroBalance: remix.heroBalance,
      heroScale: remix.heroScale,
      pageGutter: remix.pageGutter,
      pageWidth: remix.width,
      radius: remix.radius,
      sectionSpacing: remix.spacing,
      textWidth: remix.textWidth,
    }));
  }, [markSourceSyncDirty]);

  const updateTypographyPresetValue = useCallback(
    <Key extends TypographySelectSettingKey>(
      key: Key,
      nextValue: DesignOverlayValues[Key],
    ) => {
      markSourceSyncDirty();
      const remix = generateTypographyRemix({
        [key === "typographyStyle" ? "style" : "pairing"]: nextValue,
        salt: typographyRemixSaltRef.current,
        step: typographyRemixStepRef.current,
      });
      typographyRemixStepRef.current += 1;

      setValues((current) => ({
        ...current,
        headlineStyle: remix.headlineStyle,
        typographyDensity: remix.density,
        typographyPairing: remix.pairing,
        typographyPrimaryFont: remix.primaryFont,
        typographyScale: remix.scale,
        typographySecondaryFont: remix.secondaryFont,
        typographyStyle: remix.style,
        typographyTightness: remix.tightness,
        typographyWeight: remix.weight,
      }));
    },
    [markSourceSyncDirty],
  );

  useEffect(() => {
    const handlePaletteRemixShortcut = (event: KeyboardEvent) => {
      if (!isPaletteRemixShortcut(event)) return;
      event.preventDefault();
      remixPalette();
      remixTypography();
      remixLayout();
    };

    window.addEventListener("keydown", handlePaletteRemixShortcut);
    return () => window.removeEventListener("keydown", handlePaletteRemixShortcut);
  }, [remixLayout, remixPalette, remixTypography]);

  const resetAll = useCallback(() => {
    markSourceSyncDirty();
    setValues({ ...resolvedDefaults });
    setTokenValues({});
    paletteRemixBaseRef.current = null;
    paletteRemixSaltRef.current = getPaletteRemixSalt();
    paletteRemixStepRef.current = 0;
    layoutRemixSaltRef.current = getLayoutRemixSalt();
    layoutRemixStepRef.current = 0;
    typographyRemixSaltRef.current = getTypographyRemixSalt();
    typographyRemixStepRef.current = 0;
  }, [markSourceSyncDirty, resolvedDefaults]);

  const resetDefaultKeys = useCallback(
    (keys: readonly ResetKey[]) => {
      markSourceSyncDirty();
      if (keys === PALETTE_KEYS) {
        paletteRemixBaseRef.current = null;
        paletteRemixSaltRef.current = getPaletteRemixSalt();
        paletteRemixStepRef.current = 0;
      }
      if (keys === LAYOUT_KEYS) {
        layoutRemixSaltRef.current = getLayoutRemixSalt();
        layoutRemixStepRef.current = 0;
      }
      if (keys === TYPOGRAPHY_KEYS) {
        typographyRemixSaltRef.current = getTypographyRemixSalt();
        typographyRemixStepRef.current = 0;
      }
      setValues((current) => {
        const next = { ...current };
        for (const key of keys) {
          Object.assign(next, { [key]: resolvedDefaults[key] });
        }
        return next;
      });
    },
    [markSourceSyncDirty, resolvedDefaults],
  );

  const toggleGroup = useCallback((group: DesignOverlayGroupKey) => {
    setExpandedGroups((current) => ({
      ...current,
      [group]: !current[group],
    }));
  }, []);

  useEffect(() => {
    latestSourceSyncPayloadRef.current = sourceSyncPayload;
  }, [sourceSyncPayload]);

  useEffect(() => {
    if (!sourceSyncAvailable || !sourceSyncDirty) return;
    if (sourceSyncPayload === lastSyncedSourcePayloadRef.current) return;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setSourceSyncState("syncing");
      setSourceSyncMessage("Syncing");

      void fetch("/__brandy/sync/design", {
        body: sourceSyncPayload,
        headers: { "Content-Type": "application/json" },
        method: "POST",
        signal: controller.signal,
      })
        .then(async (response) => {
          const payload = (await response.json().catch(() => ({}))) as {
            error?: string;
          };

          if (!response.ok) {
            throw new Error(payload.error ?? "Unable to sync YAML source.");
          }

          if (
            controller.signal.aborted ||
            latestSourceSyncPayloadRef.current !== sourceSyncPayload
          ) {
            return;
          }

          window.localStorage.removeItem(DESIGN_OVERLAY_STORAGE_KEY);
          window.localStorage.removeItem(DESIGN_TOKEN_STORAGE_KEY);
          lastSyncedSourcePayloadRef.current = sourceSyncPayload;
          setSourceSyncUserEdited(false);
          setSourceSyncState("synced");
          setSourceSyncMessage("");
        })
        .catch((error: unknown) => {
          if (
            controller.signal.aborted ||
            latestSourceSyncPayloadRef.current !== sourceSyncPayload
          ) {
            return;
          }

          if (isNetworkSyncError(error)) {
            setSourceSyncState("idle");
            setSourceSyncMessage("");
            return;
          }

          setSourceSyncUserEdited(false);
          setSourceSyncState("error");
          setSourceSyncMessage(
            error instanceof Error ? error.message : "Unable to sync YAML source.",
          );
        });
    }, SOURCE_SYNC_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [sourceSyncAvailable, sourceSyncDirty, sourceSyncPayload]);

  const overlayClassName = className
    ? `design-overlay ${className}`
    : "design-overlay";

  const renderSliderControl = ({
    endLabel,
    key,
    label,
    max,
    min,
    startLabel,
    step,
    suffix,
  }: SliderControlConfig) => (
    <SliderControl
      key={key}
      id={`${baseId}-${key}`}
      label={label}
      value={values[key]}
      min={min}
      max={max}
      step={step}
      suffix={suffix}
      startLabel={startLabel}
      endLabel={endLabel}
      onChange={(value) => updateControlValue(key, value)}
    />
  );
  const renderSegmentedControl = <Key extends SelectSettingKey>({
    key,
    label,
    options,
  }: SegmentedControlConfig<Key>) => (
    <SegmentedControl
      key={key}
      id={`${baseId}-${key}`}
      label={label}
      value={values[key]}
      options={options}
      onChange={(value) => updateControlValue(key, value)}
    />
  );
  const renderSelectControl = <Key extends SelectSettingKey>({
    key,
    label,
    options,
  }: SelectControlConfig<Key>) => {
    const handleChange =
      key === "typographyStyle" || key === "typographyPairing"
        ? (value: DesignOverlayValues[Key]) =>
            updateTypographyPresetValue(
              key,
              value as DesignOverlayValues[TypographySelectSettingKey],
            )
        : (value: DesignOverlayValues[Key]) => updateControlValue(key, value);

    return (
      <SelectControl
        key={key}
        id={`${baseId}-${key}`}
        label={label}
        value={values[key]}
        options={options}
        onChange={handleChange}
      />
    );
  };
  const renderToggleControl = ({ key, label }: ToggleControlConfig) => (
    <ToggleControl
      key={key}
      id={`${baseId}-${key}`}
      label={label}
      checked={values[key]}
      onChange={(checked) => updateValue(key, checked)}
    />
  );
  return (
    <div className={overlayClassName}>
      {open ? (
        <button
          type="button"
          className="design-overlay__scrim"
          aria-label="Close design settings"
          onClick={closePanel}
        />
      ) : null}

      <button
        ref={triggerButtonRef}
        type="button"
        className="design-overlay__trigger"
        aria-controls={panelId}
        aria-expanded={open}
        aria-label={open ? "Close design settings" : "Open design settings"}
        tabIndex={open ? -1 : undefined}
        onClick={() => setOpen((current) => !current)}
      >
        <Settings aria-hidden="true" />
      </button>

      {open ? (
        <aside
          ref={panelRef}
          id={panelId}
          className="design-overlay__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
          onKeyDown={trapPanelFocus}
        >
          <header className="design-overlay__header">
            <div>
              <h2 id={headingId}>{title}</h2>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              className="design-overlay__icon-button"
              aria-label="Close design settings"
              onClick={closePanel}
            >
              <X aria-hidden="true" />
            </button>
          </header>

          <div className="design-overlay__content">
            <CollapsibleGroup
              id={`${baseId}-palette`}
              title="Palette"
              icon={<Palette aria-hidden="true" />}
              open={expandedGroups.palette}
              onToggle={() => toggleGroup("palette")}
              onReset={() => resetDefaultKeys(PALETTE_KEYS)}
              actions={
                <button
                  type="button"
                  className="design-overlay__group-action"
                  aria-label="Remix palette"
                  onClick={remixPalette}
                >
                  <Shuffle aria-hidden="true" />
                </button>
              }
            >
              <ColorControl
                id={`${baseId}-primary-color`}
                label="Primary"
                value={values.primaryColor}
                onChange={(value) => updateBrandColorValue("primaryColor", value)}
              />
              <ColorControl
                id={`${baseId}-secondary-color`}
                label="Secondary"
                value={values.secondaryColor}
                onChange={(value) => updateBrandColorValue("secondaryColor", value)}
              />
              <ColorControl
                id={`${baseId}-accent-color`}
                label="Accent"
                value={values.accentColor}
                onChange={(value) => updateBrandColorValue("accentColor", value)}
              />
              <ColorControl
                id={`${baseId}-highlight-color`}
                label="Highlight"
                value={values.highlightColor}
                onChange={(value) => updateBrandColorValue("highlightColor", value)}
              />
              <ToggleControl
                id={`${baseId}-dark-mode`}
                label="Dark mode"
                checked={values.darkMode}
                onChange={(checked) => updatePreviewValue("darkMode", checked)}
              />
              {MODE_TOGGLES.map(renderToggleControl)}
              <DerivedColorPreview
                activeColorId={activeDerivedColor}
                colors={DERIVED_COLOR_CONTROLS.map((control) => ({
                  id: control.id,
                  label: control.label,
                  value: derivedPaletteValues[control.token],
                  adjustment: {
                    id: `${baseId}-${control.id}-distance`,
                    label: `${control.label} distance`,
                    sourceLabel: control.sourceLabel,
                    value: values[control.key],
                    onChange: (value) => updateValue(control.key, value),
                  },
                }))}
                onColorSelect={(id) =>
                  setActiveDerivedColor((current) =>
                    current === id ? null : (id as DerivedColorControlId),
                  )
                }
              />
            </CollapsibleGroup>

            <CollapsibleGroup
              id={`${baseId}-typography`}
              title="Typography"
              icon={<Type aria-hidden="true" />}
              open={expandedGroups.typography}
              onToggle={() => toggleGroup("typography")}
              onReset={() => resetDefaultKeys(TYPOGRAPHY_KEYS)}
              actions={
                <button
                  type="button"
                  className="design-overlay__group-action"
                  aria-label="Remix typography"
                  onClick={remixTypography}
                >
                  <Shuffle aria-hidden="true" />
                </button>
              }
            >
              {TYPOGRAPHY_SELECT_CONTROLS.map(renderSelectControl)}
              {TYPOGRAPHY_SLIDERS.map(renderSliderControl)}
            </CollapsibleGroup>

            <CollapsibleGroup
              id={`${baseId}-layout`}
              title="Layout"
              icon={<SlidersHorizontal aria-hidden="true" />}
              open={expandedGroups.layout}
              onToggle={() => toggleGroup("layout")}
              onReset={() => resetDefaultKeys(LAYOUT_KEYS)}
              actions={
                <button
                  type="button"
                  className="design-overlay__group-action"
                  aria-label="Remix layout"
                  onClick={remixLayout}
                >
                  <Shuffle aria-hidden="true" />
                </button>
              }
            >
              {LAYOUT_SEGMENTED_CONTROLS.map(renderSegmentedControl)}
              {LAYOUT_SLIDERS.map(renderSliderControl)}
            </CollapsibleGroup>
          </div>

          <footer className="design-overlay__footer">
            <button
              type="button"
              className="design-overlay__reset-all"
              disabled={!isDirty}
              onClick={resetAll}
            >
              <RotateCcw aria-hidden="true" />
              Reset design
            </button>
            {sourceSyncMessage ? (
              <p
                className="design-overlay__source-status"
                data-state={sourceSyncState}
                role="status"
              >
                {sourceSyncMessage}
              </p>
            ) : null}
          </footer>
        </aside>
      ) : null}
    </div>
  );
}

interface CollapsibleGroupProps {
  actions?: ReactNode;
  children: ReactNode;
  icon: ReactNode;
  id: string;
  onReset: () => void;
  onToggle: () => void;
  open: boolean;
  title: string;
}

function CollapsibleGroup({
  actions,
  children,
  icon,
  id,
  onReset,
  onToggle,
  open,
  title,
}: CollapsibleGroupProps) {
  const contentId = `${id}-content`;

  return (
    <section className="design-overlay__group">
      <div className="design-overlay__group-header">
        <button
          type="button"
          className="design-overlay__group-toggle"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={onToggle}
        >
          <span className="design-overlay__group-icon">{icon}</span>
          <span>{title}</span>
          <ChevronDown aria-hidden="true" />
        </button>
        <div className="design-overlay__group-actions">
          {actions}
          <button
            type="button"
            className="design-overlay__group-reset"
            aria-label={`Reset ${title}`}
            onClick={onReset}
          >
            <RotateCcw aria-hidden="true" />
          </button>
        </div>
      </div>
      <div id={contentId} className="design-overlay__group-content" hidden={!open}>
        {open ? children : null}
      </div>
    </section>
  );
}

function isNetworkSyncError(error: unknown): boolean {
  if (!(error instanceof TypeError)) return false;
  return /fetch|network/i.test(error.message);
}

function isDarkModeShortcut(event: KeyboardEvent): boolean {
  if (event.metaKey || event.ctrlKey || event.altKey) return false;
  if (event.key.toLowerCase() !== "d") return false;

  const target = event.target;
  if (!(target instanceof HTMLElement)) return true;
  if (target.isContentEditable) return false;

  return !target.closest("input, select, textarea");
}

function isPaletteRemixShortcut(event: KeyboardEvent): boolean {
  if (event.key !== " " && event.key !== "Spacebar") return false;
  if (event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) return false;

  const target = event.target;
  if (!(target instanceof HTMLElement)) return true;
  if (target.isContentEditable) return false;
  if (target.closest(".design-overlay")) return false;

  return !target.closest("input, select, textarea");
}

function getPaletteRemixSalt(): number {
  return Math.floor(Math.random() * PALETTE_REMIX_SALT_RANGE);
}

function getLayoutRemixSalt(): number {
  return Math.floor(Math.random() * LAYOUT_REMIX_SALT_RANGE);
}

function getTypographyRemixSalt(): number {
  return Math.floor(Math.random() * TYPOGRAPHY_REMIX_SALT_RANGE);
}
