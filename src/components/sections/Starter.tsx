import { landingPage } from "../../content/landing";
import { PricingCards, SectionHeader, TestimonialGrid } from "../patterns";
import { Container, Section, Stack } from "../primitives";

export function Starter() {
  return (
    <Section aria-labelledby="starter-title" id="starter" size="lg" variant="muted">
      <Container>
        <Stack gap="xl">
          <SectionHeader
            description={landingPage.starter.description}
            descriptionMaxLines={2}
            headingId="starter-title"
            title={landingPage.starter.title}
            titleMaxLines={2}
          />
          <PricingCards />
          <TestimonialGrid items={landingPage.proofItems} />
        </Stack>
      </Container>
    </Section>
  );
}
