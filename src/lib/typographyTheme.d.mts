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
export type TypographyFont = string;

export type TypographySeeds = {
  density: number;
  headlineStyle: number;
  pairing: TypographyPairing;
  primaryFont: TypographyFont;
  scale: number;
  secondaryFont: TypographyFont;
  style: TypographyStyle;
  tightness: number;
  weight: number;
};

export type TypographyRemixOptions = {
  pairing?: TypographyPairing;
  salt?: number;
  step?: number;
  style?: TypographyStyle;
};

export const TYPOGRAPHY_STYLE_OPTIONS: readonly TypographyStyle[];
export const TYPOGRAPHY_PAIRING_OPTIONS: readonly TypographyPairing[];
export const TYPOGRAPHY_FONT_OPTIONS: readonly {
  id: TypographyFont;
  label: string;
  stack: string;
}[];
export const TYPOGRAPHY_FONT_IDS: readonly TypographyFont[];
export const DEFAULT_TYPOGRAPHY_SEEDS: TypographySeeds;
export const TYPOGRAPHY_SEED_KEYS: readonly (keyof TypographySeeds)[];
export const TYPOGRAPHY_GENERATED_TOKEN_NAMES: readonly `--${string}`[];
export const TYPOGRAPHY_GENERATED_MEDIA_TOKEN_NAMES: Readonly<
  Record<string, readonly `--${string}`[]>
>;

export function sanitizeTypographySeeds(
  seeds?: Partial<TypographySeeds>,
): TypographySeeds;
export function generateTypographyRemix(
  options?: TypographyRemixOptions,
): TypographySeeds;
export function generateTypographyThemeTokens(
  seeds?: Partial<TypographySeeds>,
): Record<`--${string}`, string>;
export function generateTypographyMediaThemeTokens(
  seeds?: Partial<TypographySeeds>,
): Record<string, Record<`--${string}`, string>>;
