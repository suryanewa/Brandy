import { Heading, Stack, Text } from "../primitives";
import { cn } from "../../lib/cn";
import type { TextAlign } from "../../types/design-system";

type SectionHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  align?: TextAlign;
  className?: string;
  descriptionMaxLines?: 2;
  headingId?: string;
  titleMaxLines?: 2;
};

export function SectionHeader({
  title,
  description,
  descriptionMaxLines,
  eyebrow,
  align = "center",
  className,
  headingId,
  titleMaxLines,
}: SectionHeaderProps) {
  return (
    <Stack
      className={cn("section-header", className)}
      data-align={align}
      data-description-max-lines={descriptionMaxLines}
      data-title-max-lines={titleMaxLines}
      gap="sm"
    >
      {eyebrow ? <Text size="eyebrow">{eyebrow}</Text> : null}
      <Heading
        as="h2"
        className="section-header__title"
        id={headingId}
        size="h2"
      >
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
