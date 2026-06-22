import { describe, expect, it } from "vitest";
import { landingPage } from "../src/content/landing";

describe("landing content", () => {
  it("keeps repeated module copy in structured content", () => {
    expect(landingPage.layers).toHaveLength(5);
    expect(landingPage.features.length).toBeGreaterThanOrEqual(4);
    expect(landingPage.faq.length).toBeGreaterThanOrEqual(4);
  });

  it("defines CTA targets for the main persuasion path", () => {
    expect(landingPage.hero.primaryCta.href).toBe("#content");
    expect(landingPage.hero.secondaryCta.href).toBe("#cards");
    expect(landingPage.finalCta.cta.href).toBe("#cards");
  });
});
