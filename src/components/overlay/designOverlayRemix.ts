import type { BrandDerivationControls } from "../../lib/brandTheme.mjs";
import type { LayoutSeeds } from "../../lib/layoutTheme.mjs";
import type { LockupSeeds } from "../../lib/lockupTheme.mjs";
import type { TypographySeeds } from "../../lib/typographyTheme.mjs";
import type { DesignOverlayValues } from "./designOverlayModel";
import type { ResetKey } from "./designOverlayControlConfig";

export type DesignValuesPatch = Partial<DesignOverlayValues>;

const PALETTE_REMIX_SALT_RANGE = 4096;
const LAYOUT_REMIX_SALT_RANGE = 4096;
const LOCKUP_REMIX_SALT_RANGE = 4096;
const TYPOGRAPHY_REMIX_SALT_RANGE = 4096;

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

export function isNetworkSyncError(error: unknown): boolean {
  if (!(error instanceof TypeError)) return false;
  return /fetch|network/i.test(error.message);
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
  if (target.closest(".design-overlay")) return false;

  return !target.closest("input, select, textarea");
}

export function getPaletteRemixSalt(): number {
  return Math.floor(Math.random() * PALETTE_REMIX_SALT_RANGE);
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
