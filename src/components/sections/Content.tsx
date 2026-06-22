import { landingPage } from "../../content/landing";
import { BrowserFrame, SectionHeader } from "../patterns";
import { Container, Section, Split } from "../primitives";

export function Content() {
  return (
    <Section aria-labelledby="content-title" id="content" size="lg">
      <Container size="xl">
        <Split className="content-layout" ratio="text-heavy">
          <SectionHeader
            description={landingPage.demo.description}
            descriptionMaxLines={2}
            headingId="content-title"
            title={landingPage.demo.title}
            titleMaxLines={2}
          />
          <div aria-hidden="true" className="content-browser-shape">
            <BrowserFrame>{null}</BrowserFrame>
          </div>
        </Split>
      </Container>
    </Section>
  );
}
