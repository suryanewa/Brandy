import gradient01 from "../../assets/gradients/hero/01-colorful-smooth-gradient.webp";
import gradient02 from "../../assets/gradients/hero/02-smooth-gradients-blur.webp";
import gradient03 from "../../assets/gradients/hero/03-blue-dark-style-blur-gradients.webp";
import gradient04 from "../../assets/gradients/hero/04-blue-style-blur-gradients.webp";
import gradient05 from "../../assets/gradients/hero/05-blue-style-blur-gradients.webp";
import gradient06 from "../../assets/gradients/hero/06-blue-dark-style-blur-gradients.webp";
import gradient07 from "../../assets/gradients/hero/07-blue-style-blur-gradients.webp";
import gradient08 from "../../assets/gradients/hero/08-blue-style-blur-gradients.webp";
import gradient09 from "../../assets/gradients/hero/09-orange-smooth-gradients-blur.webp";
import gradient10 from "../../assets/gradients/hero/10-smooth-gradients-blur.webp";
import gradient11 from "../../assets/gradients/hero/11-white-to-dark-smooth-blur.webp";
import gradient12 from "../../assets/gradients/hero/12-retro-color-gradients-background.webp";
import gradient13 from "../../assets/gradients/hero/13-green-fractal-light-background.webp";
import gradient14 from "../../assets/gradients/hero/14-fractal-ligth-colorful-bg.webp";
import gradient15 from "../../assets/gradients/hero/15-fractal-glass-hero-gradients.webp";
import gradient16 from "../../assets/gradients/hero/16-fractal-glass-hero-gradients.webp";
import gradient17 from "../../assets/gradients/hero/17-fractal-glass-texture-light-gradients.webp";
import gradient18 from "../../assets/gradients/hero/18-fractal-glass-hero-bg.webp";
import gradient19 from "../../assets/gradients/hero/19-colorful-fractal-backgrounds.webp";
import gradient20 from "../../assets/gradients/hero/20-colorful-smooth-gradient.webp";
import gradient21 from "../../assets/gradients/hero/21-blue-fractal-light-background.webp";
import gradient22 from "../../assets/gradients/hero/22-green-smooth-gradients-blur.webp";
import gradient23 from "../../assets/gradients/hero/23-colorful-smooth-gradients-blur.webp";
import gradient24 from "../../assets/gradients/hero/24-ligth-blur-round-smooth-bg.webp";
import gradient25 from "../../assets/gradients/hero/25-ligth-blur-round-smooth-bg.webp";
import gradient26 from "../../assets/gradients/hero/26-blue-hero-blur-gradients.webp";
import gradient27 from "../../assets/gradients/hero/27-orange-smooth-gradients.webp";
import gradient28 from "../../assets/gradients/hero/28-purple-to-dark-bue.webp";
import gradient29 from "../../assets/gradients/hero/29-diffuse-light-blue.webp";
import gradient30 from "../../assets/gradients/hero/30-light-yellow-to-cyan.webp";
import gradient31 from "../../assets/gradients/hero/31-neon-gradient-blur.webp";
import gradient32 from "../../assets/gradients/hero/32-silver-to-red-gradient.webp";
import gradient33 from "../../assets/gradients/hero/33-cyan-to-light-yellow.webp";
import gradient34 from "../../assets/gradients/hero/34-noisy-pink-mix-orange.webp";
import gradient35 from "../../assets/gradients/hero/35-claret-color.webp";
import gradient36 from "../../assets/gradients/hero/36-retro-blue.webp";
import gradient37 from "../../assets/gradients/hero/37-cyan-crimson-transition.webp";
import gradient38 from "../../assets/gradients/hero/38-colorful-light-emerald.webp";
import gradient39 from "../../assets/gradients/hero/39-dream-violet.webp";
import gradient40 from "../../assets/gradients/hero/40-colorful-tropical-twilight.webp";
import gradient41 from "../../assets/gradients/hero/41-tropical-breeze.webp";
import gradient42 from "../../assets/gradients/hero/42-ecru-indigo-flow.webp";
import gradient43 from "../../assets/gradients/hero/43-rainbow-color-gradient.webp";
import gradient44 from "../../assets/gradients/hero/44-white-and-black-mesh.webp";
import gradient45 from "../../assets/gradients/hero/45-dream-dark-blue-gradient.webp";
import gradient46 from "../../assets/gradients/hero/46-starry-night-soft-gradient.webp";
import gradient47 from "../../assets/gradients/hero/47-fractal-phantom-gradient-stripes.webp";
import gradient48 from "../../assets/gradients/hero/48-cool-tone-spatial-gradient.webp";
import gradient49 from "../../assets/gradients/hero/49-dusky-amber-glows.webp";
import gradient50 from "../../assets/gradients/hero/50-blue-velvet-light-reflection.webp";

