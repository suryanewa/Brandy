import {
  Accessibility,
  ChevronDown,
  Palette,
  RotateCcw,
  Settings,
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
import { BRAND_GENERATED_TOKEN_NAMES } from "../../lib/brandTheme.mjs";
import { LAYOUT_GENERATED_TOKEN_NAMES } from "../../lib/layoutTheme.mjs";
import { TYPOGRAPHY_GENERATED_TOKEN_NAMES } from "../../lib/typographyTheme.mjs";
import {
  ACCENT_PRESETS,
  DEFAULT_DESIGN_OVERLAY_VALUES,
  DESIGN_CSS_VARIABLE_NAMES,
  DESIGN_OVERLAY_STORAGE_KEY,
  HIGHLIGHT_PRESETS,
  PRIMARY_PRESETS,
  SECONDARY_PRESETS,
  areDesignValuesEqual,
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
  SegmentedControl,
  SliderControl,
  SwatchStrip,
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
  | "sectionSpacing"
  | "radius"
  | "pageGutter"
  | "heroBalance"
  | "textWidth"
  | "typographyScale"
  | "typographyDensity"
  | "typographyWeight"
  | "headlineStyle"
  | "typographyTightness";
type LayoutSelectSettingKey = "gridDensity" | "heroScale" | "pageWidth";
type TypographySelectSettingKey = "typographyPairing" | "typographyStyle";
type SelectSettingKey = LayoutSelectSettingKey | TypographySelectSettingKey;
type BooleanSettingKey = "mutedMode" | "highContrast";
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
    label: "Hero balance",
    min: 35,
    max: 65,
    startLabel: "Text-heavy",
    endLabel: "Visual-forward",
    step: 1,
  },
  {
    key: "textWidth",
    label: "Text width",
    min: 28,
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
    label: "Hero",
    options: [
      { label: "Compact", value: "compact" },
      { label: "Balanced", value: "balanced" },
      { label: "Immersive", value: "immersive" },
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
const TYPOGRAPHY_SEGMENTED_CONTROLS = [
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
] as const satisfies readonly SegmentedControlConfig<TypographySelectSettingKey>[];
const MODE_TOGGLES: readonly ToggleControlConfig[] = [
  { key: "mutedMode", label: "Muted mode" },
  { key: "highContrast", label: "High contrast" },
];
const PALETTE_KEYS = [
  "primaryColor",
  "secondaryColor",
  "accentColor",
  "highlightColor",
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
  "typographyScale",
  "typographyDensity",
  "typographyWeight",
  "headlineStyle",
  "typographyTightness",
] as const satisfies readonly ResetKey[];
const MODE_KEYS = [
  "mutedMode",
  "highContrast",
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

  const resetAll = useCallback(() => {
    markSourceSyncDirty();
    setValues({ ...resolvedDefaults });
    setTokenValues({});
  }, [markSourceSyncDirty, resolvedDefaults]);

  const resetDefaultKeys = useCallback(
    (keys: readonly ResetKey[]) => {
      markSourceSyncDirty();
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
      onChange={(value) => updateValue(key, value)}
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
      onChange={(value) => updateValue(key, value)}
    />
  );
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
            >
              <ColorControl
                id={`${baseId}-primary-color`}
                label="Primary"
                value={values.primaryColor}
                onChange={(value) => updateValue("primaryColor", value)}
              />
              <SwatchStrip
                label="Primary presets"
                colors={PRIMARY_PRESETS}
                selectedColor={values.primaryColor}
                onSelect={(value) => updateValue("primaryColor", value)}
              />
              <ColorControl
                id={`${baseId}-secondary-color`}
                label="Secondary"
                value={values.secondaryColor}
                onChange={(value) => updateValue("secondaryColor", value)}
              />
              <SwatchStrip
                label="Secondary presets"
                colors={SECONDARY_PRESETS}
                selectedColor={values.secondaryColor}
                onSelect={(value) => updateValue("secondaryColor", value)}
              />
              <ColorControl
                id={`${baseId}-accent-color`}
                label="Accent"
                value={values.accentColor}
                onChange={(value) => updateValue("accentColor", value)}
              />
              <SwatchStrip
                label="Accent presets"
                colors={ACCENT_PRESETS}
                selectedColor={values.accentColor}
                onSelect={(value) => updateValue("accentColor", value)}
              />
              <ColorControl
                id={`${baseId}-highlight-color`}
                label="Highlight"
                value={values.highlightColor}
                onChange={(value) => updateValue("highlightColor", value)}
              />
              <SwatchStrip
                label="Highlight presets"
                colors={HIGHLIGHT_PRESETS}
                selectedColor={values.highlightColor}
                onSelect={(value) => updateValue("highlightColor", value)}
              />
              <DerivedColorPreview
                colors={[
                  {
                    label: "Primary hover",
                    value: derivedPaletteValues["--button-primary-hover"],
                  },
                  {
                    label: "Secondary surface",
                    value: derivedPaletteValues["--button-secondary-bg"],
                  },
                  {
                    label: "Accent moment",
                    value: derivedPaletteValues["--gradient-hero-accent"],
                  },
                  {
                    label: "Highlight soft",
                    value: derivedPaletteValues["--color-highlight-soft"],
                  },
                  {
                    label: "Neutral surface",
                    value: derivedPaletteValues["--color-surface"],
                  },
                  {
                    label: "Readable text",
                    value: derivedPaletteValues["--color-text"],
                  },
                ]}
              />
            </CollapsibleGroup>

            <CollapsibleGroup
              id={`${baseId}-layout`}
              title="Layout"
              icon={<SlidersHorizontal aria-hidden="true" />}
              open={expandedGroups.layout}
              onToggle={() => toggleGroup("layout")}
              onReset={() => resetDefaultKeys(LAYOUT_KEYS)}
            >
              {LAYOUT_SEGMENTED_CONTROLS.map(renderSegmentedControl)}
              {LAYOUT_SLIDERS.map(renderSliderControl)}
            </CollapsibleGroup>

            <CollapsibleGroup
              id={`${baseId}-typography`}
              title="Typography"
              icon={<Type aria-hidden="true" />}
              open={expandedGroups.typography}
              onToggle={() => toggleGroup("typography")}
              onReset={() => resetDefaultKeys(TYPOGRAPHY_KEYS)}
            >
              {TYPOGRAPHY_SEGMENTED_CONTROLS.map(renderSegmentedControl)}
              {TYPOGRAPHY_SLIDERS.map(renderSliderControl)}
            </CollapsibleGroup>

            <CollapsibleGroup
              id={`${baseId}-modes`}
              title="Mode preview"
              icon={<Accessibility aria-hidden="true" />}
              open={expandedGroups.modes}
              onToggle={() => toggleGroup("modes")}
              onReset={() => resetDefaultKeys(MODE_KEYS)}
            >
              {MODE_TOGGLES.map(renderToggleControl)}
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
  children: ReactNode;
  icon: ReactNode;
  id: string;
  onReset: () => void;
  onToggle: () => void;
  open: boolean;
  title: string;
}

function CollapsibleGroup({
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
        <button
          type="button"
          className="design-overlay__group-reset"
          aria-label={`Reset ${title}`}
          onClick={onReset}
        >
          <RotateCcw aria-hidden="true" />
        </button>
      </div>
      <div id={contentId} className="design-overlay__group-content" hidden={!open}>
        {open ? children : null}
      </div>
    </section>
  );
}
