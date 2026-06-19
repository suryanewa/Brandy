import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";
import { Button, Section } from "../src/components/primitives";
import { landingPage } from "../src/content/landing";

const supportedSwatches = new Set(["green", "white", "radius"]);
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
    expect(sectionsCss).toContain(".section.logo-marquee-section");
    expect(sectionsCss).toContain(".section.final-cta-section");
    expect(sectionsCss).toContain("block-size: auto;");
    expect(sectionsCss).not.toContain("#demo");
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
      landingPage.useCaseOverview,
      landingPage.starter,
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

  it("keeps repeated card groups in one row where required", () => {
    render(<App />);

    expect(
      document.querySelector("#how-it-works .how-it-works-grid")?.classList,
    ).toContain("one-row-card-grid");
    expect(
      document.querySelector("#use-cases .use-cases-grid")?.classList,
    ).toContain("one-row-card-grid");
    expect(sectionsCss).toContain(".grid.one-row-card-grid");
    expect(sectionsCss).toContain("display: flex;");
    expect(sectionsCss).toContain("flex-wrap: nowrap;");
    expect(sectionsCss).toContain("justify-content: center;");
    expect(sectionsCss).toContain("margin-inline: auto;");
  });
});
