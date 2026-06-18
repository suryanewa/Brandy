export type LayoutWidth = "narrow" | "standard" | "wide" | "full";
export type HeroScale = "compact" | "balanced" | "immersive";
export type GridDensity = "sparse" | "balanced" | "dense";

export type LayoutSeeds = {
  gridDensity: GridDensity;
  heroBalance: number;
  heroScale: HeroScale;
  pageGutter: number;
  radius: number;
  spacing: number;
  textWidth: number;
  width: LayoutWidth;
};

export const LAYOUT_WIDTH_OPTIONS: readonly LayoutWidth[];
export const HERO_SCALE_OPTIONS: readonly HeroScale[];
export const GRID_DENSITY_OPTIONS: readonly GridDensity[];
export const DEFAULT_LAYOUT_SEEDS: LayoutSeeds;
export const LAYOUT_GENERATED_TOKEN_NAMES: readonly `--${string}`[];

export function sanitizeLayoutSeeds(seeds?: Partial<LayoutSeeds>): LayoutSeeds;
export function generateLayoutThemeTokens(
  seeds?: Partial<LayoutSeeds>,
): Record<`--${string}`, string>;
