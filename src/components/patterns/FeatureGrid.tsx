import type { FeatureItem } from "../../types/landing";
import { Card, Grid, Heading, Stack, Text } from "../primitives";

/** Largest card preset (`two-by-four`) needs eight slots. */
const CARD_GRID_SLOT_COUNT = 8;

type FeatureGridProps = {
  items: FeatureItem[];
};

function expandCardItems(items: FeatureItem[]) {
  if (items.length === 0) return [];

  return Array.from({ length: CARD_GRID_SLOT_COUNT }, (_, index) => items[index % items.length]!);
}

export function FeatureGrid({ items }: FeatureGridProps) {
  const cardItems = expandCardItems(items);

  return (
    <Grid className="feature-grid" columns={4}>
      {cardItems.map((item, index) => (
        <Card key={`${item.title}-${index}`}>
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
