import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import type { SplitRatio } from "../../types/design-system";

type SplitProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  ratio?: SplitRatio;
};

export function Split({
  children,
  className,
  ratio = "even",
  ...props
}: SplitProps) {
  return (
    <div className={cn("split", className)} data-ratio={ratio} {...props}>
      {children}
    </div>
  );
}
