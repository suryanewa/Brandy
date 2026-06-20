export type BrandSeedKey = "primary" | "secondary" | "accent" | "highlight";

export type BrandSeeds = Record<BrandSeedKey, string>;

export type BrandDerivationKey =
  | "backgroundDistancePercent"
  | "borderDistancePercent"
  | "buttonPrimaryBgDistancePercent"
  | "buttonSecondaryBorderDistancePercent"
  | "buttonSecondaryHoverDistancePercent"
  | "linkColorDistancePercent"
  | "linkHoverDistancePercent"
  | "footerBackgroundDistancePercent"
  | "footerBorderDistancePercent"
  | "navbarBackgroundDistancePercent"
  | "navbarBorderDistancePercent"
  | "primaryHoverDistancePercent"
  | "secondarySurfaceDistancePercent"
  | "accentMomentDistancePercent"
  | "highlightSoftDistancePercent"
  | "neutralSurfaceDistancePercent"
  | "readableTextDistancePercent"
  | "secondaryTextDistancePercent";

export type BrandDerivationControls = Record<BrandDerivationKey, number>;

export type PaletteRemixSchemeId =
  | "analogous"
  | "complementary"
  | "split-complementary"
  | "triadic"
  | "tetradic"
  | "square"
  | "monochrome"
  | "compound";

export type PaletteRemixScheme = {
  id: PaletteRemixSchemeId;
  label: string;
};

export type PaletteRemixOptions = {
  salt?: number;
  scheme?: PaletteRemixSchemeId;
  step?: number;
};

export type BrandDerivationRemixOptions = {
  step?: number;
};

export type PaletteRemixResult = {
  palette: BrandSeeds;
  scheme: PaletteRemixSchemeId;
  schemeLabel: string;
};

export type HeroBackgroundTone = "dark" | "light";

export type HeroBackgroundCopyColors = {
  text: string;
  muted: string;
  representativeBg: string;
};

export type HeroBackgroundCopyColorSeeds = Partial<Pick<BrandSeeds, "primary" | "secondary">>;

export type BrandThemeOptions = {
  darkMode?: boolean;
  derivation?: Partial<BrandDerivationControls>;
  elevationScale?: number;
  highContrast?: boolean;
  mutedMode?: boolean;
};

export const BRAND_DERIVATION_KEYS: readonly BrandDerivationKey[];
export const BRAND_SEED_KEYS: readonly BrandSeedKey[];
export const DEFAULT_BRAND_DERIVATION_CONTROLS: BrandDerivationControls;
export const DEFAULT_BRAND_SEEDS: BrandSeeds;
export const BRAND_GENERATED_TOKEN_NAMES: readonly `--${string}`[];
export const PALETTE_REMIX_SCHEMES: readonly PaletteRemixScheme[];

export function sanitizeBrandSeeds(seeds?: Partial<BrandSeeds>): BrandSeeds;
export function sanitizeBrandDerivationControls(
  controls?: Partial<BrandDerivationControls>,
): BrandDerivationControls;
export function generateBrandThemeTokens(
  seeds?: Partial<BrandSeeds>,
  options?: BrandThemeOptions,
): Record<`--${string}`, string>;
export function generatePaletteRemix(
  seeds?: Partial<BrandSeeds>,
  options?: PaletteRemixOptions,
): PaletteRemixResult;
export function generateBrandDerivationRemix(
  options?: BrandDerivationRemixOptions,
): BrandDerivationControls;
export function getHeroBackgroundCopyColors(
  tone: HeroBackgroundTone,
  seedColors?: HeroBackgroundCopyColorSeeds,
): HeroBackgroundCopyColors;
export function normalizeHexColor(value: string): string;
export function isHexColor(value: string): boolean;
