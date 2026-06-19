import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import designTokensYaml from "../content/design-tokens.yaml?raw";
import landingCopyMarkdown from "../content/landing-copy.md?raw";
import { landingPage } from "../src/content/landing";
import {
  BRAND_GENERATED_TOKEN_NAMES,
  DEFAULT_BRAND_DERIVATION_CONTROLS,
  BRAND_SEED_KEYS,
  generateBrandThemeTokens,
  type BrandDerivationControls,
  type BrandSeeds,
} from "../src/lib/brandTheme.mjs";
import {
  GRID_DENSITY_OPTIONS,
  HERO_SCALE_OPTIONS,
  LAYOUT_GENERATED_TOKEN_NAMES,
  LAYOUT_WIDTH_OPTIONS,
  generateLayoutThemeTokens,
  sanitizeLayoutSeeds,
  type LayoutSeeds,
} from "../src/lib/layoutTheme.mjs";
import {
  COOLSHAPES_CATEGORY_COUNTS,
  COOLSHAPES_MARK_SHAPE_OPTIONS,
  LOCKUP_GENERATED_TOKEN_NAMES,
  LOCKUP_SEED_KEYS,
  LOCKUP_SHAPE_OPTIONS,
  generateLockupThemeTokens,
  sanitizeLockupSeeds,
  type LockupSeeds,
} from "../src/lib/lockupTheme.mjs";
import {
  TYPOGRAPHY_GENERATED_MEDIA_TOKEN_NAMES,
  TYPOGRAPHY_GENERATED_TOKEN_NAMES,
  TYPOGRAPHY_FONT_IDS,
  TYPOGRAPHY_PAIRING_OPTIONS,
  TYPOGRAPHY_SEED_KEYS,
  TYPOGRAPHY_STYLE_OPTIONS,
  generateTypographyMediaThemeTokens,
  generateTypographyThemeTokens,
  sanitizeTypographySeeds,
  type TypographySeeds,
} from "../src/lib/typographyTheme.mjs";

const tokensCss = readFileSync(
  path.join(process.cwd(), "src/styles/tokens.css"),
  "utf8",
);

