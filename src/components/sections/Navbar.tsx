import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { landingPage } from "../../content/landing";
import { track } from "../../lib/analytics";
import { Button, Container } from "../primitives";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="navbar">
      <Container className="navbar__inner" size="xl">
        <a
          className="navbar__brand"
          href="#top"
          onClick={() => track("nav_brand_clicked")}
        >
          <span aria-hidden="true" />
          {landingPage.brand.name}
        </a>

        <nav aria-label="Primary navigation" className="navbar__links">
          {landingPage.nav.links.map((link) => (
            <a href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <Button
          analyticsEvent="nav_primary_cta_clicked"
          className="navbar__cta"
          href={landingPage.nav.cta.href}
          size="sm"
        >
          {landingPage.nav.cta.label}
          <ArrowRight aria-hidden="true" size={16} />
        </Button>

        <button
          aria-controls="mobile-menu"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          className="navbar__menu-button"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          {isOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        </button>
      </Container>

      <nav
        aria-label="Mobile navigation"
        className="mobile-menu"
        data-open={isOpen}
        id="mobile-menu"
      >
        {landingPage.nav.links.map((link) => (
          <a href={link.href} key={link.href} onClick={() => setIsOpen(false)}>
            {link.label}
          </a>
        ))}
        <Button
          analyticsEvent="mobile_nav_primary_cta_clicked"
          href={landingPage.nav.cta.href}
          onClick={() => setIsOpen(false)}
          size="sm"
        >
          {landingPage.nav.cta.label}
        </Button>
      </nav>
    </header>
  );
}
