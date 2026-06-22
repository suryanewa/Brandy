import { TYPOGRAPHY_FONT_OPTIONS } from "./typographyFontOptions.mjs";

export const WEB_FONT_SKIP_LABELS = new Set([
  "Bodoni 72",
  "Cabinet Grotesk",
  "Clash Display",
  "Commit Mono",
  "Didot",
  "Georgia",
  "Helvetica Neue",
  "Satoshi",
  "SF Mono",
  "Tahoma",
]);

export const WEB_FONT_SKIP_IDS = new Set([
  "bebas_neue",
  "bodoni_72",
  "cabinet_grotesk",
  "clash_display",
  "commit_mono",
  "didot",
  "georgia",
  "helvetica_neue",
  "recursive_mono",
  "satoshi",
  "sf_mono",
  "tahoma",
]);

export const FONTSOURCE_FONT_IDS = new Set([
  "aileron",
  "bagnard",
  "bluu_next",
  "chivo",
  "cooper_hewitt",
  "courier_prime",
  "fira_code",
  "fragment_mono",
  "gelasio",
  "grenze_gotisch",
  "hauora_sans",
  "ibm_plex_mono",
  "ibm_plex_sans",
  "ibm_plex_serif",
  "inclusive_sans",
  "instrument_sans",
  "jetbrains_mono",
  "league_gothic",
  "m_plus_1",
  "open_sauce_sans",
  "ostrich_sans",
  "overpass",
  "poppins",
  "recursive",
  "roboto_mono",
  "source_code_pro",
  "space_mono",
  "young_serif",
  "geist_sans",
  "geist_mono",
  "monaspace_neon",
  "monaspace_argon",
  "monaspace_xenon",
  "monaspace_krypton",
  "monaspace_radon",
  "alegreya",
  "alegreya_sans",
  "biorhyme",
  "biorhyme_expanded",
  "commissioner",
  "crimson_pro",
  "firago",
  "ia_writer_quattro",
  "inria_sans",
  "instrument_serif",
  "libre_franklin",
  "rakkas",
  "tasa_orbiter",
  "zilla_slab",
  "ibm_plex_sans_condensed",
]);

export const BUNNY_FONT_IDS = new Set([
  "cotham_sans",
  "compagnon",
  "fdi_wiking",
  "gap_sans",
  "junicode",
  "karrik",
  "liberation_sans",
  "libre_moretus",
  "mattone",
  "minipax",
  "nimbus_sans_l",
  "office_code_pro",
  "reglo",
  "sporting_grotesque",
  "terminal_grotesque",
  "tex_gyre_heros",
  "violet_sans",
  "paper_mono",
  "fivo_sans",
  "fivo_sans_modern",
  "le_murmure",
  "messapia",
]);

const GOOGLE_FONT_EXCLUDED_IDS = new Set([
  ...WEB_FONT_SKIP_IDS,
  ...FONTSOURCE_FONT_IDS,
  ...BUNNY_FONT_IDS,
]);

export function toFontsourceSlug(fontId) {
  return fontId.replaceAll("_", "-");
}

export function toBunnyFamily(fontId) {
  return fontId.replaceAll("_", "-");
}

export function getGoogleFontLabels() {
  return TYPOGRAPHY_FONT_OPTIONS.filter(
    (font) => !GOOGLE_FONT_EXCLUDED_IDS.has(font.id),
  ).map((font) => font.label);
}

export function getFontsourceFontIds() {
  return [...FONTSOURCE_FONT_IDS];
}

export function getBunnyFontIds() {
  return [...BUNNY_FONT_IDS];
}

export function getWebFontSkipLabels() {
  return [...WEB_FONT_SKIP_LABELS];
}
