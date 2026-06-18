import type { FeatureItem } from "../../types/landing";
import { Card, Grid, Heading, Stack, Text } from "../primitives";

type FeatureGridProps = {
  items: FeatureItem[];
};

export function FeatureGrid({ items }: FeatureGridProps) {
  return (
    <Grid className="feature-grid" columns={4}>
      {items.map((item) => (
        <Card key={item.title}>
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
