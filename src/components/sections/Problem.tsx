import { landingPage } from "../../content/landing";
import { SectionHeader } from "../patterns";
import { Container, Section, Split } from "../primitives";

export function Problem() {
  return (
    <Section aria-labelledby="problem-title" id="problem" size="md">
      <Container>
        <Split ratio="text-heavy">
          <SectionHeader
            align="left"
            description={landingPage.problem.description}
            headingId="problem-title"
            title={landingPage.problem.title}
          />
          <div className="problem-empty-shape" aria-hidden="true" />
        </Split>
      </Container>
    </Section>
  );
}