describe("source sync files", () => {
  it("uses canonical brand source schema layers", () => {
    const source = readDesignTokenYaml();

    expect(source.topLevelKeys).toEqual([
      "schema_version",
      "brand_brief",
      "creative_seeds",
      "generated_tokens",
    ]);
    expect(source.schemaVersion).toBe(2);
    expect(source.hasLegacyTopLevelSeeds).toBe(false);
  });

  it("keeps brand brief separate from creative seeds and generated tokens", () => {
    const source = readDesignTokenYaml();

    expect(source.brandBrief).toMatchObject({
      category: "Brand surface testing tool",
      description:
        "A browser-native system for turning expressive brand seeds into launch-ready surfaces.",
      name: "Brandy",
    });
    expect(source.brandBrief.strategy).toEqual({
      positioning: "The visual control layer for modular landing page systems.",
      promise: "Make brand feedback precise, fast, and implementation-ready.",
    });
    expect(source.brandBrief.personality.traits).toEqual([
      "sharp",
      "useful",
      "systematic",
      "brand-aware",
    ]);
    for (const name of Object.keys(source.root)) {
      expect(name.startsWith("--")).toBe(true);
    }
  });

  it("keeps color seeds as the editable design source", () => {
    const source = readDesignTokenYaml();

    expect(Object.keys(source.creativeSeeds.color).sort()).toEqual(
      [...BRAND_SEED_KEYS].sort(),
    );
    for (const value of Object.values(source.creativeSeeds.color)) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/);
    }
    expect(source.creativeSeeds.colorDerivation).toEqual(
      DEFAULT_BRAND_DERIVATION_CONTROLS,
    );
  });

  it("keeps generated brand tokens in sync with brand seeds", () => {
    const source = readDesignTokenYaml();
    const generatedTokens = generateBrandThemeTokens(source.creativeSeeds.color, {
      derivation: source.creativeSeeds.colorDerivation,
    });

    for (const name of BRAND_GENERATED_TOKEN_NAMES) {
      expect(source.root[name]).toBe(generatedTokens[name]);
    }
  });

  it("keeps layout seeds as the editable design source", () => {
    const source = readDesignTokenYaml();

    expect(Object.keys(source.creativeSeeds.layout).sort()).toEqual(
      [
        "gridDensity",
        "heroBalance",
        "heroScale",
        "pageGutter",
        "radius",
        "spacing",
        "textWidth",
        "width",
      ].sort(),
    );
    expect(sanitizeLayoutSeeds(source.creativeSeeds.layout)).toEqual(
      source.creativeSeeds.layout,
    );
    expect(LAYOUT_WIDTH_OPTIONS).toContain(source.creativeSeeds.layout.width);
    expect(HERO_SCALE_OPTIONS).toContain(source.creativeSeeds.layout.heroScale);
    expect(GRID_DENSITY_OPTIONS).toContain(source.creativeSeeds.layout.gridDensity);
  });

  it("keeps generated layout tokens in sync with layout seeds", () => {
    const source = readDesignTokenYaml();
    const generatedTokens = generateLayoutThemeTokens(source.creativeSeeds.layout);

    for (const name of LAYOUT_GENERATED_TOKEN_NAMES) {
      expect(source.root[name]).toBe(generatedTokens[name]);
    }
  });

  it("keeps lockup seeds as the editable design source", () => {
    const source = readDesignTokenYaml();

    expect(Object.keys(source.creativeSeeds.lockup).sort()).toEqual(
      [...LOCKUP_SEED_KEYS].sort(),
    );
    expect(sanitizeLockupSeeds(source.creativeSeeds.lockup)).toEqual(
      source.creativeSeeds.lockup,
    );
    expect(
      LOCKUP_SHAPE_OPTIONS.map((option) => option.value),
    ).toContain(source.creativeSeeds.lockup.markShape);
  });

  it("keeps generated lockup tokens in sync with lockup seeds", () => {
    const source = readDesignTokenYaml();
    const generatedTokens = generateLockupThemeTokens(source.creativeSeeds.lockup);

    for (const name of LOCKUP_GENERATED_TOKEN_NAMES) {
      expect(source.root[name]).toBe(generatedTokens[name]);
    }
    expect(source.root["--navbar-brand-mark-size"]).toBe(
      "var(--lockup-logo-size)",
    );
  });

  it("covers every documented Coolshapes mark category and count", () => {
    const optionCounts = COOLSHAPES_MARK_SHAPE_OPTIONS.reduce<
      Record<string, number>
    >((counts, option) => {
      expect(option.category).toBeDefined();
      if (!option.category) return counts;
      counts[option.category] = (counts[option.category] ?? 0) + 1;
      return counts;
    }, {});

    expect(optionCounts).toEqual(COOLSHAPES_CATEGORY_COUNTS);
  });

  it("keeps typography seeds as the editable design source", () => {
    const source = readDesignTokenYaml();

    expect(Object.keys(source.creativeSeeds.typography).sort()).toEqual(
      [...TYPOGRAPHY_SEED_KEYS].sort(),
    );
    expect(sanitizeTypographySeeds(source.creativeSeeds.typography)).toEqual(
      source.creativeSeeds.typography,
    );
    expect(TYPOGRAPHY_STYLE_OPTIONS).toContain(
      source.creativeSeeds.typography.style,
    );
    expect(TYPOGRAPHY_PAIRING_OPTIONS).toContain(
      source.creativeSeeds.typography.pairing,
    );
    expect(TYPOGRAPHY_FONT_IDS).toContain(
      source.creativeSeeds.typography.primaryFont,
    );
    expect(TYPOGRAPHY_FONT_IDS).toContain(
      source.creativeSeeds.typography.secondaryFont,
    );
  });

  it("keeps generated typography tokens in sync with typography seeds", () => {
    const source = readDesignTokenYaml();
    const generatedTokens = generateTypographyThemeTokens(
      source.creativeSeeds.typography,
    );
    const generatedMediaTokens = generateTypographyMediaThemeTokens(
      source.creativeSeeds.typography,
    );

    for (const name of TYPOGRAPHY_GENERATED_TOKEN_NAMES) {
      expect(source.root[name]).toBe(generatedTokens[name]);
    }

    for (const [query, tokenNames] of Object.entries(
      TYPOGRAPHY_GENERATED_MEDIA_TOKEN_NAMES,
    )) {
      for (const name of tokenNames) {
        expect(source.media[query]?.[name]).toBe(
          generatedMediaTokens[query]?.[name],
        );
      }
    }
  });

  it("keeps non-token creative seeds available for brand surfaces", () => {
    const source = readDesignTokenYaml();

    expect(source.brandBrief.motion).toEqual({
      hover_style: "lift",
      intensity: "medium",
      personality: "snappy",
      reveal_style: "quick_reveal",
    });
    expect(source.brandBrief.imagery.style).toBe(
      "annotated_interface_screenshots",
    );
    expect(source.brandBrief.voice.vocabulary).toEqual([
      "brand surfaces",
      "tokens",
      "sections",
      "ship",
    ]);
  });

  it("keeps design-token YAML root values in sync with tokens.css", () => {
    const source = readDesignTokenYaml();

    expect(source.root).toEqual(Object.fromEntries(readDeclaredTokenDefaults(tokensCss)));
  });

  it("keeps design-token YAML responsive values in sync with tokens.css", () => {
    const source = readDesignTokenYaml();

    expect(source.media).toEqual(
      Object.fromEntries(
        readDeclaredMediaTokenDefaults(tokensCss).map(([query, tokens]) => [
          query,
          Object.fromEntries(tokens),
        ]),
      ),
    );
  });

  it("keeps markdown copy source in sync with generated landing content", () => {
    expect(landingPage).toEqual(readLandingCopyMarkdown());
  });
});

