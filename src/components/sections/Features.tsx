import { landingPage } from "../../content/landing";
import { FeatureGrid, SectionHeader } from "../patterns";
import { Container, Section } from "../primitives";

export function Features() {
  return (
    <Section
      aria-labelledby="features-title"
      id="sections"
      size="lg"
      variant="muted"
    >
      <Container>
        <SectionHeader
          description={landingPage.featureOverview.description}
          headingId="features-title"
          title={landingPage.featureOverview.title}
        />
        <FeatureGrid items={landingPage.features} />
      </Container>
    </Section>
  );
}
