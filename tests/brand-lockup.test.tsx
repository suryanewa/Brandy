import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandLockup, CUSTOM_BRAND_MARK_IDS } from "../src/components/patterns";
import { Footer } from "../src/components/sections/Footer";
import { Navbar } from "../src/components/sections/Navbar";
import { landingPage } from "../src/content/landing";

describe("BrandLockup", () => {
  it("renders every custom brand mark id", () => {
    for (const mark of CUSTOM_BRAND_MARK_IDS) {
      const { container, unmount } = render(
        <BrandLockup mark={mark} name={`Brandy ${mark}`} />,
      );

      expect(screen.getByText(`Brandy ${mark}`)).toBeTruthy();
      expect(
        container.querySelector(`.brand-lockup[data-brand-mark="${mark}"]`),
      ).toBeTruthy();
      unmount();
    }
  });

  it("renders Coolshapes ids through coolshapes-react", () => {
    const { container } = render(
      <BrandLockup mark="coolshape:star:0" name="Brandy" />,
    );

    expect(screen.getByText("Brandy")).toBeTruthy();
    expect(
      container.querySelector(
        '.brand-lockup[data-brand-mark="coolshape:star:0"] svg.coolshapes',
      ),
    ).toBeTruthy();
  });

  it("accepts source-style Coolshapes ids", () => {
    const { container } = render(<BrandLockup mark="star-0" name="Brandy" />);

    expect(
      container.querySelector(
        '.brand-lockup[data-brand-mark="coolshape:star:0"] svg.coolshapes',
      ),
    ).toBeTruthy();
  });

  it("falls back to the default mark for unsupported ids", () => {
    const { container } = render(<BrandLockup mark="coolshape:star:999" name="Brandy" />);

    expect(
      container.querySelector('.brand-lockup[data-brand-mark="coolshape:star:0"]'),
    ).toBeTruthy();
  });

  it("is used by the navbar and footer brand links", () => {
    render(
      <>
        <Navbar />
        <Footer />
      </>,
    );

    const lockups = document.querySelectorAll(".brand-lockup");

    expect(lockups).toHaveLength(2);
    expect(screen.getAllByText(landingPage.brand.name)).toHaveLength(2);
  });
});
