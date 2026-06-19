import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";
import { pageSections } from "../src/components/sections";

describe("App", () => {
  it("renders the landing page by default", () => {
    window.history.pushState({}, "", "/");

    render(<App />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Brand surfaces, generated from seeds.",
      }),
    ).toBeTruthy();
    expect(document.querySelector("#hero-title")?.classList).toContain(
      "hero-copy__title",
    );
    expect(
      screen.getAllByRole("link", {
        name: /View system/,
      }).length,
    ).toBeGreaterThan(0);
  });

  it("renders the section lab route", () => {
    window.history.pushState({}, "", "/sections");

    render(<App />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Section preview route",
      }),
    ).toBeTruthy();
  });

  it("renders every registered section label in the section lab", () => {
    window.history.pushState({}, "", "/sections");

    render(<App />);

    const labels = Array.from(document.querySelectorAll(".section-lab__label")).map(
      (element) => element.textContent,
    );

    expect(labels).toEqual(pageSections.map(({ label }) => label));
  });

  it("renders every registered landing page DOM id", () => {
    window.history.pushState({}, "", "/");

    render(<App />);

    const registeredIds = pageSections.flatMap(({ domId }) =>
      domId ? [domId] : [],
    );

    expect(registeredIds).not.toHaveLength(0);
    for (const id of registeredIds) {
      expect(document.getElementById(id)).toBeTruthy();
    }
  });

  it("labels major sections with their heading ids", () => {
    window.history.pushState({}, "", "/");

    render(<App />);

    expect(document.querySelector("#sections")?.getAttribute("aria-labelledby")).toBe(
      "features-title",
    );
    expect(document.querySelector("#faq")?.getAttribute("aria-labelledby")).toBe(
      "faq-title",
    );
    expect(
      document.querySelector("#final-cta")?.getAttribute("aria-labelledby"),
    ).toBe("final-cta-title");
  });
});
