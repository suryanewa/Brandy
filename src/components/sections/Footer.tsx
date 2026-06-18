import { landingPage } from "../../content/landing";
import { Container } from "../primitives";

export function Footer() {
  return (
    <footer className="footer" id="footer">
      <Container className="footer__inner" size="xl">
        <div>
          <a className="footer__brand" href="#top">
            <span aria-hidden="true" />
            {landingPage.brand.name}
          </a>
          <p>{landingPage.brand.description}</p>
        </div>
        <nav aria-label="Footer navigation" className="footer__links">
          {landingPage.footer.links.map((link) => (
            <a href={link.href} key={link.label}>
              {link.label}
            </a>
          ))}
        </nav>
        <p className="footer__copyright">{landingPage.footer.copyright}</p>
      </Container>
    </footer>
  );
}
