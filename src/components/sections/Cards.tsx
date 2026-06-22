import { landingPage } from "../../content/landing";
import { FeatureGrid, SectionHeader } from "../patterns";
import { Container, Section } from "../primitives";

export function Cards() {
  return (
    <Section
      aria-labelledby="cards-title"
      id="cards"
      size="lg"
      variant="muted"
    >
      <Container>
        <SectionHeader
          description={landingPage.featureOverview.description}
          descriptionMaxLines={2}
          headingId="cards-title"
          title={landingPage.featureOverview.title}
          titleMaxLines={2}
        />
        <FeatureGrid items={landingPage.features} />
      </Container>
    </Section>
  );
}
