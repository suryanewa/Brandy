import { Heading, Stack, Text } from "../primitives";
import { cn } from "../../lib/cn";
import type { TextAlign } from "../../types/design-system";

type SectionHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  align?: TextAlign;
  className?: string;
  headingId?: string;
};

export function SectionHeader({
  title,
  description,
  eyebrow,
  align = "center",
  className,
  headingId,
}: SectionHeaderProps) {
  return (
    <Stack
      className={cn("section-header", className)}
      data-align={align}
      gap="sm"
    >
      {eyebrow ? <Text size="eyebrow">{eyebrow}</Text> : null}
      <Heading as="h2" id={headingId} size="h2">
        {title}
      </Heading>
      {description ? (
        <Text className="section-header__description" size="body-lg">
          {description}
        </Text>
      ) : null}
    </Stack>
  );
}
