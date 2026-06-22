import { ArrowRight } from "lucide-react";
import { landingPage } from "../../content/landing";
import { Button, Cluster, Container, Heading, Section, Stack, Text } from "../primitives";
import { HeroShaderLayer } from "./HeroShaderLayer";

export function Hero() {
  const titleLines = getBalancedLines(landingPage.hero.title, {
    preferredBreakAfter: ",",
  });
  const descriptionLines = getBalancedLines(landingPage.hero.description);

  return (
    <Section
      aria-labelledby="hero-title"
      className="hero-section"
      id="top"
      size="hero"
    >
      <HeroShaderLayer />
      <Container className="hero-grid" size="xl">
        <Stack className="hero-copy" gap="lg">
          <Stack className="hero-copy__content" gap="md">
            <Heading
              aria-label={landingPage.hero.title}
              as="h1"
              className="hero-copy__title"
              id="hero-title"
              size="display"
            >
              {titleLines.map((line) => (
                <span className="hero-copy__line" key={line}>
                  {line}
                </span>
              ))}
            </Heading>
            <Text className="hero-copy__description" size="body-lg">
              {descriptionLines.map((line) => (
                <span className="hero-copy__line" key={line}>
                  {line}
                </span>
              ))}
            </Text>
          </Stack>
          <Cluster className="hero-actions" align="center" gap="sm">
            <Button
              analyticsEvent="hero_primary_cta_clicked"
              href={landingPage.hero.primaryCta.href}
              size="lg"
            >
              {landingPage.hero.primaryCta.label}
              <ArrowRight aria-hidden="true" size={18} />
            </Button>
            <Button
              analyticsEvent="hero_secondary_cta_clicked"
              href={landingPage.hero.secondaryCta.href}
              size="lg"
              variant="secondary"
            >
              {landingPage.hero.secondaryCta.label}
            </Button>
          </Cluster>
        </Stack>
      </Container>
    </Section>
  );
}

function getBalancedLines(
  text: string,
  options: { preferredBreakAfter?: string } = {},
): [string, string] {
  const preferredBreakIndex = options.preferredBreakAfter
    ? text.indexOf(options.preferredBreakAfter)
    : -1;

  if (preferredBreakIndex > -1) {
    const preferredBreakAfter = options.preferredBreakAfter;

    if (!preferredBreakAfter) return [text, ""];

    return [
      text.slice(0, preferredBreakIndex + preferredBreakAfter.length).trim(),
      text.slice(preferredBreakIndex + preferredBreakAfter.length).trim(),
    ];
  }

  const words = text.split(/\s+/);
  if (words.length < 2) return [text, ""];

  const midpoint = text.length / 2;
  let bestIndex = 1;
  let bestDistance = Number.POSITIVE_INFINITY;
  let runningLength = 0;

  for (let index = 1; index < words.length; index += 1) {
    runningLength += words[index - 1].length + (index > 1 ? 1 : 0);
    const distance = Math.abs(runningLength - midpoint);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  }

  return [
    words.slice(0, bestIndex).join(" "),
    words.slice(bestIndex).join(" "),
  ];
}
