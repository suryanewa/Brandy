import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import type { TextSize } from "../../types/design-system";

type TextProps = HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode;
  size?: TextSize;
};

export function Text({
  children,
  className,
  size = "body",
  ...props
}: TextProps) {
  return (
    <p className={cn(`text-${size}`, className)} {...props}>
      {children}
    </p>
  );
}
