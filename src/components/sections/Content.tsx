import { landingPage } from "../../content/landing";
import { SectionHeader } from "../patterns";
import { Container, Section, Stack } from "../primitives";

export function Content() {
  return (
    <Section aria-labelledby="content-title" id="content" size="lg">
      <Container size="xl">
        <Stack className="content-section" gap="xl">
          <SectionHeader
            description={landingPage.demo.description}
            descriptionMaxLines={2}
            headingId="content-title"
            title={landingPage.demo.title}
            titleMaxLines={2}
          />
          <div aria-hidden="true" className="browser-frame content-browser-shape" />
        </Stack>
      </Container>
    </Section>
  );
}
