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
          descriptionMaxLines={2}
          headingId="features-title"
          title={landingPage.featureOverview.title}
          titleMaxLines={2}
        />
        <FeatureGrid items={landingPage.features} />
      </Container>
    </Section>
  );
}
