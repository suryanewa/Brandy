import { landingPage } from "../../content/landing";
import { BeforeAfter, SectionHeader } from "../patterns";
import { Container, Section, Split } from "../primitives";

export function Benefits() {
  return (
    <Section aria-labelledby="benefits-title" id="benefits" size="lg">
      <Container>
        <Split ratio="text-heavy">
          <SectionHeader
            align="left"
            description={landingPage.benefits.description}
            headingId="benefits-title"
            title={landingPage.benefits.title}
          />
          <BeforeAfter
            after={landingPage.benefits.after}
            before={landingPage.benefits.before}
          />
        </Split>
      </Container>
    </Section>
  );
}
