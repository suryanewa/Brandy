import { landingPage } from "../../content/landing";
import { BrowserFrame, DemoFrame, SectionHeader } from "../patterns";
import { Container, Section, Stack } from "../primitives";

export function Demo() {
  return (
    <Section aria-labelledby="demo-title" id="demo" size="lg">
      <Container size="xl">
        <Stack className="demo-section" gap="xl">
          <SectionHeader
            description={landingPage.demo.description}
            headingId="demo-title"
            title={landingPage.demo.title}
          />
          <BrowserFrame title="modules/composer.tsx">
            <DemoFrame
              demo={landingPage.demo}
              hero={landingPage.hero}
              layers={landingPage.layers}
            />
          </BrowserFrame>
        </Stack>
      </Container>
    </Section>
  );
}
