import {
  TYPOGRAPHY_FONT_OPTIONS,
  TYPOGRAPHY_FONT_IDS,
} from "./typographyTheme.mjs";

export const COOLSHAPE_CATEGORY_COUNTS = {
  star: 13,
  triangle: 14,
  moon: 15,
  polygon: 8,
  flower: 16,
  rectangle: 9,
  ellipse: 12,
  wheel: 7,
  misc: 11,
  number: 10,
};

export const COOLSHAPES_CATEGORY_COUNTS = COOLSHAPE_CATEGORY_COUNTS;

export const CUSTOM_LOCKUP_SHAPE_OPTIONS = [
  { value: "square", label: "Square" },
  { value: "rounded_square", label: "Rounded square" },
  { value: "triangle", label: "Triangle" },
  { value: "rounded_triangle", label: "Rounded triangle" },
  { value: "diamond", label: "Diamond" },
  { value: "rounded_diamond", label: "Rounded diamond" },
  { value: "circle", label: "Circle" },
  { value: "grid_squares", label: "Four squares" },
  { value: "grid_triangles", label: "Four triangles" },
  { value: "grid_circles", label: "Four circles" },
];

export const COOLSHAPE_LOCKUP_SHAPE_OPTIONS = Object.entries(
  COOLSHAPE_CATEGORY_COUNTS,
).flatMap(([category, count]) =>
  Array.from({ length: count }, (_, index) => ({
    category,
    index,
    label: `Coolshape ${titleCase(category)} ${index + 1}`,
    value: `coolshape:${category}:${index}`,
  })),
);

export const COOLSHAPES_MARK_SHAPE_OPTIONS = COOLSHAPE_LOCKUP_SHAPE_OPTIONS;

export const LOCKUP_SHAPE_OPTIONS = [
  ...CUSTOM_LOCKUP_SHAPE_OPTIONS,
  ...COOLSHAPE_LOCKUP_SHAPE_OPTIONS,
];

export const LOCKUP_SHAPE_IDS = LOCKUP_SHAPE_OPTIONS.map((option) => option.value);
export const LOCKUP_WORDMARK_FONT_IDS = TYPOGRAPHY_FONT_IDS;

export const DEFAULT_LOCKUP_SEEDS = {
  markShape: "coolshape:star:0",
  logoSize: 20,
  wordmarkFont: "archivo",
  wordmarkSize: 16,
  wordmarkTracking: 0,
  gap: 8,
};

export const LOCKUP_SEED_KEYS = [
  "markShape",
  "logoSize",
  "wordmarkFont",
  "wordmarkSize",
  "wordmarkTracking",
  "gap",
];

export const LOCKUP_GENERATED_TOKEN_NAMES = [
  "--lockup-logo-size",
  "--lockup-wordmark-font",
  "--lockup-wordmark-size",
  "--lockup-wordmark-tracking",
  "--lockup-gap",
  "--navbar-brand-mark-size",
];

const MARK_SHAPE_VALUES = new Set(LOCKUP_SHAPE_IDS);

export function sanitizeLockupSeeds(seeds = DEFAULT_LOCKUP_SEEDS) {
  const source =
    seeds && typeof seeds === "object" && !Array.isArray(seeds)
      ? seeds
      : DEFAULT_LOCKUP_SEEDS;

  return {
    markShape: sanitizeMarkShape(source.markShape),
    logoSize: snapNumber(source.logoSize, 12, 72, 1, DEFAULT_LOCKUP_SEEDS.logoSize),
    wordmarkFont: sanitizeFontId(source.wordmarkFont),
    wordmarkSize: snapNumber(
      source.wordmarkSize,
      12,
      42,
      1,
      DEFAULT_LOCKUP_SEEDS.wordmarkSize,
    ),
    wordmarkTracking: snapNumber(
      source.wordmarkTracking,
      -2,
      10,
      0.1,
      DEFAULT_LOCKUP_SEEDS.wordmarkTracking,
    ),
    gap: snapNumber(source.gap, 0, 32, 1, DEFAULT_LOCKUP_SEEDS.gap),
  };
}

