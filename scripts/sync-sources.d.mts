export function syncDesignTokens(options?: { check?: boolean }): Promise<void>;

type BrandDerivationControls = {
  accentMomentDistancePercent: number;
  backgroundDistancePercent: number;
  borderDistancePercent: number;
  buttonPrimaryBgDistancePercent: number;
  buttonSecondaryBorderDistancePercent: number;
  buttonSecondaryHoverDistancePercent: number;
  highlightSoftDistancePercent: number;
  linkColorDistancePercent: number;
  linkHoverDistancePercent: number;
  neutralSurfaceDistancePercent: number;
  primaryHoverDistancePercent: number;
  readableTextDistancePercent: number;
  secondaryTextDistancePercent: number;
  secondarySurfaceDistancePercent: number;
};

export function syncDesignTokensFromValues(
  values: Record<string, unknown>,
  options?: {
    brand?: {
      accent: string;
      highlight: string;
      primary: string;
      secondary: string;
    };
    brandDerivation?: BrandDerivationControls;
    check?: boolean;
    layout?: {
      gridDensity: "sparse" | "balanced" | "dense";
      heroBalance: number;
      heroScale: "compact" | "balanced" | "immersive";
      pageGutter: number;
      radius: number;
      spacing: number;
      textWidth: number;
      width: "narrow" | "standard" | "wide" | "full";
    };
    lockup?: {
      gap: number;
      logoSize: number;
      markShape: string;
      wordmarkFont: string;
      wordmarkSize: number;
      wordmarkTracking: number;
    };
    typography?: {
      density: number;
      headlineStyle: number;
      pairing:
        | "single_family"
        | "display_plus_text"
        | "editorial_contrast"
        | "mono_accent";
      primaryFont: string;
      scale: number;
      secondaryFont: string;
      style:
        | "geometric"
        | "grotesk"
        | "humanist"
        | "editorial"
        | "mono_tech"
        | "playful"
        | "luxury";
      tightness: number;
      weight: number;
    };
  },
): Promise<{ changedCount: number }>;

export function syncLandingCopy(options?: { check?: boolean }): Promise<void>;
