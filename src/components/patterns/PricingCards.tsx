import { Check } from "lucide-react";
import type { LandingPageContent } from "../../types/landing";
import { Button, Card, Heading, Stack, Text } from "../primitives";

type PricingCardsProps = {
  starter: LandingPageContent["starter"];
};

export function PricingCards({ starter }: PricingCardsProps) {
  return (
    <Card className="starter-card" variant="raised">
      <Stack gap="lg">
        <Stack gap="sm">
          <Heading as="h3" size="h3">
            {starter.planName}
          </Heading>
          <Text>{starter.description}</Text>
        </Stack>
        <div className="starter-list">
          {starter.items.map((item) => (
            <span key={item}>
              <Check aria-hidden="true" size={16} />
              {item}
            </span>
          ))}
        </div>
        <Button href="#sections" variant="primary">
          Explore modules
        </Button>
      </Stack>
    </Card>
  );
}
