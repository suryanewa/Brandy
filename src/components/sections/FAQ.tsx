import { landingPage } from "../../content/landing";
import { FAQAccordion, SectionHeader } from "../patterns";
import { Container, Section } from "../primitives";

export function FAQ() {
  return (
    <Section aria-labelledby="faq-title" id="faq" size="md">
      <Container size="md">
        <SectionHeader
          description={landingPage.faqIntro.description}
          headingId="faq-title"
          title={landingPage.faqIntro.title}
        />
        <FAQAccordion items={landingPage.faq} />
      </Container>
    </Section>
  );
}
