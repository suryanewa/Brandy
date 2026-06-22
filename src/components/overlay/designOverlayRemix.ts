import {
  areBrandSeedsEqual,
  generateBrandDerivationRemix,
  generatePaletteRemix,
  type BrandDerivationControls,
} from "../../lib/brandTheme.mjs";
import type { LayoutSeeds } from "../../lib/layoutTheme.mjs";
import type { LockupSeeds } from "../../lib/lockupTheme.mjs";
import {
  generateTypographyRemix,
  type TypographyPairing,
  type TypographySeeds,
  type TypographyStyle,
} from "../../lib/typographyTheme.mjs";
import { getDesignBrandSeeds, type DesignOverlayValues } from "./designOverlayModel";
import type { ResetKey } from "./designOverlayControlConfig";

export type DesignValuesPatch = Partial<DesignOverlayValues>;

const PALETTE_REMIX_SALT_RANGE = 4096;
const LAYOUT_REMIX_SALT_RANGE = 4096;
const LOCKUP_REMIX_SALT_RANGE = 4096;
const TYPOGRAPHY_REMIX_SALT_RANGE = 4096;
const PALETTE_REMIX_MAX_ATTEMPTS = 32;
const PALETTE_REMIX_HISTORY_LIMIT = 8;

const remixPaletteHistory: string[] = [];

function buildPaletteHistoryKey(seeds: ReturnType<typeof getDesignBrandSeeds>) {
  return [
    seeds.primary,
    seeds.secondary,
    seeds.accent,
    seeds.highlight,
  ].join(":");
}

function isRecentlyRemixedPalette(seeds: ReturnType<typeof getDesignBrandSeeds>) {
  const key = buildPaletteHistoryKey(seeds);
  return remixPaletteHistory.includes(key);
}

function rememberRemixedPalette(seeds: ReturnType<typeof getDesignBrandSeeds>) {
  const key = buildPaletteHistoryKey(seeds);
  remixPaletteHistory.push(key);
  if (remixPaletteHistory.length > PALETTE_REMIX_HISTORY_LIMIT) {
    remixPaletteHistory.shift();
  }
}

export function resetPaletteRemixHistory() {
  remixPaletteHistory.length = 0;
}

function createPaletteRemixEntropy() {
  const clock =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  return Math.floor(Math.random() * 1_000_000) ^ Math.floor(clock);
}

const BOOLEAN_REMIX_KEYS = ["darkMode", "mutedMode", "highContrast"] as const;

export function applyDesignValuesPatch(
  current: DesignOverlayValues,
  patch: DesignValuesPatch,
): DesignOverlayValues {
  const next = { ...current };

  for (const key of Object.keys(patch) as ResetKey[]) {
    Object.assign(next, { [key]: patch[key] });
  }

  return next;
}

export function getUnlockedPatch(
  patch: DesignValuesPatch,
  lockedKeys: ReadonlySet<ResetKey>,
): DesignValuesPatch {
  const unlockedPatch: DesignValuesPatch = {};

  for (const key of Object.keys(patch) as ResetKey[]) {
    if (lockedKeys.has(key)) continue;
    Object.assign(unlockedPatch, { [key]: patch[key] });
  }

  return unlockedPatch;
}

export function buildPaletteRemixPatch(
  current: DesignOverlayValues,
  consumeRemixStep: () => number,
): DesignValuesPatch {
  const currentSeeds = getDesignBrandSeeds(current);
  let remix = generatePaletteRemix(currentSeeds, { salt: 0, step: 0 });
  let remixStep = 0;
  let remixSalt = 0;

  for (let attempt = 0; attempt < PALETTE_REMIX_MAX_ATTEMPTS; attempt += 1) {
    remixStep = consumeRemixStep();
    remixSalt = getPaletteRemixSalt();
    remix = generatePaletteRemix(currentSeeds, {
      entropy: createPaletteRemixEntropy(),
      salt: remixSalt,
      step: remixStep,
    });

    const isCurrentPalette = areBrandSeedsEqual(remix.palette, currentSeeds);
    const isRecentPalette = isRecentlyRemixedPalette(remix.palette);
    if (!isCurrentPalette && !isRecentPalette) break;
  }

  if (
    areBrandSeedsEqual(remix.palette, currentSeeds) ||
    isRecentlyRemixedPalette(remix.palette)
  ) {
    remix = generatePaletteRemix(currentSeeds, {
      entropy: createPaletteRemixEntropy() ^ Date.now(),
      salt: getPaletteRemixSalt(),
      step: remixStep + 1,
    });
  }

  rememberRemixedPalette(remix.palette);

  return {
    ...generateBrandDerivationRemix({ step: remixStep, salt: remixSalt }),
    ...getBooleanRemixPatch(),
    primaryColor: remix.palette.primary,
    secondaryColor: remix.palette.secondary,
    accentColor: remix.palette.accent,
    highlightColor: remix.palette.highlight,
  };
}

