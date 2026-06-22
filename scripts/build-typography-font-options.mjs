import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function sans(id, label, primary = label) {
  return {
    id,
    label,
    stack: `"${primary}", Inter, ui-sans-serif, system-ui, sans-serif`,
  };
}

function serif(id, label, primary = label) {
  return {
    id,
    label,
    stack: `"${primary}", Georgia, "Times New Roman", serif`,
  };
}

function mono(id, label, primary = label) {
  return {
    id,
    label,
    stack: `"${primary}", "SFMono-Regular", "Cascadia Code", monospace`,
  };
}

function narrowDisplay(id, label, primary = label) {
  return {
    id,
    label,
    stack: `"${primary}", Impact, "Arial Narrow", sans-serif`,
  };
}

function blackletter(id, label, primary = label) {
  return {
    id,
    label,
    stack: `"${primary}", Georgia, "Times New Roman", serif`,
  };
}

function formatFont(font) {
  return `  {
    id: "${font.id}",
    label: "${font.label}",
    stack: ${JSON.stringify(font.stack)},
  }`;
}

const root = path.dirname(fileURLToPath(import.meta.url));
const themePath = path.resolve(root, "../src/lib/typographyTheme.mjs");
const outputPath = path.resolve(root, "../src/lib/typographyFontOptions.mjs");
const theme = fs.readFileSync(themePath, "utf8");
const start = theme.indexOf("export const TYPOGRAPHY_FONT_OPTIONS = [");
const end = theme.indexOf("];\nexport const TYPOGRAPHY_FONT_IDS");
const baseBlock = theme.slice(start, end + 2).replace(
  "export const TYPOGRAPHY_FONT_OPTIONS = [",
  "export const BASE_TYPOGRAPHY_FONT_OPTIONS = [",
);

const ossFonts = [
  sans("m_plus_1", "M PLUS 1"),
  sans("aileron", "Aileron"),
  serif("bluu_next", "Bluu Next"),
  sans("tex_gyre_heros", "TeX Gyre Heros"),
  sans("terminal_grotesque", "Terminal Grotesque"),
  sans("reglo", "Reglo"),
  sans("poppins", "Poppins"),
  narrowDisplay("ostrich_sans", "Ostrich Sans"),
  serif("young_serif", "Young Serif"),
  mono("office_code_pro", "Office Code Pro"),
  sans("nimbus_sans_l", "Nimbus Sans L"),
  sans("liberation_sans", "Liberation Sans"),
  narrowDisplay("league_gothic", "League Gothic"),
  serif("junicode", "Junicode"),
  sans("gap_sans", "Gap Sans"),
  sans("cotham_sans", "Cotham Sans"),
  sans("cooper_hewitt", "Cooper Hewitt"),
  serif("bagnard", "Bagnard"),
  sans("chivo", "Chivo"),
  sans("hauora_sans", "Hauora Sans"),
  sans("inclusive_sans", "Inclusive Sans"),
  sans("instrument_sans", "Instrument Sans"),
  sans("karrik", "Karrik"),
  sans("mattone", "Mattone"),
  sans("open_sauce_sans", "Open Sauce Sans"),
  sans("overpass", "Overpass"),
  sans("league_spartan", "League Spartan"),
  sans("sporting_grotesque", "Sporting Grotesque"),
  sans("violet_sans", "Violet Sans"),
  serif("gelasio", "Gelasio"),
  serif("ibm_plex_serif", "IBM Plex Serif"),
  serif("minipax", "Minipax"),
  serif("libre_moretus", "Moretus", "Libre Moretus"),
  mono("compagnon", "Compagnon"),
  mono("courier_prime", "Courier Prime"),
  mono("fragment_mono", "Fragment Mono"),
  sans("recursive", "Recursive"),
  blackletter("fdi_wiking", "FDI Wiking"),
  blackletter("grenze_gotisch", "Grenze Gotisch"),
];

const file = `${baseBlock}

export const OSS_TYPOGRAPHY_FONT_OPTIONS = [
${ossFonts.map(formatFont).join(",\n")},
];

export const TYPOGRAPHY_FONT_OPTIONS = [
  ...BASE_TYPOGRAPHY_FONT_OPTIONS,
  ...OSS_TYPOGRAPHY_FONT_OPTIONS,
];
`;

fs.writeFileSync(outputPath, file);
console.log(`Wrote ${outputPath} with ${ossFonts.length} OSS fonts.`);
