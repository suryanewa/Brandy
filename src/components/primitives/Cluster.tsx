import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import type { ClusterAlign, ClusterGap } from "../../types/design-system";

type ClusterProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  gap?: ClusterGap;
  align?: ClusterAlign;
};

export function Cluster({
  children,
  className,
  gap = "md",
  align = "center",
  ...props
}: ClusterProps) {
  return (
    <div
      className={cn("cluster", className)}
      data-align={align}
      data-gap={gap}
      {...props}
    >
      {children}
    </div>
  );
}
