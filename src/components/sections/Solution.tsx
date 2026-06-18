import { Check } from "lucide-react";
import { landingPage } from "../../content/landing";
import { BrowserFrame, SectionHeader } from "../patterns";
import { Badge, Card, Container, Section, Split, Stack } from "../primitives";

export function Solution() {
  return (
    <Section aria-labelledby="system-title" id="system" size="lg" variant="muted">
      <Container>
        <Split ratio="visual-heavy">
          <BrowserFrame title="system-contract.ts">
            <div className="solution-visual">
              {landingPage.layers.map((layer, index) => (
                <div className="system-layer-row" key={layer.title}>
                  <Badge tone={index === 0 ? "accent" : "neutral"}>
                    {String(index + 1).padStart(2, "0")}
                  </Badge>
                  <div>
                    <strong>{layer.title}</strong>
                    <p>{layer.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </BrowserFrame>

          <Stack gap="lg">
            <SectionHeader
              align="left"
              description={landingPage.solution.description}
              headingId="system-title"
              title={landingPage.solution.title}
            />
            <Card className="solution-checks">
              {landingPage.solution.checks.map((check) => (
                <span key={check}>
                  <Check aria-hidden="true" size={16} />
                  {check}
                </span>
              ))}
            </Card>
          </Stack>
        </Split>
      </Container>
    </Section>
  );
}
