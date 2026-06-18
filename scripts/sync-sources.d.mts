export function syncDesignTokens(options?: { check?: boolean }): Promise<void>;

export function syncDesignTokensFromValues(
  values: Record<string, unknown>,
  options?: {
    brand?: {
      accent: string;
      highlight: string;
      primary: string;
      secondary: string;
    };
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
    typography?: {
      density: number;
      headlineStyle: number;
      pairing:
        | "single_family"
        | "display_plus_text"
        | "editorial_contrast"
        | "mono_accent";
      scale: number;
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
