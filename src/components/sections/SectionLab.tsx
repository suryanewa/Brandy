import { landingPage } from "../../content/landing";
import { Container, Heading, Section, Stack, Text } from "../primitives";
import { Navbar } from "./Navbar";
import { pageSections } from "./registry";

export function SectionLab() {
  return (
    <>
      <Navbar />
      <main className="section-lab">
        <Section size="sm" variant="inverted">
          <Container>
            <Stack gap="sm">
              <Heading as="h1" size="h2">
                Section preview route
              </Heading>
              <Text size="body-lg">
                Inspect each {landingPage.brand.name} module independently before
                composing it into a landing page.
              </Text>
            </Stack>
          </Container>
        </Section>
        {pageSections.map(({ label, Component }) => (
          <div className="section-lab__item" key={label}>
            <div className="section-lab__label">{label}</div>
            <Component />
          </div>
        ))}
      </main>
    </>
  );
}
