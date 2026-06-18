import { Card, Grid, Heading, Stack, Text } from "../primitives";
import type { FeatureItem } from "../../types/landing";

type TestimonialGridProps = {
  items: FeatureItem[];
};

export function TestimonialGrid({ items }: TestimonialGridProps) {
  return (
    <Grid columns={3}>
      {items.map((item) => (
        <Card key={item.title} variant="ghost">
          <Stack gap="sm">
            <Heading as="h3" size="h4">
              {item.title}
            </Heading>
            <Text>{item.description}</Text>
          </Stack>
        </Card>
      ))}
    </Grid>
  );
}
