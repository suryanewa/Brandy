export type TypographyStyle =
  | "geometric"
  | "grotesk"
  | "humanist"
  | "editorial"
  | "mono_tech"
  | "playful"
  | "luxury";
export type TypographyPairing =
  | "single_family"
  | "display_plus_text"
  | "editorial_contrast"
  | "mono_accent";

export type TypographySeeds = {
  density: number;
  headlineStyle: number;
  pairing: TypographyPairing;
  scale: number;
  style: TypographyStyle;
  tightness: number;
  weight: number;
};

export const TYPOGRAPHY_STYLE_OPTIONS: readonly TypographyStyle[];
export const TYPOGRAPHY_PAIRING_OPTIONS: readonly TypographyPairing[];
export const DEFAULT_TYPOGRAPHY_SEEDS: TypographySeeds;
export const TYPOGRAPHY_SEED_KEYS: readonly (keyof TypographySeeds)[];
export const TYPOGRAPHY_GENERATED_TOKEN_NAMES: readonly `--${string}`[];
export const TYPOGRAPHY_GENERATED_MEDIA_TOKEN_NAMES: Readonly<
  Record<string, readonly `--${string}`[]>
>;

export function sanitizeTypographySeeds(
  seeds?: Partial<TypographySeeds>,
): TypographySeeds;
export function generateTypographyThemeTokens(
  seeds?: Partial<TypographySeeds>,
): Record<`--${string}`, string>;
export function generateTypographyMediaThemeTokens(
  seeds?: Partial<TypographySeeds>,
): Record<string, Record<`--${string}`, string>>;
