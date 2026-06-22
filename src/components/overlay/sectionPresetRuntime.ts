import {
  applySectionPresetAttributes,
  DEFAULT_SECTION_PRESETS,
  sanitizeSectionPresets,
  SECTION_PRESET_STORAGE_KEY,
  type SectionGroupKey,
} from "./sectionPresetCatalog";

export function readStoredSectionPresets(): Record<SectionGroupKey, string> {
  if (typeof window === "undefined") return DEFAULT_SECTION_PRESETS;

  try {
    const raw = window.localStorage.getItem(SECTION_PRESET_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Record<SectionGroupKey, string>>) : {};
    return sanitizeSectionPresets(parsed);
  } catch {
    return DEFAULT_SECTION_PRESETS;
  }
}

export function initSectionPresets() {
  applySectionPresetAttributes(readStoredSectionPresets());
}

export { readStoredHeroBackgroundEnabled, readStoredHeroShaderEnabled } from "./heroBackgroundRuntime";
