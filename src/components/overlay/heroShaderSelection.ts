import { createSeededRandom } from "@gradients/api/random.js";
import { getShaderPreset, pickRandomShaderSelection } from "@gradients/api/shaders.js";
import { buildHeroPaletteKey, type BrandPaletteColors } from "./heroGeneratedBackground";

export const HERO_SHADER_TYPES = [
  "paper-texture",
  "fluted-glass",
  "water",
  "image-dithering",
  "halftone-dots",
  "halftone-cmyk",
] as const;

export type HeroShaderType = (typeof HERO_SHADER_TYPES)[number];

export type HeroShaderSelection = {
  preset: string;
  presetParams: Record<string, unknown>;
  type: HeroShaderType;
};

export function selectHeroShader(
  palette: BrandPaletteColors,
  options: { generation?: number } = {},
): HeroShaderSelection {
  const random = createSeededRandom(
    `${buildHeroPaletteKey(palette)}:shader:${options.generation ?? 0}`,
  );
  const selection = pickRandomShaderSelection(random, { includeNone: false });
  const shaderType = normalizeShaderType(selection.shader);
  const preset = getShaderPreset(shaderType, selection.preset);

  return {
    type: shaderType,
    preset: selection.preset || preset?.name || "",
    presetParams: preset?.params ?? selection.presetParams,
  };
}

export function getHeroShaderRenderProps(
  shader: HeroShaderSelection,
): Record<string, unknown> {
  const overflowScale = getShaderOverflowScale(shader.type);
  const props: Record<string, unknown> = {
    ...shader.presetParams,
    fit: "cover",
    scale: overflowScale,
  };

  if (shader.type === "fluted-glass" && (shader.preset === "Default" || !shader.preset)) {
    props.size = 0.92;
    props.shift = -0.18;
    props.scale = overflowScale * 1.1;
  }

  if (shader.type === "paper-texture" && (shader.preset === "Default" || !shader.preset)) {
    Object.assign(props, {
      colorBack: "#ffffff",
      colorFront: "#ffffff",
      contrast: 0.18,
      roughness: 0,
      fiber: 0.16,
      fiberSize: 0.15,
      crumples: 0.1,
      crumpleSize: 0.1,
      folds: 0,
      foldCount: 1,
      drops: 0,
      fade: 0.4,
      seed: 0,
      fit: "cover",
      scale: overflowScale,
    });
  }

  return props;
}

export function getHeroShaderDisplayScale(
  containerWidth: number,
  containerHeight: number,
  shaderType: HeroShaderType,
  baseWidth: number,
  baseHeight: number,
) {
  if (containerWidth <= 0 || containerHeight <= 0) return 1;

  const coverScale = Math.max(containerWidth / baseWidth, containerHeight / baseHeight);
  return coverScale * getShaderOverflowScale(shaderType);
}

function getShaderOverflowScale(shaderType: HeroShaderType) {
  if (shaderType === "water" || shaderType === "fluted-glass") return 1.25;
  if (shaderType === "paper-texture") return 1.15;
  return 1.08;
}

function normalizeShaderType(value: string): HeroShaderType {
  if ((HERO_SHADER_TYPES as readonly string[]).includes(value)) {
    return value as HeroShaderType;
  }

  return HERO_SHADER_TYPES[0];
}
