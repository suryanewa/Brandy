export type BrandSeedKey = "primary" | "secondary" | "accent" | "highlight";

export type BrandSeeds = Record<BrandSeedKey, string>;

export type BrandThemeOptions = {
  elevationScale?: number;
  highContrast?: boolean;
  mutedMode?: boolean;
};

export const BRAND_SEED_KEYS: readonly BrandSeedKey[];
export const DEFAULT_BRAND_SEEDS: BrandSeeds;
export const BRAND_GENERATED_TOKEN_NAMES: readonly `--${string}`[];

export function sanitizeBrandSeeds(seeds?: Partial<BrandSeeds>): BrandSeeds;
export function generateBrandThemeTokens(
  seeds?: Partial<BrandSeeds>,
  options?: BrandThemeOptions,
): Record<`--${string}`, string>;
export function normalizeHexColor(value: string): string;
export function isHexColor(value: string): boolean;
