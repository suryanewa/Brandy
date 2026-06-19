import { landingPage } from "../../content/landing";
import { SectionHeader } from "../patterns";
import { Container, Section, Split, Stack } from "../primitives";

export function Solution() {
  return (
    <Section aria-labelledby="system-title" id="system" size="lg" variant="muted">
      <Container>
        <Split ratio="visual-heavy">
          <div className="solution-empty-shape" aria-hidden="true" />

          <Stack gap="lg">
            <SectionHeader
              align="left"
              description={landingPage.solution.description}
              headingId="system-title"
              title={landingPage.solution.title}
            />
          </Stack>
        </Split>
      </Container>
    </Section>
  );
}
