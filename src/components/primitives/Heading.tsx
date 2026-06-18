import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import type { HeadingElement, HeadingSize } from "../../types/design-system";

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  children: ReactNode;
  as?: HeadingElement;
  size?: HeadingSize;
};

export function Heading({
  children,
  as: Component = "h2",
  className,
  size = "h2",
  ...props
}: HeadingProps) {
  return (
    <Component className={cn(`text-${size}`, className)} {...props}>
      {children}
    </Component>
  );
}
