import { landingPage } from "../../content/landing";
import { SectionHeader } from "../patterns";
import { Card, Container, Grid, Heading, Section, Stack, Text } from "../primitives";

export function HowItWorks() {
  return (
    <Section aria-labelledby="how-it-works-title" id="how-it-works" size="md">
      <Container className="how-it-works-layout">
        <SectionHeader
          description={landingPage.systemMap.description}
          descriptionMaxLines={2}
          headingId="how-it-works-title"
          title={landingPage.systemMap.title}
          titleMaxLines={2}
        />
        <Grid className="centered-card-grid one-row-card-grid how-it-works-grid" columns={3}>
          {landingPage.howItWorks.map((step) => (
            <Card className="step-card" key={step.title}>
              <Stack gap="sm">
                <span className="step-card__index">{step.layer}</span>
                <Heading as="h3" size="h3">
                  {step.title}
                </Heading>
                <Text>{step.description}</Text>
              </Stack>
            </Card>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
