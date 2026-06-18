import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import type { ContainerSize } from "../../types/design-system";

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  size?: ContainerSize;
};

export function Container({
  children,
  className,
  size = "lg",
  ...props
}: ContainerProps) {
  return (
    <div className={cn("container", className)} data-size={size} {...props}>
      {children}
    </div>
  );
}