export function generateLockupThemeTokens(seeds = DEFAULT_LOCKUP_SEEDS) {
  const lockup = sanitizeLockupSeeds(seeds);

  return {
    "--lockup-logo-size": `${roundNumber(lockup.logoSize, 4)}px`,
    "--lockup-wordmark-font": getWordmarkFontStack(lockup.wordmarkFont),
    "--lockup-wordmark-size": `${roundNumber(lockup.wordmarkSize, 4)}px`,
    "--lockup-wordmark-tracking": `${roundNumber(
      lockup.wordmarkTracking,
      4,
    )}px`,
    "--lockup-gap": `${roundNumber(lockup.gap, 4)}px`,
    "--navbar-brand-mark-size": "var(--lockup-logo-size)",
  };
}

export function generateLockupRemix(options = {}) {
  const salt = Number.isFinite(options.salt) ? Math.floor(options.salt) : 0;
  const step = Number.isFinite(options.step) ? Math.floor(options.step) : 0;
  const shapeIndex = positiveModulo(
    hashNumber(salt + step * 97),
    LOCKUP_SHAPE_IDS.length,
  );
  const fontIndex = positiveModulo(
    hashNumber(salt * 3 + step * 131 + 17),
    TYPOGRAPHY_FONT_IDS.length,
  );

  return sanitizeLockupSeeds({
    markShape: LOCKUP_SHAPE_IDS[shapeIndex],
    logoSize: 16 + Math.round(seededUnit(salt, step, 23) * 28),
    wordmarkFont: TYPOGRAPHY_FONT_IDS[fontIndex],
    wordmarkSize: 14 + Math.round(seededUnit(salt, step, 71) * 12),
    wordmarkTracking: roundNumber(-0.5 + seededUnit(salt, step, 41) * 4.5, 2),
    gap: 4 + Math.round(seededUnit(salt, step, 59) * 14),
  });
}

export function parseCoolshapeId(value) {
  const markShape = normalizeMarkShape(value);
  if (!markShape?.startsWith("coolshape:")) return null;

  const [, type, rawIndex] = markShape.split(":");
  return { index: Number(rawIndex), type };
}

function sanitizeMarkShape(value) {
  const markShape = normalizeMarkShape(value);
  return markShape ?? DEFAULT_LOCKUP_SEEDS.markShape;
}

function normalizeMarkShape(value) {
  if (typeof value !== "string") return null;
  if (MARK_SHAPE_VALUES.has(value)) return value;

  const legacy = value.match(/^([a-z]+)-(\d+)$/);
  if (!legacy) return null;

  const [, category, rawIndex] = legacy;
  const markShape = `coolshape:${category}:${rawIndex}`;
  return MARK_SHAPE_VALUES.has(markShape) ? markShape : null;
}

function sanitizeFontId(value) {
  return typeof value === "string" && TYPOGRAPHY_FONT_IDS.includes(value)
    ? value
    : DEFAULT_LOCKUP_SEEDS.wordmarkFont;
}

function getWordmarkFontStack(fontId) {
  return (
    TYPOGRAPHY_FONT_OPTIONS.find((font) => font.id === fontId)?.stack ??
    TYPOGRAPHY_FONT_OPTIONS.find(
      (font) => font.id === DEFAULT_LOCKUP_SEEDS.wordmarkFont,
    )?.stack ??
    "Inter, ui-sans-serif, system-ui, sans-serif"
  );
}

function snapNumber(value, min, max, step, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;

  const snapped = Math.round((parsed - min) / step) * step + min;
  return Number(clampNumber(snapped, min, max).toFixed(4));
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function seededUnit(salt, step, offset) {
  return positiveModulo(hashNumber(salt * offset + step * 7919 + offset), 10000) / 9999;
}

function hashNumber(value) {
  let next = Math.imul(Math.trunc(value) ^ 0x9e3779b9, 0x85ebca6b);
  next ^= next >>> 13;
  next = Math.imul(next, 0xc2b2ae35);
  return next ^ (next >>> 16);
}

function positiveModulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function roundNumber(value, precision = 0) {
  return Number(value.toFixed(precision));
}

function titleCase(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
