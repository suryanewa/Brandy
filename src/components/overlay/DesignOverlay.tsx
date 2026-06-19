import {
  Palette,
  RotateCcw,
  Settings,
  Shapes,
  Shuffle,
  SlidersHorizontal,
  Type,
  X,
} from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
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
  LOCKUP_GENERATED_TOKEN_NAMES,
  generateLockupRemix,
} from "../../lib/lockupTheme.mjs";
import {
  TYPOGRAPHY_GENERATED_TOKEN_NAMES,
  generateTypographyRemix,
} from "../../lib/typographyTheme.mjs";
import {
  DEFAULT_DESIGN_OVERLAY_VALUES,
  DESIGN_CSS_VARIABLE_NAMES,
  DESIGN_OVERLAY_STORAGE_KEY,
  DESIGN_VALUES_CHANGE_EVENT,
  areDesignValuesEqual,
  getDesignBrandDerivation,
  getDesignBrandSeeds,
  getDesignCssVariables,
  getDesignLayoutSeeds,
  getDesignLockupSeeds,
  getDesignTypographySeeds,
  persistDesignValueDiff,
  readStoredDesignValues,
  type DesignCssVariableName,
  type DesignOverlayGroupKey,
  type DesignOverlayValues,
} from "./designOverlayModel";
import {
  DERIVED_COLOR_CONTROLS,
  INITIAL_GROUP_STATE,
  LAYOUT_KEYS,
  LAYOUT_SEGMENTED_CONTROLS,
  LAYOUT_SLIDERS,
  LOCKUP_KEYS,
  LOCKUP_SELECT_CONTROLS,
  LOCKUP_SLIDERS,
  PALETTE_COLOR_KEYS,
  PALETTE_KEYS,
  TYPOGRAPHY_KEYS,
  TYPOGRAPHY_SELECT_CONTROLS,
  TYPOGRAPHY_SLIDERS,
  type DerivedColorControlId,
  type ResetKey,
  type SelectControlConfig,
  type SelectSettingKey,
  type SegmentedControlConfig,
  type SliderControlConfig,
  type TypographySelectSettingKey,
} from "./designOverlayControlConfig";
import {
  SelectControl,
  SegmentedControl,
  SliderControl,
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
import { CollapsibleGroup, ParameterActions } from "./DesignOverlayGroups";
import { DesignOverlayPaletteControls } from "./DesignOverlayPaletteControls";
import {
  applyDesignValuesPatch,
  getLayoutRemixPatch,
  getLayoutRemixSalt,
  getLockupRemixPatch,
  getLockupRemixSalt,
  getPaletteRemixSalt,
  getTypographyRemixPatch,
  getTypographyRemixSalt,
  getUnlockedPatch,
  isDarkModeShortcut,
  isNetworkSyncError,
  isPaletteRemixShortcut,
  type DesignValuesPatch,
} from "./designOverlayRemix";

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
  ...LOCKUP_GENERATED_TOKEN_NAMES,
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
  const paletteRemixBaseRef = useRef<ReturnType<typeof getDesignBrandSeeds> | null>(
    null,
  );
  const paletteRemixSaltRef = useRef(getPaletteRemixSalt());
  const paletteRemixStepRef = useRef(0);
  const layoutRemixSaltRef = useRef(getLayoutRemixSalt());
  const layoutRemixStepRef = useRef(0);
  const lockupRemixSaltRef = useRef(getLockupRemixSalt());
  const lockupRemixStepRef = useRef(0);
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
  const [lockedKeys, setLockedKeys] = useState<ReadonlySet<ResetKey>>(
    () => new Set(),
  );

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
    window.dispatchEvent(
      new CustomEvent<DesignOverlayValues>(DESIGN_VALUES_CHANGE_EVENT, {
        detail: values,
      }),
    );
  }, [values]);

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
        lockup: getDesignLockupSeeds(values),
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
      if ((LOCKUP_KEYS as readonly ResetKey[]).includes(key)) {
        lockupRemixSaltRef.current = getLockupRemixSalt();
        lockupRemixStepRef.current = 0;
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

  const toggleSettingLock = useCallback((key: ResetKey) => {
    setLockedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const getNextPaletteRemixPatch = useCallback(
    (current: DesignOverlayValues): DesignValuesPatch => {
      const remixStep = paletteRemixStepRef.current;
      paletteRemixStepRef.current += 1;
      const remixBase = paletteRemixBaseRef.current ?? getDesignBrandSeeds(current);
      paletteRemixBaseRef.current = remixBase;
      const remix = generatePaletteRemix(remixBase, {
        salt: paletteRemixSaltRef.current,
        step: remixStep,
      });

      return {
        ...generateBrandDerivationRemix({ step: remixStep }),
        primaryColor: remix.palette.primary,
        secondaryColor: remix.palette.secondary,
        accentColor: remix.palette.accent,
        highlightColor: remix.palette.highlight,
      };
    },
    [],
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
    setValues((current) => {
      const patch = getUnlockedPatch(getNextPaletteRemixPatch(current), lockedKeys);
      return applyDesignValuesPatch(current, patch);
    });
  }, [getNextPaletteRemixPatch, lockedKeys, markSourceSyncDirty]);

  const remixTypography = useCallback(() => {
    markSourceSyncDirty();
    const patch = getUnlockedPatch(
      getTypographyRemixPatch(getNextTypographyRemix()),
      lockedKeys,
    );

    setValues((current) => applyDesignValuesPatch(current, patch));
  }, [getNextTypographyRemix, lockedKeys, markSourceSyncDirty]);

  const remixLayout = useCallback(() => {
    markSourceSyncDirty();
    const remixStep = layoutRemixStepRef.current;
    layoutRemixStepRef.current += 1;
    const remix = generateLayoutRemix({
      salt: layoutRemixSaltRef.current,
      step: remixStep,
    });

    const patch = getUnlockedPatch(getLayoutRemixPatch(remix), lockedKeys);

    setValues((current) => applyDesignValuesPatch(current, patch));
  }, [lockedKeys, markSourceSyncDirty]);

  const remixLockup = useCallback(() => {
    markSourceSyncDirty();
    const remixStep = lockupRemixStepRef.current;
    lockupRemixStepRef.current += 1;
    const remix = generateLockupRemix({
      salt: lockupRemixSaltRef.current,
      step: remixStep,
    });

    const patch = getUnlockedPatch(getLockupRemixPatch(remix), lockedKeys);

    setValues((current) => applyDesignValuesPatch(current, patch));
  }, [lockedKeys, markSourceSyncDirty]);

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
      remixLockup();
    };

    window.addEventListener("keydown", handlePaletteRemixShortcut);
    return () => window.removeEventListener("keydown", handlePaletteRemixShortcut);
  }, [remixLayout, remixLockup, remixPalette, remixTypography]);

  const resetAll = useCallback(() => {
    markSourceSyncDirty();
    setValues({ ...resolvedDefaults });
    setTokenValues({});
    paletteRemixBaseRef.current = null;
    paletteRemixSaltRef.current = getPaletteRemixSalt();
    paletteRemixStepRef.current = 0;
    layoutRemixSaltRef.current = getLayoutRemixSalt();
    layoutRemixStepRef.current = 0;
    lockupRemixSaltRef.current = getLockupRemixSalt();
    lockupRemixStepRef.current = 0;
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
      if (keys === LOCKUP_KEYS) {
        lockupRemixSaltRef.current = getLockupRemixSalt();
        lockupRemixStepRef.current = 0;
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

  const resetSetting = useCallback(
    (key: ResetKey) => {
      const patch: DesignValuesPatch = {};
      Object.assign(patch, { [key]: resolvedDefaults[key] });
      markSourceSyncDirty();
      setValues((current) => applyDesignValuesPatch(current, patch));
    },
    [markSourceSyncDirty, resolvedDefaults],
  );

  const remixSetting = useCallback(
    (key: ResetKey) => {
      if (lockedKeys.has(key)) return;

      markSourceSyncDirty();
      setValues((current) => {
        let patch: DesignValuesPatch = {};

        if ((PALETTE_COLOR_KEYS as readonly ResetKey[]).includes(key)) {
          patch = getNextPaletteRemixPatch(current);
        } else if ((DERIVED_COLOR_CONTROLS as readonly { key: ResetKey }[]).some(
          (control) => control.key === key,
        )) {
          patch = getNextPaletteRemixPatch(current);
        } else if (key === "darkMode" || key === "mutedMode" || key === "highContrast") {
          Object.assign(patch, { [key]: !current[key] });
        } else if ((TYPOGRAPHY_KEYS as readonly ResetKey[]).includes(key)) {
          patch = getTypographyRemixPatch(getNextTypographyRemix());
        } else if ((LAYOUT_KEYS as readonly ResetKey[]).includes(key)) {
          const remixStep = layoutRemixStepRef.current;
          layoutRemixStepRef.current += 1;
          patch = getLayoutRemixPatch(
            generateLayoutRemix({
              salt: layoutRemixSaltRef.current,
              step: remixStep,
            }),
          );
        } else if ((LOCKUP_KEYS as readonly ResetKey[]).includes(key)) {
          const remixStep = lockupRemixStepRef.current;
          lockupRemixStepRef.current += 1;
          patch = getLockupRemixPatch(
            generateLockupRemix({
              salt: lockupRemixSaltRef.current,
              step: remixStep,
            }),
          );
        }

        if (!(key in patch)) return current;

        const singleValuePatch: DesignValuesPatch = {};
        Object.assign(singleValuePatch, { [key]: patch[key] });
        return applyDesignValuesPatch(current, singleValuePatch);
      });
    },
    [
      getNextPaletteRemixPatch,
      getNextTypographyRemix,
      lockedKeys,
      markSourceSyncDirty,
    ],
  );

  const renderParameterActions = useCallback(
    (key: ResetKey, label: string) => (
      <ParameterActions
        key={`${key}-actions`}
        label={label}
        locked={lockedKeys.has(key)}
        onLockToggle={() => toggleSettingLock(key)}
        onRemix={() => remixSetting(key)}
        onReset={() => resetSetting(key)}
      />
    ),
    [lockedKeys, remixSetting, resetSetting, toggleSettingLock],
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
      actions={renderParameterActions(key, label)}
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
      actions={renderParameterActions(key, label)}
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
        actions={renderParameterActions(key, label)}
      />
    );
  };
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
              id={`${baseId}-lockup`}
              title="Lockup"
              icon={<Shapes aria-hidden="true" />}
              open={expandedGroups.lockup}
              onToggle={() => toggleGroup("lockup")}
              onReset={() => resetDefaultKeys(LOCKUP_KEYS)}
              actions={
                <button
                  type="button"
                  className="design-overlay__group-action"
                  aria-label="Remix lockup"
                  onClick={remixLockup}
                >
                  <Shuffle aria-hidden="true" />
                </button>
              }
            >
              {LOCKUP_SELECT_CONTROLS.map(renderSelectControl)}
              {LOCKUP_SLIDERS.map(renderSliderControl)}
            </CollapsibleGroup>

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
              <DesignOverlayPaletteControls
                activeDerivedColor={activeDerivedColor}
                baseId={baseId}
                derivedPaletteValues={derivedPaletteValues}
                onActiveDerivedColorChange={setActiveDerivedColor}
                onBrandColorChange={updateBrandColorValue}
                onPreviewValueChange={updatePreviewValue}
                onValueChange={updateValue}
                renderParameterActions={renderParameterActions}
                values={values}
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
