import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import type { SectionSize, SectionVariant } from "../../types/design-system";

type SectionProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  variant?: SectionVariant;
  size?: SectionSize;
};

export function Section({
  children,
  className,
  variant = "default",
  size = "md",
  ...props
}: SectionProps) {
  return (
    <section
      className={cn("section", className)}
      data-size={size}
      data-variant={variant}
      {...props}
    >
      {children}
    </section>
  );
}
