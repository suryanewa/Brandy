import {
  Box,
  Layers,
  MessageSquare,
  Navigation,
  PanelBottom,
  PanelTop,
  Rows3,
  Star,
  Users,
} from "lucide-react";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { SelectControl, ToggleControl } from "./DesignOverlayControls";
import { CollapsibleGroup, GroupRemixAction } from "./DesignOverlayGroups";
import {
  getHeroGradientTone,
  selectHeroGradientBackground,
} from "./heroGradientBackgrounds";

const SECTION_PRESETS_CHANGE_EVENT = "brandy:section-presets-change";
const SECTION_PRESETS_REMIX_EVENT = "brandy:section-presets-remix";

type SectionGroupKey =
  | "buttons"
  | "navbar"
  | "hero"
  | "logos"
  | "content"
  | "cards"
  | "bento"
  | "testimonials"
  | "pricing"
  | "team"
  | "faq"
  | "cta"
  | "footer";

type PresetOption = { label: string; value: string };

type SectionGroupConfig = {
  icon: ReactElement;
  key: SectionGroupKey;
  presets: readonly PresetOption[];
  title: string;
};

const SECTION_PRESET_STORAGE_KEY = "brandy:section-presets:v1";
const HERO_BACKGROUND_STORAGE_KEY = "brandy:hero-background:v1";
const DEFAULT_HERO_BACKGROUND_ENABLED = false;

const DEFAULT_PRESET = [{ label: "Default", value: "default" }] as const;

const SECTION_GROUPS = [
  { key: "buttons", title: "Buttons", icon: <Box aria-hidden="true" />, presets: DEFAULT_PRESET },
  {
    key: "navbar",
    title: "Navbar",
    icon: <Navigation aria-hidden="true" />,
    presets: [
      { label: "Default", value: "default" },
      { label: "Centered logo", value: "centered-logo" },
      { label: "Split", value: "split" },
      { label: "Vertical left", value: "vertical-left" },
      { label: "Vertical right", value: "vertical-right" },
    ],
  },
  {
    key: "hero",
    title: "Hero",
    icon: <Star aria-hidden="true" />,
    presets: [
      { label: "Centered", value: "centered" },
      { label: "Centered high", value: "centered-high" },
      { label: "Centered low", value: "centered-low" },
      { label: "Left", value: "left" },
      { label: "Left high", value: "left-high" },
      { label: "Left low", value: "left-low" },
      { label: "Editorial", value: "editorial" },
    ],
  },
  {
    key: "logos",
    title: "Logos",
    icon: <Rows3 aria-hidden="true" />,
    presets: [
      { label: "Marquee", value: "marquee" },
      { label: "Static", value: "static" },
      { label: "Grid", value: "grid" },
    ],
  },
  {
    key: "content",
    title: "Content",
    icon: <Layers aria-hidden="true" />,
    presets: [
      { label: "Centered stack", value: "centered-stack" },
      { label: "Bottom crop card", value: "bottom-crop-card" },
      { label: "Left copy / right card", value: "left-copy-right-card" },
      { label: "Right copy / left card", value: "right-copy-left-card" },
    ],
  },
  {
    key: "cards",
    title: "Cards",
    icon: <Box aria-hidden="true" />,
    presets: [
      { label: "1 x 2", value: "one-by-two" },
      { label: "1 x 3", value: "one-by-three" },
      { label: "1 x 4", value: "one-by-four" },
      { label: "2 x 2", value: "two-by-two" },
      { label: "2 x 3", value: "two-by-three" },
      { label: "2 x 4", value: "two-by-four" },
      { label: "3 top / 2 bottom", value: "three-two" },
      { label: "2 top / 3 bottom", value: "two-three" },
      { label: "3 top / 4 bottom", value: "three-four" },
      { label: "4 top / 3 bottom", value: "four-three" },
    ],
  },
  {
    key: "bento",
    title: "Bento",
    icon: <Layers aria-hidden="true" />,
    presets: [
      { label: "Hero + vertical stack", value: "hero-vertical-stack" },
      { label: "Hero + scattered satellites", value: "hero-scattered-satellites" },
      { label: "Diagonal weight shift", value: "diagonal-weight-shift" },
      { label: "Zig-zag bento", value: "zig-zag-bento" },
      { label: "Center hero / perimeter support", value: "center-hero-perimeter" },
    ],
  },
  { key: "testimonials", title: "Testimonials", icon: <MessageSquare aria-hidden="true" />, presets: DEFAULT_PRESET },
  { key: "pricing", title: "Pricing", icon: <PanelTop aria-hidden="true" />, presets: DEFAULT_PRESET },
  { key: "team", title: "Team", icon: <Users aria-hidden="true" />, presets: DEFAULT_PRESET },
  { key: "faq", title: "FAQ", icon: <MessageSquare aria-hidden="true" />, presets: DEFAULT_PRESET },
  { key: "cta", title: "CTA", icon: <Star aria-hidden="true" />, presets: DEFAULT_PRESET },
  { key: "footer", title: "Footer", icon: <PanelBottom aria-hidden="true" />, presets: DEFAULT_PRESET },
] as const satisfies readonly SectionGroupConfig[];

