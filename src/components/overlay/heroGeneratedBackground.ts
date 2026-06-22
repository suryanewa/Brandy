import { randomChoice, randomInt, createSeededRandom } from "@gradients/api/random.js";
import { renderGradient } from "@gradients/gradientRenderer.js";

export type HeroGeneratedBackgroundSource = "hiro";

export type HeroGeneratedBackground = {
  backgroundColor: string;
  backgroundImage: string;
  backgroundPosition: "center";
  backgroundRepeat: "no-repeat";
  backgroundSize: "cover";
  gradientDataUrl: string | null;
  id: string;
  source: HeroGeneratedBackgroundSource;
  tone: HeroGradientTone;
};

export type HeroGradientTone = "dark" | "light";

export type BrandPaletteColors = {
  accent: string;
  highlight: string;
  primary: string;
  secondary: string;
};

const HERO_GRADIENT_WIDTH = 1280;
const HERO_GRADIENT_HEIGHT = 720;
const HERO_GRADIENT_QUALITY = 0.84;
const HERO_BLEND_MODES = ["dynamic", "screen", "overlay", "multiply"] as const;

export function buildHeroPaletteKey(palette: BrandPaletteColors) {
  return normalizePaletteColors(palette).join(":");
}

export function buildHeroGenerationSeed(
  palette: BrandPaletteColors,
  generation = 0,
) {
  return `${buildHeroPaletteKey(palette)}:${generation}`;
}

export function generateHeroBackground(
  palette: BrandPaletteColors,
  options: { generation?: number } = {},
): HeroGeneratedBackground {
  const colors = normalizePaletteColors(palette);
  const generationSeed = buildHeroGenerationSeed(palette, options.generation ?? 0);
  const random = createSeededRandom(generationSeed);
  const config = {
    colors,
    width: HERO_GRADIENT_WIDTH,
    height: HERO_GRADIENT_HEIGHT,
    seed: random(),
    isBlurred: true,
    blurStrength: randomInt(50, 75, random),
    blendMode: randomChoice(HERO_BLEND_MODES, random) ?? "dynamic",
    showRing: false,
  };

  const gradientDataUrl = renderHeroGradientDataUrl(config);

  return {
    backgroundColor: colors[0],
    backgroundImage: gradientDataUrl ? `url("${gradientDataUrl}")` : buildCssGradientFallback(colors),
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    gradientDataUrl,
    id: createBackgroundId(generationSeed, config.seed),
    source: "hiro",
    tone: getPaletteTone(colors),
  };
}

function renderHeroGradientDataUrl(config: {
  blendMode: string;
  blurStrength: number;
  colors: string[];
  height: number;
  isBlurred: boolean;
  seed: number;
  showRing: boolean;
  width: number;
}) {
  if (typeof document === "undefined") {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = config.width;
  canvas.height = config.height;
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  renderGradient(context, config);
  const dataUrl = canvas.toDataURL("image/jpeg", HERO_GRADIENT_QUALITY);
  return dataUrl.startsWith("data:image/jpeg") ? dataUrl : null;
}

function buildCssGradientFallback(colors: string[]) {
  const stops = colors
    .map((color, index) => {
      const position =
        colors.length === 1 ? "0%" : `${Math.round((index / (colors.length - 1)) * 100)}%`;
      return `${color} ${position}`;
    })
    .join(", ");

  return `linear-gradient(135deg, ${stops})`;
}

function normalizePaletteColors(palette: BrandPaletteColors) {
  return [
    normalizeHexColor(palette.primary),
    normalizeHexColor(palette.secondary),
    normalizeHexColor(palette.accent),
    normalizeHexColor(palette.highlight),
  ];
}

function normalizeHexColor(value: string) {
  const trimmed = value.trim();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;

  if (/^#[\da-f]{3}$/i.test(withHash)) {
    const [, red, green, blue] = withHash;
    return `#${red}${red}${green}${green}${blue}${blue}`.toLowerCase();
  }

  if (/^#[\da-f]{6}$/i.test(withHash)) {
    return withHash.toLowerCase();
  }

  return "#000000";
}

function getPaletteTone(colors: string[]): HeroGradientTone {
  const averageLightness =
    colors.reduce((sum, color) => sum + getHexLightness(color), 0) / colors.length;
  return averageLightness > 0.62 ? "light" : "dark";
}

function getHexLightness(hexColor: string) {
  const normalized = normalizeHexColor(hexColor);
  const red = Number.parseInt(normalized.slice(1, 3), 16) / 255;
  const green = Number.parseInt(normalized.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(normalized.slice(5, 7), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);

  return (max + min) / 2;
}

function createBackgroundId(paletteSeed: string, rendererSeed: number) {
  let hash = 2166136261;

  for (let index = 0; index < paletteSeed.length; index += 1) {
    hash ^= paletteSeed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `hiro-${(hash >>> 0).toString(16)}-${Math.round(rendererSeed * 10_000)}`;
}
