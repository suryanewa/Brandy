import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type MarqueeProps = {
  items: Array<string | ReactNode>;
  label?: string;
  className?: string;
};

export function Marquee({ items, label, className }: MarqueeProps) {
  const doubledItems = [...items, ...items];

  return (
    <div className={cn("marquee", className)} aria-label={label}>
      <div className="marquee__track">
        {doubledItems.map((item, index) => (
          <span className="marquee__item" key={`${String(item)}-${index}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