export type HeroGradientTone = "dark" | "light";

export type HeroGradientBackground = {
  hue: number;
  id: string;
  label: string;
  lightness: number;
  saturation: number;
  secondaryHue: number;
  src: string;
};

export const HERO_GRADIENT_BACKGROUNDS = [
  gradient("01-colorful-smooth-gradient", "Colorful smooth gradient", gradient01, 34, 225, 0.73, 0.42),
  gradient("02-smooth-gradients-blur", "Smooth gradients blur", gradient02, 224, 15, 0.71, 0.72),
  gradient("03-blue-dark-style-blur-gradients", "Blue dark style blur gradients", gradient03, 232, 15, 0.2, 0.71),
  gradient("04-blue-style-blur-gradients", "Blue style blur gradients", gradient04, 219, 15, 0.57, 0.89),
  gradient("05-blue-style-blur-gradients", "Blue style blur gradients", gradient05, 224, 15, 0.33, 0.78),
  gradient("06-blue-dark-style-blur-gradients", "Blue dark style blur gradients", gradient06, 224, 15, 0.18, 0.42),
  gradient("07-blue-style-blur-gradients", "Blue style blur gradients", gradient07, 219, 15, 0.21, 0.72),
  gradient("08-blue-style-blur-gradients", "Blue style blur gradients", gradient08, 211, 255, 0.45, 0.9),
  gradient("09-orange-smooth-gradients-blur", "Orange smooth gradients blur", gradient09, 7, 255, 0.44, 0.69),
  gradient("10-smooth-gradients-blur", "Smooth gradients blur", gradient10, 345, 225, 0.63, 0.6),
  gradient("11-white-to-dark-smooth-blur", "White to dark smooth blur", gradient11, 213, 75, 0.68, 0.14),
  gradient("12-retro-color-gradients-background", "Retro color gradients background", gradient12, 76, 165, 0.74, 0.23),
  gradient("13-green-fractal-light-background", "Green fractal light background", gradient13, 131, 15, 0.27, 0.27),
  gradient("14-fractal-ligth-colorful-bg", "Fractal light colorful background", gradient14, 14, 195, 0.84, 0.48),
  gradient("15-fractal-glass-hero-gradients", "Fractal glass hero gradients", gradient15, 204, 15, 0.24, 0.59),
  gradient("16-fractal-glass-hero-gradients", "Fractal glass hero gradients", gradient16, 219, 15, 0.14, 0.86),
  gradient("17-fractal-glass-texture-light-gradients", "Fractal glass texture light gradients", gradient17, 198, 135, 0.38, 0.43),
  gradient("18-fractal-glass-hero-bg", "Fractal glass hero background", gradient18, 234, 15, 0.1, 0.8),
  gradient("19-colorful-fractal-backgrounds", "Colorful fractal backgrounds", gradient19, 36, 195, 0.64, 0.61),
  gradient("20-colorful-smooth-gradient", "Colorful smooth gradient", gradient20, 48, 225, 0.66, 0.82),
  gradient("21-blue-fractal-light-background", "Blue fractal light background", gradient21, 207, 15, 0.76, 0.95),
  gradient("22-green-smooth-gradients-blur", "Green smooth gradients blur", gradient22, 132, 195, 0.89, 0.65),
  gradient("23-colorful-smooth-gradients-blur", "Colorful smooth gradients blur", gradient23, 135, 15, 0.76, 0.9),
  gradient("24-ligth-blur-round-smooth-bg", "Light blur round smooth background", gradient24, 207, 15, 0.71, 0.5),
  gradient("25-ligth-blur-round-smooth-bg", "Light blur round smooth background", gradient25, 198, 15, 0.64, 0.69),
  gradient("26-blue-hero-blur-gradients", "Blue hero blur gradients", gradient26, 212, 15, 0.36, 0.83),
  gradient("27-orange-smooth-gradients", "Orange smooth gradients", gradient27, 14, 225, 0.41, 0.66),
  gradient("28-purple-to-dark-bue", "Purple to dark blue", gradient28, 252, 285, 0.2, 0.65),
  gradient("29-diffuse-light-blue", "Diffuse light blue", gradient29, 208, 15, 0.49, 0.59),
  gradient("30-light-yellow-to-cyan", "Light yellow to cyan", gradient30, 131, 45, 0.68, 0.38),
  gradient("31-neon-gradient-blur", "Neon gradient blur", gradient31, 306, 255, 0.69, 0.89),
  gradient("32-silver-to-red-gradient", "Silver to red gradient", gradient32, 6, 15, 0.69, 0.28),
  gradient("33-cyan-to-light-yellow", "Cyan to light yellow", gradient33, 152, 45, 0.61, 0.67),
  gradient("34-noisy-pink-mix-orange", "Noisy pink mix orange", gradient34, 7, 15, 0.81, 0.72),
  gradient("35-claret-color", "Claret color", gradient35, 329, 285, 0.27, 0.34),
  gradient("36-retro-blue", "Retro blue", gradient36, 192, 15, 0.58, 0.56),
  gradient("37-cyan-crimson-transition", "Cyan crimson transition", gradient37, 6, 195, 0.54, 0.72),
  gradient("38-colorful-light-emerald", "Colorful light emerald", gradient38, 75, 15, 0.65, 0.57),
  gradient("39-dream-violet", "Dream violet", gradient39, 277, 345, 0.41, 0.32),
  gradient("40-colorful-tropical-twilight", "Colorful tropical twilight", gradient40, 33, 75, 0.61, 0.7),
  gradient("41-tropical-breeze", "Tropical breeze", gradient41, 52, 135, 0.78, 0.57),
  gradient("42-ecru-indigo-flow", "Ecru indigo flow", gradient42, 292, 45, 0.45, 0.38),
  gradient("43-rainbow-color-gradient", "Rainbow color gradient", gradient43, 354, 225, 0.8, 0.69),
  gradient("44-white-and-black-mesh", "White and black mesh", gradient44, 0, 15, 0.25, 0),
  gradient("45-dream-dark-blue-gradient", "Dream dark blue gradient", gradient45, 242, 15, 0.16, 0.68),
  gradient("46-starry-night-soft-gradient", "Starry night soft gradient", gradient46, 242, 315, 0.1, 0.67),
  gradient("47-fractal-phantom-gradient-stripes", "Fractal phantom gradient stripes", gradient47, 137, 15, 0.15, 0.03),
  gradient("48-cool-tone-spatial-gradient", "Cool tone spatial gradient", gradient48, 197, 15, 0.47, 0.28),
  gradient("49-dusky-amber-glows", "Dusky amber glows", gradient49, 14, 15, 0.25, 0.64),
  gradient("50-blue-velvet-light-reflection", "Blue velvet light reflection", gradient50, 221, 15, 0.23, 0.55),
] as const satisfies readonly HeroGradientBackground[];

