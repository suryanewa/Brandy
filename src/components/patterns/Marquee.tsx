import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type MarqueeProps = {
  items: Array<string | ReactNode>;
  label?: string;
  className?: string;
};

export function Marquee({ items, label, className }: MarqueeProps) {
  return (
    <div className={cn("marquee", className)} aria-label={label}>
      <div className="marquee__track">
        <MarqueeGroup items={items} />
        <MarqueeGroup items={items} ariaHidden />
      </div>
    </div>
  );
}

function MarqueeGroup({
  ariaHidden = false,
  items,
}: {
  ariaHidden?: boolean;
  items: Array<string | ReactNode>;
}) {
  return (
    <div className="marquee__group" aria-hidden={ariaHidden || undefined}>
      {items.map((item, index) => (
        <span className="marquee__item" key={index}>
          {item}
        </span>
      ))}
    </div>
  );
}
