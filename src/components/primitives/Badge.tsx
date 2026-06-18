import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import type { BadgeTone } from "../../types/design-system";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: BadgeTone;
};

export function Badge({
  children,
  className,
  tone = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span className={cn("badge", className)} data-tone={tone} {...props}>
      {children}
    </span>
  );
}