function readDesignTokenYaml(): {
  brandBrief: {
    category: string;
    description: string;
    imagery: Record<string, string>;
    motion: Record<string, string>;
    name: string;
    personality: {
      traits: string[];
    };
    strategy: {
      positioning: string;
      promise: string;
    };
    voice: {
      headline_style: string;
      sentence_style: string;
      vocabulary: string[];
    };
  };
  creativeSeeds: {
    color: BrandSeeds;
    colorDerivation: BrandDerivationControls;
    layout: LayoutSeeds;
    lockup: LockupSeeds;
    typography: TypographySeeds;
  };
  hasLegacyTopLevelSeeds: boolean;
  media: Record<string, Record<string, string>>;
  root: Record<string, string>;
  schemaVersion: number;
  topLevelKeys: string[];
} {
  const parsed = parse(designTokensYaml) as {
    brand?: unknown;
    brand_brief?: {
      category?: string;
      description?: string;
      imagery?: Record<string, string>;
      motion?: Record<string, string>;
      name?: string;
      personality?: {
        traits?: string[];
      };
      strategy?: {
        positioning?: string;
        promise?: string;
      };
      voice?: {
        headline_style?: string;
        sentence_style?: string;
        vocabulary?: string[];
      };
    };
    creative_seeds?: {
      color?: BrandSeeds;
      color_derivation?: BrandDerivationControls;
      layout?: LayoutSeeds;
      lockup?: LockupSeeds;
      typography?: TypographySeeds;
    };
    generated?: {
      tokens?: {
        media?: Record<string, Record<string, string>>;
        root?: Record<string, string>;
      };
    };
    generated_tokens?: {
      media?: Record<string, Record<string, string>>;
      root?: Record<string, string>;
    };
    layout?: LayoutSeeds;
    schema_version?: number;
    typography?: TypographySeeds;
    tokens?: {
      media?: Record<string, Record<string, string>>;
      root?: Record<string, string>;
    };
  };

  return {
    brandBrief: {
      category: parsed.brand_brief?.category ?? "",
      description: parsed.brand_brief?.description ?? "",
      imagery: parsed.brand_brief?.imagery ?? {},
      motion: parsed.brand_brief?.motion ?? {},
      name: parsed.brand_brief?.name ?? "",
      personality: {
        traits: parsed.brand_brief?.personality?.traits ?? [],
      },
      strategy: {
        positioning: parsed.brand_brief?.strategy?.positioning ?? "",
        promise: parsed.brand_brief?.strategy?.promise ?? "",
      },
      voice: {
        headline_style: parsed.brand_brief?.voice?.headline_style ?? "",
        sentence_style: parsed.brand_brief?.voice?.sentence_style ?? "",
        vocabulary: parsed.brand_brief?.voice?.vocabulary ?? [],
      },
    },
    creativeSeeds: {
      color: parsed.creative_seeds?.color ?? {
        accent: "",
        highlight: "",
        primary: "",
        secondary: "",
      },
      colorDerivation:
        parsed.creative_seeds?.color_derivation ??
        DEFAULT_BRAND_DERIVATION_CONTROLS,
      layout: parsed.creative_seeds?.layout ?? {
        gridDensity: "balanced",
        heroBalance: 0,
        heroScale: "balanced",
        pageGutter: 0,
        radius: 0,
        spacing: 0,
        textWidth: 0,
        width: "standard",
      },
      lockup: parsed.creative_seeds?.lockup ?? {
        gap: 0,
        logoSize: 0,
        markShape: "coolshape:star:0",
        wordmarkFont: "inter",
        wordmarkSize: 0,
        wordmarkTracking: 0,
      },
      typography: parsed.creative_seeds?.typography ?? {
        density: 0,
        headlineStyle: 0,
        pairing: "display_plus_text",
        primaryFont: "inter",
        scale: 0,
        secondaryFont: "roboto",
        style: "geometric",
        tightness: 0,
        weight: 0,
      },
    },
    hasLegacyTopLevelSeeds:
      parsed.brand != null ||
      parsed.layout != null ||
      parsed.typography != null ||
      parsed.tokens != null ||
      parsed.generated != null,
    media:
      parsed.generated_tokens?.media ??
      parsed.generated?.tokens?.media ??
      parsed.tokens?.media ??
      {},
    root:
      parsed.generated_tokens?.root ??
      parsed.generated?.tokens?.root ??
      parsed.tokens?.root ??
      {},
    schemaVersion: parsed.schema_version ?? 0,
    topLevelKeys: Object.keys(parsed),
  };
}

