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
  | "compound"
  | "fettepalette"
  | "rampensau"
  | "poline";

export type PaletteRemixScheme = {
  id: PaletteRemixSchemeId;
  label: string;
};

export type PaletteRemixOptions = {
  entropy?: number;
  salt?: number;
  scheme?: PaletteRemixSchemeId;
  step?: number;
};

export type BrandDerivationRemixOptions = {
  salt?: number;
  step?: number;
};

export type PaletteRemixResult = {
  palette: BrandSeeds;
  scheme: PaletteRemixSchemeId;
  schemeLabel: string;
};

export type HeroBackgroundTone = "dark" | "light";

export type HeroBackgroundSource = "hiro" | "default";

export type HeroButtonContrastTokens = Partial<{
  primaryBg: string;
  primaryHover: string;
  primaryText: string;
  secondaryBg: string;
  secondaryBorder: string;
  secondaryHover: string;
  secondaryText: string;
}>;

export type HeroBackgroundCopyColors = {
  challengingBg: string;
  text: string;
  muted: string;
  representativeBg: string;
};

export type HeroVisualContrastColors = HeroBackgroundCopyColors & {
  buttons: Required<HeroButtonContrastTokens>;
};

export type HeroBackgroundCopyColorSeeds = Partial<Pick<BrandSeeds, "primary" | "secondary">>;

export type HeroVisualContrastOptions = {
  buttonTokens?: HeroButtonContrastTokens;
  seedColors?: HeroBackgroundCopyColorSeeds;
  source?: HeroBackgroundSource;
  tone: HeroBackgroundTone;
};

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
export const FETTEPALETTE_REMIX_SCHEME: PaletteRemixScheme;
export const RAMPENSAU_REMIX_SCHEME: PaletteRemixScheme;
export const POLINE_REMIX_SCHEME: PaletteRemixScheme;
export const PALETTE_REMIX_GENERATOR_SCHEMES: readonly PaletteRemixScheme[];

export function sanitizeBrandSeeds(seeds?: Partial<BrandSeeds>): BrandSeeds;
export function areBrandSeedsEqual(
  left?: Partial<BrandSeeds>,
  right?: Partial<BrandSeeds>,
): boolean;
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
  options?: Pick<HeroVisualContrastOptions, "buttonTokens" | "source">,
): HeroVisualContrastColors;
export function getHeroVisualContrastColors(
  options: HeroVisualContrastOptions,
): HeroVisualContrastColors;
export function normalizeHexColor(value: string): string;
export function isHexColor(value: string): boolean;
