import { getHeroVisualContrastColors } from "../../lib/brandTheme.mjs";
import type { DesignOverlayValues } from "./designOverlayModel";
import {
  DEFAULT_HERO_BACKGROUND_ENABLED,
  DEFAULT_HERO_SHADER_ENABLED,
  HERO_BACKGROUND_STORAGE_KEY,
  HERO_SHADER_STORAGE_KEY,
  SECTION_PRESETS_CHANGE_EVENT,
  SECTION_PRESETS_REMIX_EVENT,
} from "./sectionPresetCatalog";
import {
  buildHeroPaletteKey,
  generateHeroBackground,
  type BrandPaletteColors,
  type HeroGeneratedBackground,
} from "./heroGeneratedBackground";
import {
  getHeroShaderDisplayScale,
  selectHeroShader,
  type HeroShaderSelection,
} from "./heroShaderSelection";

const HERO_SHADER_RENDER_WIDTH = 1280;
const HERO_SHADER_RENDER_HEIGHT = 720;

export const HERO_VISUAL_CHANGE_EVENT = "brandy:hero-visual-change";

export type HeroVisualState = {
  backgroundEnabled: boolean;
  generation: number;
  gradientDataUrl: string | null;
  shader: HeroShaderSelection | null;
  shaderDisplayScale: number;
  shaderEnabled: boolean;
};

type PreparedRemixCommit = {
  background: HeroGeneratedBackground;
  palette: BrandPaletteColors;
  shader: HeroShaderSelection | null;
  visualKey: string;
};

const DEFAULT_HERO_VISUAL_STATE: HeroVisualState = {
  backgroundEnabled: false,
  generation: 0,
  gradientDataUrl: null,
  shader: null,
  shaderDisplayScale: 0,
  shaderEnabled: false,
};

let globalHeroBackgroundEnabled = readStoredHeroBackgroundEnabled();
let globalHeroShaderEnabled = readStoredHeroShaderEnabled();
let cachedBackground: HeroGeneratedBackground | null = null;
let cachedShaderPaletteKey = "";
let cachedShaderSelection: HeroShaderSelection | null = null;
let heroVisualGeneration = 0;
let lastSyncedGeneration = -1;
let lastSyncedPaletteKey = "";
let cachedVisualKey = "";
let preparedRemixCommit: PreparedRemixCommit | null = null;
let currentHeroVisualState: HeroVisualState = { ...DEFAULT_HERO_VISUAL_STATE };
let heroVisualSyncRender: (() => void) | null = null;

export function getHeroVisualGeneration() {
  return heroVisualGeneration;
}

export function registerHeroVisualSyncRender(onSyncRender: (() => void) | null) {
  heroVisualSyncRender = onSyncRender;
}

export function commitHeroRemixToPage(options: {
  applyCss: () => void;
  remixSectionPresets?: boolean;
  values: DesignOverlayValues;
}) {
  prepareHeroRemixCommit(options.values);
  options.applyCss();

  if (typeof document !== "undefined") {
    document.documentElement.dataset.brandyHeroRemixing = "true";
  }

  try {
    if (options.remixSectionPresets) {
      window.dispatchEvent(new CustomEvent(SECTION_PRESETS_REMIX_EVENT));
    }

    flushHeroRemixLayout();
    applyPreparedHeroRemixCommit();
  } finally {
    if (typeof document !== "undefined") {
      delete document.documentElement.dataset.brandyHeroRemixing;
    }
  }
}

export function readStoredHeroBackgroundEnabled() {
  if (typeof window === "undefined") return DEFAULT_HERO_BACKGROUND_ENABLED;
  return window.localStorage.getItem(HERO_BACKGROUND_STORAGE_KEY) === "true";
}

export function readStoredHeroShaderEnabled() {
  if (typeof window === "undefined") return DEFAULT_HERO_SHADER_ENABLED;
  return window.localStorage.getItem(HERO_SHADER_STORAGE_KEY) === "true";
}

export function getHeroVisualState() {
  return currentHeroVisualState;
}

export function subscribeHeroVisual(onChange: (state: HeroVisualState) => void) {
  if (typeof window === "undefined") return () => undefined;

  const handleChange = () => {
    onChange(currentHeroVisualState);
  };

  window.addEventListener(HERO_VISUAL_CHANGE_EVENT, handleChange);
  return () => window.removeEventListener(HERO_VISUAL_CHANGE_EVENT, handleChange);
}

export function initHeroBackground() {
  syncHeroVisual();
}

