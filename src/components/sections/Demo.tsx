import { landingPage } from "../../content/landing";
import { SectionHeader } from "../patterns";
import { Container, Section, Stack } from "../primitives";

export function Demo() {
  return (
    <Section aria-labelledby="demo-title" id="demo" size="lg">
      <Container size="xl">
        <Stack className="demo-section" gap="xl">
          <SectionHeader
            description={landingPage.demo.description}
            descriptionMaxLines={2}
            headingId="demo-title"
            title={landingPage.demo.title}
            titleMaxLines={2}
          />
          <div aria-hidden="true" className="browser-frame demo-browser-shape" />
        </Stack>
      </Container>
    </Section>
  );
}
