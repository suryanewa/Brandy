export const SECTION_PRESET_STORAGE_KEY = "brandy:section-presets:v1";
export const SECTION_PRESETS_CHANGE_EVENT = "brandy:section-presets-change";
export const SECTION_PRESETS_REMIX_EVENT = "brandy:section-presets-remix";
export const HERO_BACKGROUND_STORAGE_KEY = "brandy:hero-background:v1";
export const HERO_SHADER_STORAGE_KEY = "brandy:hero-shader:v1";

export type SectionGroupKey =
  | "buttons"
  | "navbar"
  | "hero"
  | "logos"
  | "content"
  | "cards"
  | "bento"
  | "faq"
  | "cta"
  | "footer";

type PresetOption = { label: string; value: string };

export const SECTION_GROUPS: readonly {
  key: SectionGroupKey;
  presets: readonly PresetOption[];
}[] = [
  { key: "buttons", presets: [{ label: "Default", value: "default" }] },
  {
    key: "navbar",
    presets: [
      { label: "Default", value: "default" },
      { label: "Centered logo", value: "centered-logo" },
      { label: "Split", value: "split" },
    ],
  },
  {
    key: "hero",
    presets: [
      { label: "Centered", value: "centered" },
      { label: "Left", value: "left" },
      { label: "Editorial", value: "editorial" },
    ],
  },
  {
    key: "logos",
    presets: [
      { label: "Marquee", value: "marquee" },
      { label: "Static", value: "static" },
      { label: "Grid", value: "grid" },
    ],
  },
  {
    key: "content",
    presets: [
      { label: "Centered stack", value: "centered-stack" },
      { label: "Bottom crop card", value: "bottom-crop-card" },
      { label: "Left copy / right card", value: "left-copy-right-card" },
      { label: "Right copy / left card", value: "right-copy-left-card" },
    ],
  },
  {
    key: "cards",
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
    presets: [
      { label: "Hero + vertical stack", value: "hero-vertical-stack" },
      { label: "Hero + scattered satellites", value: "hero-scattered-satellites" },
      { label: "Diagonal weight shift", value: "diagonal-weight-shift" },
      { label: "Zig-zag bento", value: "zig-zag-bento" },
      { label: "Center hero / perimeter support", value: "center-hero-perimeter" },
    ],
  },
  { key: "faq", presets: [{ label: "Default", value: "default" }] },
  { key: "cta", presets: [{ label: "Default", value: "default" }] },
  { key: "footer", presets: [{ label: "Default", value: "default" }] },
];

export const DEFAULT_SECTION_PRESETS = Object.fromEntries(
  SECTION_GROUPS.map(({ key, presets }) => [key, presets[0].value]),
) as Record<SectionGroupKey, string>;

export const DEFAULT_HERO_BACKGROUND_ENABLED = false;
export const DEFAULT_HERO_SHADER_ENABLED = false;

export function toSectionDatasetKey(key: string) {
  return key.slice(0, 1).toUpperCase() + key.slice(1);
}

export function sanitizeSectionPresets(
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

export function areSectionPresetsDefault(presets: Record<SectionGroupKey, string>) {
  return SECTION_GROUPS.every(({ key }) => presets[key] === DEFAULT_SECTION_PRESETS[key]);
}

export function applySectionPresetAttributes(presets: Record<SectionGroupKey, string>) {
  if (typeof document === "undefined") return;

  for (const [key, value] of Object.entries(presets)) {
    document.documentElement.dataset[`brandy${toSectionDatasetKey(key)}Preset`] = value;
  }
}
