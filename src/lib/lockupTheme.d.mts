export type CoolshapeCategory =
  | "star"
  | "triangle"
  | "moon"
  | "polygon"
  | "flower"
  | "rectangle"
  | "ellipse"
  | "wheel"
  | "misc"
  | "number";

export type LockupShape = string;
export type LockupFont = string;

export type LockupShapeOption = {
  category?: CoolshapeCategory;
  index?: number;
  label: string;
  value: LockupShape;
};

export type LockupSeeds = {
  gap: number;
  logoSize: number;
  markShape: LockupShape;
  wordmarkFont: LockupFont;
  wordmarkSize: number;
  wordmarkTracking: number;
};

export type LockupRemixOptions = {
  salt?: number;
  step?: number;
};

export const COOLSHAPE_CATEGORY_COUNTS: Readonly<
  Record<CoolshapeCategory, number>
>;
export const COOLSHAPES_CATEGORY_COUNTS: typeof COOLSHAPE_CATEGORY_COUNTS;
export const CUSTOM_LOCKUP_SHAPE_OPTIONS: readonly LockupShapeOption[];
export const COOLSHAPE_LOCKUP_SHAPE_OPTIONS: readonly LockupShapeOption[];
export const COOLSHAPES_MARK_SHAPE_OPTIONS: readonly LockupShapeOption[];
export const LOCKUP_SHAPE_OPTIONS: readonly LockupShapeOption[];
export const LOCKUP_SHAPE_IDS: readonly LockupShape[];
export const LOCKUP_WORDMARK_FONT_IDS: readonly LockupFont[];
export const DEFAULT_LOCKUP_SEEDS: LockupSeeds;
export const LOCKUP_SEED_KEYS: readonly (keyof LockupSeeds)[];
export const LOCKUP_GENERATED_TOKEN_NAMES: readonly `--${string}`[];

export function sanitizeLockupSeeds(seeds?: Partial<LockupSeeds>): LockupSeeds;
export function generateLockupRemix(options?: LockupRemixOptions): LockupSeeds;
export function generateLockupThemeTokens(
  seeds?: Partial<LockupSeeds>,
): Record<`--${string}`, string>;
export function parseCoolshapeId(
  value: unknown,
): { index: number; type: CoolshapeCategory } | null;
