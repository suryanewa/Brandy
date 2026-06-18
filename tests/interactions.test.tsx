import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FAQAccordion } from "../src/components/patterns/FAQAccordion";
import { DemoFrame } from "../src/components/patterns/DemoFrame";
import { Navbar } from "../src/components/sections/Navbar";
import { landingPage } from "../src/content/landing";
import type { LandingPageContent } from "../src/types/landing";

function collectAnalyticsEvents() {
  const events: Array<CustomEvent["detail"]> = [];

  window.addEventListener("brandy:analytics", (event) => {
    events.push((event as CustomEvent).detail);
  });

  return events;
}

describe("interactive semantics", () => {
  it("exposes demo layer and module names with pressed state", () => {
    render(
      <DemoFrame
        demo={landingPage.demo}
        hero={landingPage.hero}
        layers={landingPage.layers}
      />,
    );

    const tokenLayer = screen.getByRole("button", { name: "Generated tokens" });
    const heroModule = screen.getByRole("button", { name: "Hero" });

    expect(tokenLayer.getAttribute("aria-pressed")).toBe("true");
    expect(heroModule.getAttribute("aria-pressed")).toBe("true");

    const faqModule = screen.getByRole("button", { name: "FAQ" });
    fireEvent.click(faqModule);

    expect(heroModule.getAttribute("aria-pressed")).toBe("false");
    expect(faqModule.getAttribute("aria-pressed")).toBe("true");
  });

  it("keeps one-module demo content renderable", () => {
    const oneModuleDemo = {
      ...landingPage.demo,
      modules: ["Navbar"],
    } satisfies LandingPageContent["demo"];

    render(
      <DemoFrame
        demo={oneModuleDemo}
        hero={landingPage.hero}
        layers={landingPage.layers}
      />,
    );

    expect(screen.getByRole("button", { name: "Navbar" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(screen.getByText('section: "Navbar"')).toBeTruthy();
  });

  it("tracks FAQ analytics only when an item opens", () => {
    const events = collectAnalyticsEvents();
    render(<FAQAccordion items={landingPage.faq} />);

    const closedQuestion = screen.getByRole("button", {
      name: landingPage.faq[1].question,
    });

    fireEvent.click(closedQuestion);
    fireEvent.click(closedQuestion);

    expect(events).toEqual([
      {
        eventName: "faq_item_opened",
        payload: { question: landingPage.faq[1].question },
      },
    ]);
  });

  it("renders the mobile menu as navigation and closes after the CTA is clicked", () => {
    render(<Navbar />);

    expect(
      screen.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeTruthy();

    const toggle = screen.getByRole("button", { name: "Toggle navigation" });
    fireEvent.click(toggle);

    expect(toggle.getAttribute("aria-expanded")).toBe("true");

    const mobileNavigation = screen.getByRole("navigation", {
      name: "Mobile navigation",
    });
    const mobileCta = screen.getAllByRole("link", {
      name: landingPage.nav.cta.label,
    })[1];

    expect(mobileNavigation.contains(mobileCta)).toBe(true);

    fireEvent.click(mobileCta);

    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });
});
