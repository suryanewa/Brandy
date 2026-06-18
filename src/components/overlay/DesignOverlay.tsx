import {
  Accessibility,
  ChevronDown,
  Gauge,
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
import {
  ACCENT_PRESETS,
  BRAND_PRESETS,
  DEFAULT_DESIGN_OVERLAY_VALUES,
  DESIGN_CSS_VARIABLE_NAMES,
  DESIGN_OVERLAY_STORAGE_KEY,
  areDesignValuesEqual,
  getDesignCssVariables,
  persistDesignValueDiff,
  readStoredDesignValues,
  type DesignCssVariableName,
  type DesignOverlayGroupKey,
  type DesignOverlayValues,
} from "./designOverlayModel";
import {
  ColorControl,
  DerivedColorPreview,
  SliderControl,
  SwatchStrip,
  ToggleControl,
} from "./DesignOverlayControls";
import { DesignTokenControlRow, DesignTokenEditor } from "./DesignTokenEditor";
import {
  DESIGN_TOKEN_CONTROLS,
  DESIGN_TOKEN_CSS_VARIABLE_NAMES,
  DESIGN_TOKEN_STORAGE_KEY,
  getDesignTokenControlValue,
  getDesignTokenCssVariables,
  persistDesignTokenValueDiff,
  readStoredDesignTokenValues,
  type DesignTokenGroupKey,
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
type ColorSettingKey =
  | "brandColor"
  | "accentColor"
  | "backgroundColor"
  | "surfaceColor"
  | "surfaceRaisedColor"
  | "textColor";
type NumberSettingKey =
  | "sectionSpacing"
  | "radius"
  | "typeScale"
  | "elevation"
  | "containerWidth"
  | "animationDuration"
  | "navbarBlur"
  | "browserHeight"
  | "demoHeight"
  | "browserChromeHeight";
type BooleanSettingKey = "mutedMode" | "highContrast" | "reducedMotion";
type PaletteBooleanSettingKey = "autoColorVariants";
type ResetKey = keyof DesignOverlayValues;
type ColorControlConfig = { key: ColorSettingKey; label: string };
type SliderControlConfig = {
  key: NumberSettingKey;
  label: string;
  max: number;
  min: number;
  step: number;
  suffix?: string;
};
type ToggleControlConfig = { key: BooleanSettingKey; label: string };
type PaletteToggleControlConfig = {
  key: PaletteBooleanSettingKey;
  label: string;
};

const SURFACE_VARIANT_CONTROLS: readonly ColorControlConfig[] = [
  { key: "textColor", label: "Text" },
  { key: "surfaceColor", label: "Surface" },
  { key: "surfaceRaisedColor", label: "Raised" },
];
const BASE_SURFACE_COLOR_CONTROLS: readonly ColorControlConfig[] = [
  { key: "backgroundColor", label: "Page" },
];
const PALETTE_TOGGLES: readonly PaletteToggleControlConfig[] = [
  { key: "autoColorVariants", label: "Auto variants" },
];
const LAYOUT_SLIDERS: readonly SliderControlConfig[] = [
  { key: "sectionSpacing", label: "Section spacing", min: 70, max: 145, step: 5, suffix: "%" },
  { key: "radius", label: "Radii", min: 2, max: 20, step: 1, suffix: "px" },
];
const TYPOGRAPHY_SLIDERS: readonly SliderControlConfig[] = [
  { key: "typeScale", label: "Type scale", min: 85, max: 118, step: 1, suffix: "%" },
];
const MOTION_SLIDERS: readonly SliderControlConfig[] = [
  { key: "animationDuration", label: "Duration", min: 80, max: 800, step: 20, suffix: "ms" },
];
const MODE_TOGGLES: readonly ToggleControlConfig[] = [
  { key: "mutedMode", label: "Muted mode" },
  { key: "highContrast", label: "High contrast" },
];
const PALETTE_TOKEN_SECTIONS = [
  {
    ariaLabel: "Palette token values",
    groups: ["base", "semantic"],
    resetLabel: "Reset Palette tokens",
    title: "Token values",
  },
] as const satisfies readonly {
  ariaLabel: string;
  groups: readonly DesignTokenGroupKey[];
  resetLabel: string;
  title: string;
}[];
const LAYOUT_TOKEN_SECTIONS = [
  {
    groups: ["layout"],
    resetLabel: "Reset Layout tokens",
    title: "Token values",
  },
] as const satisfies readonly {
  groups: readonly DesignTokenGroupKey[];
  resetLabel: string;
  title: string;
}[];
const TYPOGRAPHY_TOKEN_SECTIONS = [
  {
    groups: ["typography"],
    resetLabel: "Reset Typography tokens",
    title: "Token values",
  },
] as const satisfies readonly {
  groups: readonly DesignTokenGroupKey[];
  resetLabel: string;
  title: string;
}[];

const PALETTE_KEYS = [
  "autoColorVariants",
  "brandColor",
  "accentColor",
  "backgroundColor",
  "surfaceColor",
  "surfaceRaisedColor",
  "textColor",
] as const satisfies readonly ResetKey[];
const LAYOUT_KEYS = [
  "sectionSpacing",
  "radius",
] as const satisfies readonly ResetKey[];
const TYPOGRAPHY_KEYS = ["typeScale"] as const satisfies readonly ResetKey[];
const MOTION_KEYS = [
  "animationDuration",
  "reducedMotion",
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
  const isDirty = !areDesignValuesEqual(values, resolvedDefaults) || tokenIsDirty;
  const sourceSyncValues = useMemo<DesignTokenValueMap>(() => {
    const next: DesignTokenValueMap = {};

    if (!areDesignValuesEqual(values, resolvedDefaults)) {
      Object.assign(next, getDesignCssVariables(values));
    }

    Object.assign(next, tokenValues);
    return next;
  }, [resolvedDefaults, tokenValues, values]);
  const derivedPaletteValues = useMemo(() => getDesignCssVariables(values), [values]);
  const sourceSyncDirty = Object.keys(sourceSyncValues).length > 0;
  const sourceSyncAvailable = import.meta.env.DEV;
  const sourceSyncPayload = useMemo(
    () => JSON.stringify({ reload: false, values: sourceSyncValues }),
    [sourceSyncValues],
  );
  const paletteTokenControls = useMemo(
    () =>
      PALETTE_TOKEN_SECTIONS.map((section) => ({
        ...section,
        controls: DESIGN_TOKEN_CONTROLS.filter(
          (control) => section.groups.some((group) => group === control.group),
        ),
      })),
    [],
  );
  const layoutTokenControls = useMemo(
    () =>
      LAYOUT_TOKEN_SECTIONS.map((section) => ({
        ...section,
        controls: DESIGN_TOKEN_CONTROLS.filter(
          (control) => section.groups.some((group) => group === control.group),
        ),
      })),
    [],
  );
  const typographyTokenControls = useMemo(
    () =>
      TYPOGRAPHY_TOKEN_SECTIONS.map((section) => ({
        ...section,
        controls: DESIGN_TOKEN_CONTROLS.filter(
          (control) => section.groups.some((group) => group === control.group),
        ),
      })),
    [],
  );

  const markSourceSyncDirty = useCallback(() => {
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

  const updateTokenValue = useCallback(
    (variable: DesignTokenVariableName, nextValue: string) => {
      markSourceSyncDirty();
      setTokenValues((current) => {
        const next = { ...current };
        if (!nextValue.trim()) {
          delete next[variable];
          return next;
        }

        next[variable] = nextValue.trim();
        return next;
      });
    },
    [markSourceSyncDirty],
  );

  const resetTokenValue = useCallback((variable: DesignTokenVariableName) => {
    markSourceSyncDirty();
    setTokenValues((current) => {
      const next = { ...current };
      delete next[variable];
      return next;
    });
  }, [markSourceSyncDirty]);

  const resetTokenGroup = useCallback((group: DesignTokenGroupKey) => {
    markSourceSyncDirty();
    setTokenValues((current) => {
      const next = { ...current };
      for (const control of DESIGN_TOKEN_CONTROLS) {
        if (control.group === group && control.variable in next) {
          delete next[control.variable];
        }
      }
      return next;
    });
  }, [markSourceSyncDirty]);

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

  const renderColorControl = ({ key, label }: ColorControlConfig) => (
    <ColorControl
      key={key}
      id={`${baseId}-${key}`}
      label={label}
      value={values[key]}
      onChange={(value) => updateValue(key, value)}
    />
  );
  const renderSliderControl = ({
    key,
    label,
    max,
    min,
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
  const renderPaletteToggleControl = ({
    key,
    label,
  }: PaletteToggleControlConfig) => (
    <ToggleControl
      key={key}
      id={`${baseId}-${key}`}
      label={label}
      checked={values[key]}
      onChange={(checked) => updateValue(key, checked)}
    />
  );
  const renderEmbeddedTokenSections = (
    sections: readonly {
      ariaLabel?: string;
      controls: readonly (typeof DESIGN_TOKEN_CONTROLS)[number][];
      groups: readonly DesignTokenGroupKey[];
      resetLabel?: string;
      title: string;
    }[],
  ) => (
    <div className="design-overlay__embedded-token-sections">
      {sections.map((section) => (
        <section
          key={section.ariaLabel ?? section.title}
          className="design-overlay__embedded-token-section"
          aria-label={section.ariaLabel ?? section.title}
        >
          <div className="design-overlay__embedded-token-header">
            <span>{section.title}</span>
            <button
              type="button"
              className="design-overlay__group-reset"
              aria-label={section.resetLabel ?? `Reset ${section.title}`}
              disabled={!section.controls.some(
                (control) => tokenValues[control.variable] != null,
              )}
              onClick={() => {
                for (const group of section.groups) {
                  resetTokenGroup(group);
                }
              }}
            >
              <RotateCcw aria-hidden="true" />
            </button>
          </div>
          <div className="design-overlay__embedded-token-list">
            {section.controls.map((control) => (
              <DesignTokenControlRow
                key={control.variable}
                control={control}
                value={getDesignTokenControlValue(control, tokenValues)}
                changed={tokenValues[control.variable] != null}
                onChange={updateTokenValue}
                onReset={resetTokenValue}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
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
            <DesignTokenEditor
              values={tokenValues}
              onChange={updateTokenValue}
              onResetGroup={resetTokenGroup}
              onResetVariable={resetTokenValue}
            />

            <CollapsibleGroup
              id={`${baseId}-palette`}
              title="Palette"
              icon={<Palette aria-hidden="true" />}
              open={expandedGroups.palette}
              onToggle={() => toggleGroup("palette")}
              onReset={() => resetDefaultKeys(PALETTE_KEYS)}
            >
              <ColorControl
                id={`${baseId}-brand-color`}
                label="Brand"
                value={values.brandColor}
                onChange={(value) => updateValue("brandColor", value)}
              />
              <SwatchStrip
                label="Brand presets"
                colors={BRAND_PRESETS}
                selectedColor={values.brandColor}
                onSelect={(value) => updateValue("brandColor", value)}
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
              {PALETTE_TOGGLES.map(renderPaletteToggleControl)}
              {BASE_SURFACE_COLOR_CONTROLS.map(renderColorControl)}
              {values.autoColorVariants ? (
                <DerivedColorPreview
                  colors={[
                    {
                      label: "Accent hover",
                      value: derivedPaletteValues["--color-accent-hover"],
                    },
                    {
                      label: "Accent soft",
                      value: derivedPaletteValues["--color-accent-soft"],
                    },
                    {
                      label: "Brand soft",
                      value: derivedPaletteValues["--color-blue-soft"],
                    },
                    {
                      label: "Surface",
                      value: derivedPaletteValues["--color-surface"],
                    },
                    {
                      label: "Text",
                      value: derivedPaletteValues["--color-text"],
                    },
                  ]}
                />
              ) : (
                SURFACE_VARIANT_CONTROLS.map(renderColorControl)
              )}
              {renderEmbeddedTokenSections(paletteTokenControls)}
            </CollapsibleGroup>

            <CollapsibleGroup
              id={`${baseId}-layout`}
              title="Layout"
              icon={<SlidersHorizontal aria-hidden="true" />}
              open={expandedGroups.layout}
              onToggle={() => toggleGroup("layout")}
              onReset={() => resetDefaultKeys(LAYOUT_KEYS)}
            >
              {LAYOUT_SLIDERS.map(renderSliderControl)}
              {renderEmbeddedTokenSections(layoutTokenControls)}
            </CollapsibleGroup>

            <CollapsibleGroup
              id={`${baseId}-typography`}
              title="Typography"
              icon={<Type aria-hidden="true" />}
              open={expandedGroups.typography}
              onToggle={() => toggleGroup("typography")}
              onReset={() => resetDefaultKeys(TYPOGRAPHY_KEYS)}
            >
              {TYPOGRAPHY_SLIDERS.map(renderSliderControl)}
              {renderEmbeddedTokenSections(typographyTokenControls)}
            </CollapsibleGroup>

            <CollapsibleGroup
              id={`${baseId}-motion`}
              title="Motion"
              icon={<Gauge aria-hidden="true" />}
              open={expandedGroups.motion}
              onToggle={() => toggleGroup("motion")}
              onReset={() => resetDefaultKeys(MOTION_KEYS)}
            >
              {MOTION_SLIDERS.map(renderSliderControl)}
              <ToggleControl
                id={`${baseId}-reduced-motion`}
                label="Reduced motion preview"
                checked={values.reducedMotion}
                onChange={(checked) => updateValue("reducedMotion", checked)}
              />
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