const DEFAULT_SECTION_PRESETS = Object.fromEntries(
  SECTION_GROUPS.map(({ key, presets }) => [key, presets[0].value]),
) as Record<SectionGroupKey, string>;

const INITIAL_SECTION_GROUP_STATE = Object.fromEntries(
  SECTION_GROUPS.map(({ key }) => [key, false]),
) as Record<SectionGroupKey, boolean>;

let globalSectionPresets = readStoredSectionPresets();
let globalHeroBackgroundEnabled = readStoredHeroBackgroundEnabled();
let globalLockedSections: ReadonlySet<SectionGroupKey> = new Set();

function remixAllSectionPresets() {
  setGlobalSectionPresets((current) =>
    Object.fromEntries(
      SECTION_GROUPS.map(({ key, presets }) => {
        if (globalLockedSections.has(key) || presets.length < 2) return [key, current[key]];
        return [key, getRandomDifferentPresetValue(presets, current[key])];
      }),
    ) as Record<SectionGroupKey, string>,
  );
}

export function DesignOverlaySectionsTab({ baseId }: { baseId: string }) {
  const [expandedSections, setExpandedSections] = useState(INITIAL_SECTION_GROUP_STATE);
  const [lockedSections, setLockedSections] = useState<ReadonlySet<SectionGroupKey>>(
    () => globalLockedSections,
  );
  const [presets, setPresets] = useState(globalSectionPresets);
  const [heroBackgroundEnabled, setHeroBackgroundEnabled] = useState(
    globalHeroBackgroundEnabled,
  );

  useEffect(() => {
    const syncPresets = () => {
      setPresets(globalSectionPresets);
      setHeroBackgroundEnabled(globalHeroBackgroundEnabled);
    };
    window.addEventListener(SECTION_PRESETS_CHANGE_EVENT, syncPresets);
    return () => window.removeEventListener(SECTION_PRESETS_CHANGE_EVENT, syncPresets);
  }, []);

  const toggleExpanded = (key: SectionGroupKey) => {
    setExpandedSections((current) => ({ ...current, [key]: !current[key] }));
  };
  const toggleLocked = (key: SectionGroupKey) => {
    setLockedSections((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      globalLockedSections = next;
      return next;
    });
  };
  const updatePreset = (key: SectionGroupKey, value: string) => {
    if (lockedSections.has(key)) return;
    setGlobalSectionPresets((current) => ({ ...current, [key]: value }));
  };
  const resetPreset = (key: SectionGroupKey) => {
    if (lockedSections.has(key)) return;
    setGlobalSectionPresets((current) => ({ ...current, [key]: DEFAULT_SECTION_PRESETS[key] }));
    if (key === "hero") setGlobalHeroBackgroundEnabled(DEFAULT_HERO_BACKGROUND_ENABLED);
  };
  const remixPreset = ({ key, presets: options }: SectionGroupConfig) => {
    if (lockedSections.has(key) || options.length < 2) return;
    setGlobalSectionPresets((current) => ({
      ...current,
      [key]: getRandomDifferentPresetValue(options, current[key]),
    }));
  };
  const updateHeroBackground = (enabled: boolean) => {
    if (lockedSections.has("hero")) return;
    setGlobalHeroBackgroundEnabled(enabled);
  };

  return (
    <>
      {SECTION_GROUPS.map((config) => {
        const { icon, key, presets: options, title } = config;
        const locked = lockedSections.has(key);
        return (
          <CollapsibleGroup
            key={key}
            id={`${baseId}-section-${key}`}
            title={title}
            icon={icon}
            open={expandedSections[key]}
            locked={locked}
            onLockToggle={() => toggleLocked(key)}
            onToggle={() => toggleExpanded(key)}
            onReset={() => resetPreset(key)}
            actions={<GroupRemixAction label={key} locked={locked} onRemix={() => remixPreset(config)} />}
          >
            {key === "hero" ? (
              <ToggleControl
                id={`${baseId}-section-${key}-background`}
                label="Background"
                checked={heroBackgroundEnabled}
                onChange={updateHeroBackground}
              />
            ) : null}
            <SelectControl
              id={`${baseId}-section-${key}-preset`}
              label="Preset"
              value={presets[key]}
              options={options}
              onChange={(value) => updatePreset(key, value)}
            />
          </CollapsibleGroup>
        );
      })}
    </>
  );
}

function readStoredSectionPresets(): Record<SectionGroupKey, string> {
  if (typeof window === "undefined") return DEFAULT_SECTION_PRESETS;

  try {
    const raw = window.localStorage.getItem(SECTION_PRESET_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Record<SectionGroupKey, string>>) : {};
    return sanitizeSectionPresets(parsed);
  } catch {
    return DEFAULT_SECTION_PRESETS;
  }
}

