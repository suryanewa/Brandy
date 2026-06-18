import { ArrowRight } from "lucide-react";
import { landingPage } from "../../content/landing";
import { Button, Container, Heading, Section, Stack, Text } from "../primitives";

export function FinalCTA() {
  return (
    <Section
      aria-labelledby="final-cta-title"
      className="final-cta-section"
      id="final-cta"
      size="md"
      variant="accent"
    >
      <Container className="final-cta" size="md">
        <Stack gap="md">
          <Heading as="h2" id="final-cta-title" size="h2">
            {landingPage.finalCta.title}
          </Heading>
          <Text size="body-lg">{landingPage.finalCta.description}</Text>
          <Button
            analyticsEvent="final_cta_clicked"
            href={landingPage.finalCta.cta.href}
            size="lg"
            variant="secondary"
          >
            {landingPage.finalCta.cta.label}
            <ArrowRight aria-hidden="true" size={18} />
          </Button>
        </Stack>
      </Container>
    </Section>
  );
}