export function getTypographyRemixPatch(
  remix: TypographySeeds,
): DesignValuesPatch {
  return {
    headlineStyle: remix.headlineStyle,
    typographyDensity: remix.density,
    typographyPairing: remix.pairing,
    typographyPrimaryFont: remix.primaryFont,
    typographyScale: remix.scale,
    typographySecondaryFont: remix.secondaryFont,
    typographyStyle: remix.style,
    typographyTightness: remix.tightness,
    typographyWeight: remix.weight,
  };
}

export function getRandomTypographyPresetPatch(
  presetKey: "pairing" | "style",
  value: TypographyPairing | TypographyStyle,
  avoidPair?: string,
): DesignValuesPatch {
  let remix = generateTypographyRemix({
    [presetKey]: value,
    salt: getTypographyRemixSalt(),
    step: getTypographyRemixSalt(),
  });

  for (let attempt = 1; attempt < 8; attempt += 1) {
    const nextPair = `${remix.primaryFont}/${remix.secondaryFont}`;
    if (nextPair !== avoidPair) break;
    remix = generateTypographyRemix({
      [presetKey]: value,
      salt: getTypographyRemixSalt(),
      step: attempt,
    });
  }

  return getTypographyRemixPatch(remix);
}

export function getRandomTypographyRemixPatch(
  avoidPair?: string,
): DesignValuesPatch {
  let remix = generateTypographyRemix({
    salt: getTypographyRemixSalt(),
    step: getTypographyRemixSalt(),
  });

  for (let attempt = 1; attempt < 8; attempt += 1) {
    const nextPair = `${remix.primaryFont}/${remix.secondaryFont}`;
    if (nextPair !== avoidPair) break;
    remix = generateTypographyRemix({
      salt: getTypographyRemixSalt(),
      step: attempt,
    });
  }

  return getTypographyRemixPatch(remix);
}

export function getLayoutRemixPatch(remix: LayoutSeeds): DesignValuesPatch {
  return {
    gridDensity: remix.gridDensity,
    heroBalance: remix.heroBalance,
    heroScale: remix.heroScale,
    pageGutter: remix.pageGutter,
    pageWidth: remix.width,
    radius: remix.radius,
    sectionSpacing: remix.spacing,
    textWidth: remix.textWidth,
  };
}

export function getLockupRemixPatch(remix: LockupSeeds): DesignValuesPatch {
  return {
    lockupGap: remix.gap,
    lockupLogoSize: remix.logoSize,
    lockupShape: remix.markShape,
    lockupWordmarkFont: remix.wordmarkFont,
    lockupWordmarkSize: remix.wordmarkSize,
    lockupWordmarkTracking: remix.wordmarkTracking,
  };
}

export function getBrandDerivationRemixPatch(
  remix: BrandDerivationControls,
): DesignValuesPatch {
  return remix;
}

export function getBooleanRemixPatch(): DesignValuesPatch {
  return Object.fromEntries(
    BOOLEAN_REMIX_KEYS.map((key) => [key, Math.random() >= 0.5]),
  ) as DesignValuesPatch;
}

export function isNetworkSyncError(error: unknown): boolean {
  if (!(error instanceof TypeError)) return false;
  return /fetch|network/i.test(error.message);
}

export function isSettingsToggleShortcut(event: KeyboardEvent): boolean {
  if (!event.metaKey && !event.ctrlKey) return false;
  return event.key === "," || event.code === "Comma";
}

export function isDarkModeShortcut(event: KeyboardEvent): boolean {
  if (event.metaKey || event.ctrlKey || event.altKey) return false;
  if (event.key.toLowerCase() !== "d") return false;

  const target = event.target;
  if (!(target instanceof HTMLElement)) return true;
  if (target.isContentEditable) return false;

  return !target.closest("input, select, textarea");
}

export function isPaletteRemixShortcut(event: KeyboardEvent): boolean {
  if (event.key !== " " && event.key !== "Spacebar") return false;
  if (event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) return false;

  const target = event.target;
  if (!(target instanceof HTMLElement)) return true;
  if (target.isContentEditable) return false;
  if (target.closest(".design-overlay")) return !isTextEntrySpaceTarget(target);

  return !target.closest("input, select, textarea");
}

export function getPaletteRemixSalt(): number {
  return Math.floor(Math.random() * PALETTE_REMIX_SALT_RANGE);
}

export function isTextEntrySpaceTarget(target: HTMLElement) {
  if (target instanceof HTMLTextAreaElement) return true;
  if (!(target instanceof HTMLInputElement)) return false;

  return new Set([
    "email",
    "number",
    "password",
    "search",
    "tel",
    "text",
    "url",
  ]).has(target.type);
}

export function getLayoutRemixSalt(): number {
  return Math.floor(Math.random() * LAYOUT_REMIX_SALT_RANGE);
}

export function getLockupRemixSalt(): number {
  return Math.floor(Math.random() * LOCKUP_REMIX_SALT_RANGE);
}

export function getTypographyRemixSalt(): number {
  return Math.floor(Math.random() * TYPOGRAPHY_REMIX_SALT_RANGE);
}
