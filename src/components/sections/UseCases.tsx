import { landingPage } from "../../content/landing";
import { SectionHeader } from "../patterns";
import { Badge, Card, Container, Grid, Heading, Section, Stack, Text } from "../primitives";

export function UseCases() {
  return (
    <Section
      aria-labelledby="use-cases-title"
      id="use-cases"
      size="md"
      variant="muted"
    >
      <Container>
        <SectionHeader
          description={landingPage.useCaseOverview.description}
          headingId="use-cases-title"
          title={landingPage.useCaseOverview.title}
        />
        <Grid columns={3}>
          {landingPage.useCases.map((item, index) => (
            <Card key={item.audience} variant={index === 0 ? "raised" : "default"}>
              <Stack gap="sm">
                <Badge tone={index === 0 ? "accent" : "blue"}>{item.audience}</Badge>
                <Heading as="h3" size="h4">
                  {item.title}
                </Heading>
                <Text>{item.description}</Text>
              </Stack>
            </Card>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