function persistSectionPresets(presets: Record<SectionGroupKey, string>) {
  if (typeof window === "undefined") return;

  if (areSectionPresetsDefault(presets)) {
    window.localStorage.removeItem(SECTION_PRESET_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(SECTION_PRESET_STORAGE_KEY, JSON.stringify(presets));
}

function readStoredHeroBackgroundEnabled() {
  if (typeof window === "undefined") return DEFAULT_HERO_BACKGROUND_ENABLED;
  return window.localStorage.getItem(HERO_BACKGROUND_STORAGE_KEY) === "true";
}

function persistHeroBackgroundEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;

  if (enabled === DEFAULT_HERO_BACKGROUND_ENABLED) {
    window.localStorage.removeItem(HERO_BACKGROUND_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(HERO_BACKGROUND_STORAGE_KEY, String(enabled));
}

function sanitizeSectionPresets(
  value: Partial<Record<SectionGroupKey, string>>,
): Record<SectionGroupKey, string> {
  return Object.fromEntries(
    SECTION_GROUPS.map(({ key, presets }) => {
      const next = value[key];
      return [
        key,
        presets.some((option) => option.value === next)
          ? next
          : DEFAULT_SECTION_PRESETS[key],
      ];
    }),
  ) as Record<SectionGroupKey, string>;
}

function areSectionPresetsDefault(presets: Record<SectionGroupKey, string>) {
  return SECTION_GROUPS.every(({ key }) => presets[key] === DEFAULT_SECTION_PRESETS[key]);
}

function setGlobalSectionPresets(
  nextPresets: (current: Record<SectionGroupKey, string>) => Record<SectionGroupKey, string>,
) {
  globalSectionPresets = sanitizeSectionPresets(nextPresets(globalSectionPresets));
  persistSectionPresets(globalSectionPresets);
  applySectionPresetAttributes(globalSectionPresets);
  window.dispatchEvent(new CustomEvent(SECTION_PRESETS_CHANGE_EVENT));
}

function setGlobalHeroBackgroundEnabled(enabled: boolean) {
  globalHeroBackgroundEnabled = enabled;
  persistHeroBackgroundEnabled(enabled);
  applyHeroBackgroundAttributes(enabled);
  window.dispatchEvent(new CustomEvent(SECTION_PRESETS_CHANGE_EVENT));
}

function getRandomDifferentPresetValue(options: readonly PresetOption[], currentValue: string) {
  const available = options.filter((option) => option.value !== currentValue);
  return (available[Math.floor(Math.random() * available.length)] ?? options[0]).value;
}

function applySectionPresetAttributes(presets: Record<SectionGroupKey, string>) {
  if (typeof document === "undefined") return;

  for (const [key, value] of Object.entries(presets)) {
    document.documentElement.dataset[`brandy${toDatasetKey(key)}Preset`] = value;
  }
}

function applyHeroBackgroundAttributes(enabled: boolean) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  if (!enabled) {
    delete root.dataset.brandyHeroBackground;
    delete root.dataset.brandyHeroBackgroundId;
    delete root.dataset.brandyHeroBackgroundTone;
    removeRootStyleProperty("--brandy-hero-background-image");
    return;
  }

  const styles = getComputedStyle(root);
  const background = selectHeroGradientBackground({
    primaryColor: getCssColor(styles, "--brand-primary-500", "#635bff"),
    secondaryColor: getCssColor(styles, "--brand-secondary-500", "#00d4ff"),
  });
  const tone = getHeroGradientTone(background);

  root.dataset.brandyHeroBackground = "on";
  root.dataset.brandyHeroBackgroundId = background.id;
  root.dataset.brandyHeroBackgroundTone = tone;
  setRootStyleProperty("--brandy-hero-background-image", `url("${background.src}")`);
}

function getCssColor(styles: CSSStyleDeclaration, property: string, fallback: string) {
  const value = styles.getPropertyValue(property).trim();
  return /^#[\da-f]{6}$/i.test(value) ? value : fallback;
}

function setRootStyleProperty(property: string, value: string) {
  const root = document.documentElement;
  if (root.style.getPropertyValue(property) !== value) {
    root.style.setProperty(property, value);
  }
}

function removeRootStyleProperty(property: string) {
  const root = document.documentElement;
  if (root.style.getPropertyValue(property)) {
    root.style.removeProperty(property);
  }
}

function toDatasetKey(key: string) {
  return key.slice(0, 1).toUpperCase() + key.slice(1);
}

applySectionPresetAttributes(readStoredSectionPresets());
applyHeroBackgroundAttributes(readStoredHeroBackgroundEnabled());

if (typeof window !== "undefined") {
  window.addEventListener(SECTION_PRESETS_REMIX_EVENT, remixAllSectionPresets);

  const heroBackgroundObserver = new MutationObserver(() => {
    applyHeroBackgroundAttributes(globalHeroBackgroundEnabled);
  });
  heroBackgroundObserver.observe(document.documentElement, {
    attributeFilter: ["style"],
    attributes: true,
  });
}
