declare module "@gradients/gradientRenderer.js" {
  export type GradientRendererOptions = {
    blendMode?: string;
    blurStrength?: number;
    colors: string[];
    height: number;
    isBlurred?: boolean;
    seed: number;
    showRing?: boolean;
    width: number;
  };

  export function renderGradient(
    ctx: CanvasRenderingContext2D,
    options: GradientRendererOptions,
  ): void;
}

declare module "@gradients/api/random.js" {
  export function createSeededRandom(seed: string | number): () => number;
  export function randomChoice<T>(items: readonly T[], random?: () => number): T | undefined;
  export function randomInt(min: number, max: number, random?: () => number): number;
}

declare module "@gradients/api/shaders.js" {
  export function getShaderPreset(
    shaderType: string,
    presetName: string,
  ): { name: string; params?: Record<string, unknown> } | null | undefined;

  export function pickRandomShaderSelection(
    random?: () => number,
    options?: { includeNone?: boolean },
  ): {
    preset: string;
    presetParams: Record<string, unknown>;
    shader: string;
  };
}