export function selectHeroGradientBackground({
  primaryColor,
  secondaryColor,
}: {
  primaryColor: string;
  secondaryColor?: string;
}) {
  const primaryHue = getHexHue(primaryColor);
  const secondaryHue = secondaryColor ? getHexHue(secondaryColor) : null;

  return HERO_GRADIENT_BACKGROUNDS.reduce((best, candidate) => {
    const score = getGradientScore(candidate, primaryHue, secondaryHue);
    const bestScore = getGradientScore(best, primaryHue, secondaryHue);
    return score < bestScore ? candidate : best;
  }, HERO_GRADIENT_BACKGROUNDS[0]);
}

export function getHeroGradientTone(background: HeroGradientBackground): HeroGradientTone {
  return background.lightness > 0.62 ? "light" : "dark";
}

function gradient(
  id: string,
  label: string,
  src: string,
  hue: number,
  secondaryHue: number,
  lightness: number,
  saturation: number,
): HeroGradientBackground {
  return { hue, id, label, lightness, saturation, secondaryHue, src };
}

function getGradientScore(
  background: HeroGradientBackground,
  primaryHue: number,
  secondaryHue: number | null,
) {
  const primaryScore = hueDistance(background.hue, primaryHue);
  const secondaryScore =
    secondaryHue === null
      ? 0
      : Math.min(
          hueDistance(background.hue, secondaryHue),
          hueDistance(background.secondaryHue, secondaryHue),
        ) * 0.42;
  const lowSaturationPenalty = background.saturation < 0.18 ? 24 : 0;

  return primaryScore + secondaryScore + lowSaturationPenalty;
}

function getHexHue(hexColor: string) {
  const normalized = /^#[\da-f]{6}$/i.test(hexColor.trim()) ? hexColor.trim() : "#635bff";
  const red = Number.parseInt(normalized.slice(1, 3), 16) / 255;
  const green = Number.parseInt(normalized.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(normalized.slice(5, 7), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  if (delta === 0) return 0;
  if (max === red) return normalizeHue(((green - blue) / delta) * 60);
  if (max === green) return normalizeHue(((blue - red) / delta + 2) * 60);
  return normalizeHue(((red - green) / delta + 4) * 60);
}

function hueDistance(first: number, second: number) {
  const distance = Math.abs(normalizeHue(first) - normalizeHue(second));
  return Math.min(distance, 360 - distance);
}

function normalizeHue(hue: number) {
  return ((hue % 360) + 360) % 360;
}
