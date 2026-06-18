import { landingPage } from "../../content/landing";
import { Marquee } from "../patterns";
import { Container, Section } from "../primitives";

export function LogoMarquee() {
  return (
    <Section className="logo-marquee-section" size="sm" variant="muted">
      <Container size="xl">
        <Marquee
          items={landingPage.layers.map((layer) => layer.title)}
          label="Landing page system layers"
        />
      </Container>
    </Section>
  );
}
