import { ArrowRight } from "lucide-react";
import { landingPage } from "../../content/landing";
import { BrowserFrame, DemoFrame } from "../patterns";
import { Button, Cluster, Container, Heading, Section, Stack, Text } from "../primitives";

export function Hero() {
  return (
    <Section
      aria-labelledby="hero-title"
      className="hero-section"
      id="top"
      size="hero"
    >
      <Container className="hero-grid" size="xl">
        <Stack className="hero-copy" gap="lg">
          <Stack gap="md">
            <Heading as="h1" id="hero-title" size="display">
              {landingPage.hero.title}
            </Heading>
            <Text className="hero-copy__description" size="body-lg">
              {landingPage.hero.description}
            </Text>
          </Stack>
          <Cluster className="hero-actions" align="start" gap="sm">
            <Button
              analyticsEvent="hero_primary_cta_clicked"
              href={landingPage.hero.primaryCta.href}
              size="lg"
            >
              {landingPage.hero.primaryCta.label}
              <ArrowRight aria-hidden="true" size={18} />
            </Button>
            <Button
              analyticsEvent="hero_secondary_cta_clicked"
              href={landingPage.hero.secondaryCta.href}
              size="lg"
              variant="secondary"
            >
              {landingPage.hero.secondaryCta.label}
            </Button>
          </Cluster>
        </Stack>

        <BrowserFrame className="hero-browser" title="brandy.system/page.tsx">
          <DemoFrame
            demo={landingPage.demo}
            hero={landingPage.hero}
            layers={landingPage.layers}
          />
        </BrowserFrame>
      </Container>
    </Section>
  );
}