function readLandingCopyMarkdown(): unknown {
  const start = landingCopyMarkdown.indexOf("```yaml");
  const yamlStart = landingCopyMarkdown.indexOf("\n", start);
  const end = landingCopyMarkdown.indexOf("\n```", yamlStart + 1);

  return parse(landingCopyMarkdown.slice(yamlStart + 1, end));
}

function readDeclaredTokenDefaults(css: string): Map<string, string> {
  const mediaBlocks = [...css.matchAll(/@media\s*\([^)]+\)\s*{\s*:root\s*{[\s\S]*?^\s*}\s*}/gm)].map(
    (match) => match[0],
  );
  const rootCss = mediaBlocks.reduce(
    (withoutMedia, block) => withoutMedia.replace(block, ""),
    css,
  );

  return readDeclarationMap(rootCss);
}

function readDeclaredMediaTokenDefaults(
  css: string,
): Array<[string, Map<string, string>]> {
  return [...css.matchAll(/@media\s*\(([^)]+)\)\s*{\s*:root\s*{([\s\S]*?)^\s*}\s*}/gm)].map(
    ([, query, body]) => [query.trim(), readDeclarationMap(body)],
  );
}

function readDeclarationMap(css: string): Map<string, string> {
  const defaults = new Map<string, string>();

  for (const match of css.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gm)) {
    const [, name, value] = match;
    if (!defaults.has(name)) defaults.set(name, normalizeCssValue(value));
  }

  return defaults;
}

function normalizeCssValue(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
