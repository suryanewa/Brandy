import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";
import { Button, Section } from "../src/components/primitives";
import {
  applySectionPresetAttributes,
  DEFAULT_SECTION_PRESETS,
} from "../src/components/overlay/sectionPresetCatalog";
import { landingPage } from "../src/content/landing";

const supportedSwatches = new Set(["green", "white", "radius"]);
const overlayCss = readFileSync("src/styles/overlay.css", "utf8");
const patternsCss = readFileSync("src/styles/patterns.css", "utf8");
const primitivesCss = readFileSync("src/styles/primitives.css", "utf8");
const sectionsCss = readFileSync("src/styles/sections.css", "utf8");

describe("modular contracts", () => {
  it("renders Button as an anchor or native button based on typed props", () => {
    render(
      <>
        <Button href="#demo">Anchor CTA</Button>
        <Button type="button" variant="secondary">
          Native CTA
        </Button>
      </>,
    );

    expect(
      screen.getByRole("link", { name: "Anchor CTA" }).getAttribute("href"),
    ).toBe("#demo");
    expect(
      screen.getByRole("button", { name: "Native CTA" }).getAttribute("type"),
    ).toBe("button");
  });

  it("emits typed section variant attributes", () => {
    render(
      <Section id="typed-section" size="lg" variant="muted">
        Content
      </Section>,
    );

    const section = document.querySelector("#typed-section");
    expect(section?.getAttribute("data-size")).toBe("lg");
    expect(section?.getAttribute("data-variant")).toBe("muted");
  });

  it("keeps default content sections as viewport-height panels", () => {
    expect(primitivesCss).toContain('.section[data-size="sm"]');
    expect(primitivesCss).toContain('.section[data-size="md"]');
    expect(primitivesCss).toContain('.section[data-size="lg"]');
    expect(primitivesCss).toContain("block-size: 100svh;");
    expect(primitivesCss).toContain("align-items: safe center;");
    expect(primitivesCss).toContain('.section[data-size="hero"]');
    expect(primitivesCss).toContain(
      "block-size: calc(100svh - var(--navbar-min-height) - var(--stroke-thin));",
    );
    expect(sectionsCss).toContain(':root[data-brandy-navbar-preset^="vertical"] .section[data-size="hero"]');
    expect(sectionsCss).toContain("min-block-size: 100svh;");
    expect(sectionsCss).toContain(".section.logo-marquee-section");
    expect(sectionsCss).toContain(".logo-marquee__viewport {");
    expect(sectionsCss).toContain("overflow: hidden;");
    expect(sectionsCss).toContain(".section.logo-marquee-section .marquee {");
    expect(sectionsCss).toContain("padding-block: 0;");
    expect(sectionsCss).toContain(":root[data-brandy-logos-preset=\"static\"] .marquee {");
    expect(sectionsCss).toContain("overflow: hidden;");
    expect(sectionsCss).toContain(":root[data-brandy-logos-preset=\"static\"] .marquee__group {");
    expect(sectionsCss).toContain("flex-wrap: nowrap;");
    expect(sectionsCss).toContain(".section.final-cta-section");
    expect(sectionsCss).toContain("block-size: auto;");
    expect(sectionsCss).not.toContain("#demo");
  });

  it("keeps hero background CTA colors contrast-safe across palette remixes", () => {
    expect(sectionsCss).toContain(
      "background: var(--brandy-hero-button-primary-bg, var(--button-primary-bg));",
    );
    expect(sectionsCss).toContain(
      "color: var(--brandy-hero-button-primary-text, var(--button-primary-text));",
    );
    expect(sectionsCss).toContain(
      "background: var(--brandy-hero-button-secondary-bg, var(--button-secondary-bg));",
    );
    expect(sectionsCss).toContain(
      "color: var(--brandy-hero-button-secondary-text, var(--button-secondary-text));",
    );
    expect(sectionsCss).not.toContain("--brandy-hero-button-primary-bg: var(--button-primary-bg);");
    expect(sectionsCss).not.toContain("--brandy-hero-button-primary-text: var(--button-primary-text);");
    expect(sectionsCss).not.toContain("--brandy-hero-button-secondary-bg: var(--button-secondary-bg);");
    expect(sectionsCss).not.toContain("--brandy-hero-button-secondary-text: var(--button-secondary-text);");
    expect(sectionsCss).not.toContain("--brandy-hero-button-primary-bg: var(--white);");
    expect(sectionsCss).not.toContain("--brandy-hero-button-primary-text: var(--ink-950);");
    expect(sectionsCss).not.toContain("--brandy-hero-button-primary-bg: #ffffff;");
    expect(sectionsCss).not.toContain("--brandy-hero-button-primary-bg: #111416;");
    expect(sectionsCss).toContain(":root[data-brandy-hero-background=\"on\"] {");
    expect(sectionsCss).toContain("--brandy-hero-background-text: #ffffff;");
    expect(sectionsCss).toContain("--brandy-hero-background-text: #111416;");
    expect(sectionsCss).not.toContain("--brandy-hero-background-text: var(--white);");
    expect(sectionsCss).not.toContain("--brandy-hero-background-text: var(--ink-950);");
    expect(sectionsCss).toContain(
      "color: var(--brandy-hero-button-primary-text, var(--button-primary-text));",
    );
    expect(sectionsCss).toContain(':root[data-brandy-hero-shader="on"] .hero-section__shader::after');
    expect(sectionsCss).toContain(
      ':root[data-brandy-hero-shader-type="halftone-dots"] .hero-section__shader-canvas',
    );
    expect(sectionsCss).toContain("filter: blur(25px);");
    const primaryButtonRule = sectionsCss.match(
      /:root\[data-brandy-hero-background="on"\] \.hero-actions \.button--primary \{[^}]+\}/,
    )?.[0];
    expect(primaryButtonRule).toBeTruthy();
    expect(primaryButtonRule).not.toContain("color: var(--color-bg);");
    expect(sectionsCss).not.toContain("--brandy-hero-button-secondary-bg: rgb(255 255 255 / 0.12);");
    expect(sectionsCss).not.toContain("--brandy-hero-button-secondary-bg: rgb(0 0 0 / 0.08);");
  });

  it("centers post-hero section content on the navbar edge system", () => {
    window.history.pushState({}, "", "/");
    render(<App />);

    const postHeroSections = Array.from(
      document.querySelectorAll("main > .section:not(.hero-section)"),
    );

    expect(postHeroSections.length).toBeGreaterThan(0);
    for (const section of postHeroSections) {
      expect(section.querySelector(":scope > .container")).toBeTruthy();
    }

    expect(primitivesCss).toContain("main > .section:not(.hero-section)");
    expect(primitivesCss).toContain("justify-content: center;");
    expect(primitivesCss).toContain("flex: 0 1 min(100%, var(--container-xl));");
    expect(primitivesCss).toContain("justify-items: center;");
  });

  it("keeps the design settings UI on a fixed Taki-style skin", () => {
    expect(overlayCss).toContain("--color-text: oklch(0.145 0 0);");
    expect(overlayCss).toContain("--color-surface-raised: oklch(1 0 0);");
    expect(overlayCss).toContain("--button-primary-bg: oklch(0.205 0 0);");
    expect(overlayCss).toContain("--font-size-caption: 0.875rem;");
    expect(overlayCss).toContain("scrollbar-width: none;");
    expect(overlayCss).toContain("box-shadow: none;");
    expect(overlayCss).toContain("width: min(75vw, 28rem);");
    expect(overlayCss).toContain("grid-template-columns: auto auto auto;");
    expect(overlayCss).toContain(
      ".design-overlay__group:is(:hover, :focus-within) .design-overlay__group-actions",
    );
    expect(overlayCss).toContain(
      ".design-overlay__group-header:is(:hover, :focus-within) .design-overlay__group-actions",
    );
    expect(overlayCss).toContain("pointer-events: none;");
    expect(overlayCss).toContain(".design-overlay__range::-webkit-slider-thumb");
    expect(overlayCss).toContain("opacity: 0;");
    expect(overlayCss).toContain("grid-template-rows: 0fr;");
    expect(overlayCss).toContain("transition: grid-template-rows 200ms ease-in-out");
    expect(overlayCss).toContain('.design-overlay__group-content[data-open="true"]');
    expect(overlayCss).toContain("grid-template-rows: 1fr;");
    expect(overlayCss).toContain(".design-overlay__group-content-inner");
    expect(overlayCss).toContain(".design-overlay__panel[data-state=\"closing\"]");
    expect(overlayCss).toContain("@keyframes design-overlay-exit");
    expect(overlayCss).toContain("to { transform: translateX(100%); }");
  });

  it("keeps internal CTA and nav hrefs pointed at rendered section ids", () => {
    window.history.pushState({}, "", "/");
    render(<App />);

    const renderedIds = new Set(
      Array.from(document.querySelectorAll("[id]")).map((element) => element.id),
    );
    const hrefs = [
      landingPage.nav.cta.href,
      landingPage.hero.primaryCta.href,
      landingPage.hero.secondaryCta.href,
      landingPage.finalCta.cta.href,
      ...landingPage.nav.links.map((link) => link.href),
      ...landingPage.footer.links.map((link) => link.href),
    ].filter((href) => href.startsWith("#"));

    expect(hrefs).not.toHaveLength(0);
    for (const href of hrefs) {
      expect(renderedIds.has(href.slice(1))).toBe(true);
    }
  });

  it("keeps repeated content keys unique and demo swatches supported", () => {
    const titles = [
      ...landingPage.layers.map((item) => item.title),
      ...landingPage.features.map((item) => item.title),
      ...landingPage.useCases.map((item) => item.title),
      ...landingPage.proofItems.map((item) => item.title),
      ...landingPage.faq.map((item) => item.question),
    ];

    expect(new Set(titles).size).toBe(titles.length);
    expect(
      landingPage.demo.tokenSets.every((token) =>
        supportedSwatches.has(token.swatch),
      ),
    ).toBe(true);
  });

  it("caps long repeated section headings at two lines", () => {
    render(<App />);

    const repeatedHeaders = [
      landingPage.systemMap,
      landingPage.featureOverview,
      landingPage.demo,
    ];

    for (const { title } of repeatedHeaders) {
      expect(
        screen
          .getByRole("heading", { name: title })
          .closest(".section-header")
          ?.getAttribute("data-title-max-lines"),
      ).toBe("2");
    }

    for (const { description } of repeatedHeaders) {
      expect(
        screen
          .getByText(description)
          .closest(".section-header")
          ?.getAttribute("data-description-max-lines"),
      ).toBe("2");
    }

    expect(patternsCss).toContain(
      '.section-header[data-description-max-lines="2"] .section-header__description',
    );
    expect(patternsCss).toContain("-webkit-line-clamp: 2;");
  });

  it("renders the content browser card for every content preset", () => {
    window.history.pushState({}, "", "/");
    render(<App />);

    for (const preset of [
      "centered-stack",
      "bottom-crop-card",
      "left-copy-right-card",
      "right-copy-left-card",
    ] as const) {
      applySectionPresetAttributes({ ...DEFAULT_SECTION_PRESETS, content: preset });

      expect(
        document.querySelector("#content .content-browser-shape .browser-frame__content"),
      ).toBeTruthy();
    }
  });

  it("applies card presets to repeated card grids", () => {
    expect(sectionsCss).toContain(":root[data-brandy-cards-preset=\"two-by-two\"]");
    expect(sectionsCss).toContain(
      ":root[data-brandy-cards-preset] :is(.feature-grid, .use-cases-grid, .how-it-works-grid)",
    );
    expect(sectionsCss).toContain("display: grid;");
    expect(sectionsCss).toContain(":root[data-brandy-cards-preset=\"three-two\"]");

    window.history.pushState({}, "", "/");
    render(<App />);

    const featureGrid = document.querySelector("#cards .feature-grid");
    expect(featureGrid).toBeTruthy();
    expect(document.querySelectorAll("#cards .feature-grid > .card").length).toBe(8);

    applySectionPresetAttributes({ ...DEFAULT_SECTION_PRESETS, cards: "two-by-two" });
    expect(document.documentElement.dataset.brandyCardsPreset).toBe("two-by-two");

    applySectionPresetAttributes({ ...DEFAULT_SECTION_PRESETS, cards: "one-by-two" });
    expect(document.documentElement.dataset.brandyCardsPreset).toBe("one-by-two");

    for (const preset of [
      "two-by-three",
      "two-by-four",
      "three-two",
    ] as const) {
      applySectionPresetAttributes({ ...DEFAULT_SECTION_PRESETS, cards: preset });
      expect(document.documentElement.dataset.brandyCardsPreset).toBe(preset);
    }
  });

  it("keeps repeated card groups in one row where required", () => {
    render(<App />);

    expect(
      document.querySelector("#bento .bento-grid")?.classList,
    ).toContain("one-row-card-grid");
    expect(sectionsCss).toContain(".grid.one-row-card-grid");
    expect(sectionsCss).toContain("display: flex;");
    expect(sectionsCss).toContain("flex-wrap: nowrap;");
    expect(sectionsCss).toContain("justify-content: center;");
    expect(sectionsCss).toContain("margin-inline: auto;");
  });
});
