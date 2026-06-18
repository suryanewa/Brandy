import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import type { GridColumns } from "../../types/design-system";

type GridProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  columns?: GridColumns;
};

export function Grid({
  children,
  className,
  columns = 3,
  ...props
}: GridProps) {
  return (
    <div className={cn("grid", className)} data-columns={columns} {...props}>
      {children}
    </div>
  );
}
