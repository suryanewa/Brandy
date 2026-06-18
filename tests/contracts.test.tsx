import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";
import { Button, Section } from "../src/components/primitives";
import { landingPage } from "../src/content/landing";

const supportedSwatches = new Set(["green", "white", "radius"]);

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
});
