import {
  getBunnyFontIds,
  getFontsourceFontIds,
  getGoogleFontLabels,
  toBunnyFamily,
  toFontsourceSlug,
} from "./webFontSources.mjs";

const FONTSOURCE_VERSION = "5";
const FONTSOURCE_WEIGHTS = ["400", "700"];
const GOOGLE_FONT_BATCH_SIZE = 12;
const FONTSOURCE_BATCH_SIZE = 8;
const BUNNY_BATCH_SIZE = 8;

function getDocument() {
  return globalThis.document;
}

function ensureStylesheet(id, href) {
  const document = getDocument();
  if (!document) return;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function buildGoogleFontHref(labels) {
  const families = labels
    .map((label) => `family=${label.replace(/\s+/g, "+")}:wght@400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

function buildBunnyFontHref(fontIds) {
  const families = fontIds
    .map((fontId) => `${toBunnyFamily(fontId)}:400,700`)
    .join("|");
  return `https://fonts.bunny.net/css?family=${families}&display=swap`;
}

function loadGoogleFontBatches(labels) {
  for (let index = 0; index < labels.length; index += GOOGLE_FONT_BATCH_SIZE) {
    const batch = labels.slice(index, index + GOOGLE_FONT_BATCH_SIZE);
    ensureStylesheet(
      `brandy-google-fonts-${index}`,
      buildGoogleFontHref(batch),
    );
  }
}

function loadFontsourceBatches(fontIds) {
  const document = getDocument();
  if (!document) return;

  for (let index = 0; index < fontIds.length; index += FONTSOURCE_BATCH_SIZE) {
    const batch = fontIds.slice(index, index + FONTSOURCE_BATCH_SIZE);
    const imports = batch.flatMap((fontId) => {
      const slug = toFontsourceSlug(fontId);
      return FONTSOURCE_WEIGHTS.map(
        (weight) =>
          `@import url("https://cdn.jsdelivr.net/npm/@fontsource/${slug}@${FONTSOURCE_VERSION}/${weight}.css");`,
      );
    });

    const styleId = `brandy-fontsource-${index}`;
    if (document.getElementById(styleId)) continue;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = imports.join("\n");
    document.head.appendChild(style);
  }
}

function loadBunnyFontBatches(fontIds) {
  for (let index = 0; index < fontIds.length; index += BUNNY_BATCH_SIZE) {
    const batch = fontIds.slice(index, index + BUNNY_BATCH_SIZE);
    ensureStylesheet(`brandy-bunny-fonts-${index}`, buildBunnyFontHref(batch));
  }
}

export function initWebFonts() {
  if (!getDocument()) return;

  loadGoogleFontBatches(getGoogleFontLabels());
  loadFontsourceBatches(getFontsourceFontIds());
  loadBunnyFontBatches(getBunnyFontIds());
}
