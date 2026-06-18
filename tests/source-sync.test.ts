import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import designTokensYaml from "../content/design-tokens.yaml?raw";
import landingCopyMarkdown from "../content/landing-copy.md?raw";
import { landingPage } from "../src/content/landing";

const tokensCss = readFileSync(
  path.join(process.cwd(), "src/styles/tokens.css"),
  "utf8",
);

describe("source sync files", () => {
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
  media: Record<string, Record<string, string>>;
  root: Record<string, string>;
} {
  const parsed = parse(designTokensYaml) as {
    tokens?: {
      media?: Record<string, Record<string, string>>;
      root?: Record<string, string>;
    };
  };

  return {
    media: parsed.tokens?.media ?? {},
    root: parsed.tokens?.root ?? {},
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
