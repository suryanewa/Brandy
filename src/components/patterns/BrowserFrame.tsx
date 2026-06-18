import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type BrowserFrameProps = {
  children: ReactNode;
  title?: string;
  className?: string;
};

export function BrowserFrame({ children, title, className }: BrowserFrameProps) {
  return (
    <div className={cn("browser-frame", className)}>
      <div className="browser-frame__bar">
        <div className="browser-frame__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        {title ? <p>{title}</p> : null}
      </div>
      <div className="browser-frame__content">{children}</div>
    </div>
  );
}