export function flushHeroRemixLayout() {
  if (typeof document === "undefined") return;

  document.documentElement.getBoundingClientRect();
  document.querySelector(".hero-section")?.getBoundingClientRect();
}

export function setGlobalHeroBackgroundEnabled(enabled: boolean) {
  globalHeroBackgroundEnabled = enabled;
  persistHeroBackgroundEnabled(enabled);
  syncHeroVisual();
  window.dispatchEvent(new CustomEvent(SECTION_PRESETS_CHANGE_EVENT));
}

export function setGlobalHeroShaderEnabled(enabled: boolean) {
  globalHeroShaderEnabled = enabled;
  persistHeroShaderEnabled(enabled);
  syncHeroVisual();
  window.dispatchEvent(new CustomEvent(SECTION_PRESETS_CHANGE_EVENT));
}

export function getGlobalHeroBackgroundEnabled() {
  return globalHeroBackgroundEnabled;
}

export function getGlobalHeroShaderEnabled() {
  return globalHeroShaderEnabled;
}

export function prepareHeroRemixCommit(values: DesignOverlayValues) {
  heroVisualGeneration += 1;
  preparedRemixCommit = null;

  if (!globalHeroBackgroundEnabled && !globalHeroShaderEnabled) return;

  const palette = getPaletteFromDesignValues(values);
  const paletteKey = buildHeroPaletteKey(palette);
  const visualKey = `${paletteKey}:${heroVisualGeneration}`;
  const background = generateHeroBackground(palette, {
    generation: heroVisualGeneration,
  });
  const shader = globalHeroShaderEnabled
    ? selectHeroShader(palette, { generation: heroVisualGeneration })
    : null;

  cachedVisualKey = visualKey;
  cachedBackground = background;
  cachedShaderPaletteKey = visualKey;
  cachedShaderSelection = shader;
  preparedRemixCommit = {
    background,
    palette,
    shader,
    visualKey,
  };
}

export function applyPreparedHeroRemixCommit(): boolean {
  if (!preparedRemixCommit) return false;

  const commit = preparedRemixCommit;
  preparedRemixCommit = null;
  publishHeroVisualArtifacts(commit.palette, commit.background, commit.shader);
  return true;
}

export function syncHeroVisualFromDesignValues(values: DesignOverlayValues) {
  if (!globalHeroBackgroundEnabled && !globalHeroShaderEnabled) return;

  syncHeroBackgroundToPalette(getPaletteFromDesignValues(values));
}

function persistHeroBackgroundEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;

  if (enabled === DEFAULT_HERO_BACKGROUND_ENABLED) {
    window.localStorage.removeItem(HERO_BACKGROUND_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(HERO_BACKGROUND_STORAGE_KEY, String(enabled));
}

function persistHeroShaderEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;

  if (enabled === DEFAULT_HERO_SHADER_ENABLED) {
    window.localStorage.removeItem(HERO_SHADER_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(HERO_SHADER_STORAGE_KEY, String(enabled));
}

export function resetHeroBackgroundRuntimeState() {
  globalHeroBackgroundEnabled = readStoredHeroBackgroundEnabled();
  globalHeroShaderEnabled = readStoredHeroShaderEnabled();
  heroVisualGeneration = 0;
  preparedRemixCommit = null;
  cachedBackground = null;
  cachedShaderPaletteKey = "";
  cachedShaderSelection = null;
  lastSyncedGeneration = -1;
  lastSyncedPaletteKey = "";
  cachedVisualKey = "";
  currentHeroVisualState = { ...DEFAULT_HERO_VISUAL_STATE };
  heroVisualSyncRender = null;

  if (typeof document !== "undefined") {
    clearHeroVisualAttributes();
  }
}

function getPaletteFromDesignValues(values: DesignOverlayValues): BrandPaletteColors {
  return {
    primary: values.primaryColor,
    secondary: values.secondaryColor,
    accent: values.accentColor,
    highlight: values.highlightColor,
  };
}

function syncHeroBackgroundToPalette(palette: BrandPaletteColors) {
  const paletteKey = buildHeroPaletteKey(palette);
  if (paletteKey === lastSyncedPaletteKey && heroVisualGeneration === lastSyncedGeneration) {
    return;
  }

  applyHeroVisualWithPalette(palette);
}

function syncHeroVisual() {
  if (typeof document === "undefined") return;

  if (!globalHeroBackgroundEnabled && !globalHeroShaderEnabled) {
    clearHeroVisualAttributes();
    publishHeroVisualState({ ...DEFAULT_HERO_VISUAL_STATE });
    return;
  }

  applyHeroVisualWithPalette(readBrandPaletteColors());
}

function applyHeroVisualWithPalette(palette: BrandPaletteColors) {
  const paletteKey = buildHeroPaletteKey(palette);
  const visualKey = `${paletteKey}:${heroVisualGeneration}`;
  const background =
    visualKey === cachedVisualKey && cachedBackground
      ? cachedBackground
      : ((cachedVisualKey = visualKey),
        (cachedBackground = generateHeroBackground(palette, {
          generation: heroVisualGeneration,
        })),
        cachedBackground);
  const shader =
    globalHeroShaderEnabled
      ? visualKey === cachedShaderPaletteKey && cachedShaderSelection
        ? cachedShaderSelection
        : ((cachedShaderPaletteKey = visualKey),
          (cachedShaderSelection = selectHeroShader(palette, {
            generation: heroVisualGeneration,
          })),
          cachedShaderSelection)
      : null;

  publishHeroVisualArtifacts(palette, background, shader);
}

function publishHeroVisualArtifacts(
  palette: BrandPaletteColors,
  background: HeroGeneratedBackground,
  shader: HeroShaderSelection | null,
) {
  const paletteKey = buildHeroPaletteKey(palette);
  lastSyncedPaletteKey = paletteKey;
  lastSyncedGeneration = heroVisualGeneration;

  const copyColors = getHeroVisualContrastColors({
    tone: background.tone,
    seedColors: {
      primary: palette.primary,
      secondary: palette.secondary,
    },
    source: background.source,
    buttonTokens: readHeroButtonTokens(),
  });
  const root = document.documentElement;
  const canRenderShaderLayer = globalHeroShaderEnabled && Boolean(background.gradientDataUrl && shader);
  const showCssBackgroundImage =
    globalHeroBackgroundEnabled && !(globalHeroShaderEnabled && background.gradientDataUrl);
  const shaderDisplayScale =
    canRenderShaderLayer && shader
      ? readHeroShaderDisplayScale(shader.type)
      : 0;

  root.dataset.brandyHeroBackground = "on";
  root.dataset.brandyHeroBackgroundId = background.id;
  root.dataset.brandyHeroBackgroundSource = background.source;
  root.dataset.brandyHeroBackgroundTone = background.tone;

  if (globalHeroShaderEnabled && shader) {
    root.dataset.brandyHeroShader = "on";
    root.dataset.brandyHeroShaderType = shader.type;
    root.dataset.brandyHeroShaderPreset = shader.preset;
  } else {
    delete root.dataset.brandyHeroShader;
    delete root.dataset.brandyHeroShaderType;
    delete root.dataset.brandyHeroShaderPreset;
  }

  setRootStyleProperty("--brandy-hero-background-color", background.backgroundColor);
  setRootStyleProperty(
    "--brandy-hero-background-image",
    showCssBackgroundImage ? background.backgroundImage : "",
  );
  setRootStyleProperty("--brandy-hero-background-position", background.backgroundPosition);
  setRootStyleProperty("--brandy-hero-background-repeat", background.backgroundRepeat);
  setRootStyleProperty("--brandy-hero-background-size", background.backgroundSize);
  setRootStyleProperty("--brandy-hero-background-text", copyColors.text);
  setRootStyleProperty("--brandy-hero-background-muted", copyColors.muted);
  setRootStyleProperty("--brandy-hero-button-primary-bg", copyColors.buttons.primaryBg);
  setRootStyleProperty(
    "--brandy-hero-button-primary-hover-bg",
    copyColors.buttons.primaryHover,
  );
  setRootStyleProperty("--brandy-hero-button-primary-text", copyColors.buttons.primaryText);
  setRootStyleProperty("--brandy-hero-button-secondary-bg", copyColors.buttons.secondaryBg);
  setRootStyleProperty(
    "--brandy-hero-button-secondary-border",
    copyColors.buttons.secondaryBorder,
  );
  setRootStyleProperty(
    "--brandy-hero-button-secondary-hover-bg",
    copyColors.buttons.secondaryHover,
  );
  setRootStyleProperty(
    "--brandy-hero-button-secondary-text",
    copyColors.buttons.secondaryText,
  );

  publishHeroVisualState({
    backgroundEnabled: globalHeroBackgroundEnabled,
    generation: heroVisualGeneration,
    shaderEnabled: globalHeroShaderEnabled,
    gradientDataUrl: canRenderShaderLayer ? background.gradientDataUrl : null,
    shader: globalHeroShaderEnabled ? shader : null,
    shaderDisplayScale,
  });
}

function readHeroShaderDisplayScale(shaderType: HeroShaderSelection["type"]) {
  if (typeof document === "undefined") return 1;

  const heroSection = document.querySelector(".hero-section");
  const width = heroSection?.clientWidth ?? HERO_SHADER_RENDER_WIDTH;
  const height = heroSection?.clientHeight ?? HERO_SHADER_RENDER_HEIGHT;

  return getHeroShaderDisplayScale(
    width,
    height,
    shaderType,
    HERO_SHADER_RENDER_WIDTH,
    HERO_SHADER_RENDER_HEIGHT,
  );
}

function clearHeroVisualAttributes() {
  cachedVisualKey = "";
  cachedBackground = null;
  cachedShaderPaletteKey = "";
  cachedShaderSelection = null;
  lastSyncedPaletteKey = "";
  lastSyncedGeneration = -1;

  const root = document.documentElement;
  delete root.dataset.brandyHeroBackground;
  delete root.dataset.brandyHeroBackgroundId;
  delete root.dataset.brandyHeroBackgroundSource;
  delete root.dataset.brandyHeroBackgroundTone;
  delete root.dataset.brandyHeroShader;
  delete root.dataset.brandyHeroShaderType;
  delete root.dataset.brandyHeroShaderPreset;
  removeRootStyleProperty("--brandy-hero-background-color");
  removeRootStyleProperty("--brandy-hero-background-image");
  removeRootStyleProperty("--brandy-hero-background-position");
  removeRootStyleProperty("--brandy-hero-background-repeat");
  removeRootStyleProperty("--brandy-hero-background-size");
  removeRootStyleProperty("--brandy-hero-background-text");
  removeRootStyleProperty("--brandy-hero-background-muted");
  removeRootStyleProperty("--brandy-hero-button-primary-bg");
  removeRootStyleProperty("--brandy-hero-button-primary-hover-bg");
  removeRootStyleProperty("--brandy-hero-button-primary-text");
  removeRootStyleProperty("--brandy-hero-button-secondary-bg");
  removeRootStyleProperty("--brandy-hero-button-secondary-border");
  removeRootStyleProperty("--brandy-hero-button-secondary-hover-bg");
  removeRootStyleProperty("--brandy-hero-button-secondary-text");
}

function publishHeroVisualState(nextState: HeroVisualState) {
  currentHeroVisualState = nextState;
  window.dispatchEvent(new CustomEvent(HERO_VISUAL_CHANGE_EVENT));
  heroVisualSyncRender?.();
}

function readBrandPaletteColors(): BrandPaletteColors {
  const styles = getComputedStyle(document.documentElement);

  return {
    primary: getCssColor(styles, "--brand-primary-500", "#635bff"),
    secondary: getCssColor(styles, "--brand-secondary-500", "#00d4ff"),
    accent: getCssColor(styles, "--brand-accent-500", "#ff6b35"),
    highlight: getCssColor(styles, "--brand-highlight-500", "#fde68a"),
  };
}

function readHeroButtonTokens() {
  const styles = getComputedStyle(document.documentElement);

  return {
    primaryBg: getCssColor(styles, "--button-primary-bg", "#635bff"),
    primaryHover: getCssColor(styles, "--button-primary-hover", "#635bff"),
    primaryText: getCssColor(styles, "--button-primary-text", "#ffffff"),
    secondaryBg: getCssColor(styles, "--button-secondary-bg", "#f8f8f2"),
    secondaryBorder: getCssColor(styles, "--button-secondary-border", "#dfe2c6"),
    secondaryHover: getCssColor(styles, "--button-secondary-hover", "#eeefe0"),
    secondaryText: getCssColor(styles, "--button-secondary-text", "#4d5214"),
  };
}

function getCssColor(styles: CSSStyleDeclaration, property: string, fallback: string) {
  const value = styles.getPropertyValue(property).trim();
  if (/^#[\da-f]{6}$/i.test(value)) return value.toLowerCase();

  const rgbMatch = value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (rgbMatch) {
    return `#${[rgbMatch[1], rgbMatch[2], rgbMatch[3]]
      .map((channel) => Math.round(Number(channel)).toString(16).padStart(2, "0"))
      .join("")}`;
  }

  return fallback;
}

function setRootStyleProperty(property: string, value: string) {
  const root = document.documentElement;
  if (root.style.getPropertyValue(property) !== value) {
    root.style.setProperty(property, value);
  }
}

function removeRootStyleProperty(property: string) {
  const root = document.documentElement;
  if (root.style.getPropertyValue(property)) {
    root.style.removeProperty(property);
  }
}
