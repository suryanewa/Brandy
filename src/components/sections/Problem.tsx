import { AlertTriangle } from "lucide-react";
import { landingPage } from "../../content/landing";
import { BrowserFrame, SectionHeader } from "../patterns";
import { Card, Container, Section, Split } from "../primitives";

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
          <BrowserFrame title="one-off-section.css">
            <div className="problem-visual">
              {landingPage.problem.items.map((item) => (
                <Card className="problem-row" key={item} variant="ghost">
                  <AlertTriangle aria-hidden="true" size={18} />
                  <span>{item}</span>
                </Card>
              ))}
            </div>
          </BrowserFrame>
        </Split>
      </Container>
    </Section>
  );
}
