import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import type { StackGap } from "../../types/design-system";

type StackProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  gap?: StackGap;
};

export function Stack({
  children,
  className,
  gap = "md",
  ...props
}: StackProps) {
  return (
    <div className={cn("stack", className)} data-gap={gap} {...props}>
      {children}
    </div>
  );
}
