import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import type { CardVariant } from "../../types/design-system";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  variant?: CardVariant;
};

export function Card({
  children,
  className,
  variant = "default",
  ...props
}: CardProps) {
  return (
    <div className={cn("card", className)} data-variant={variant} {...props}>
      {children}
    </div>
  );
}
