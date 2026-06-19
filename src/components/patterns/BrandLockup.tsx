import { Coolshape } from "coolshapes-react/dist/esm/coolshapes.js";
import { useEffect, useState } from "react";
import { cn } from "../../lib/cn";
import {
  DEFAULT_DESIGN_OVERLAY_VALUES,
  DESIGN_OVERLAY_STORAGE_KEY,
  DESIGN_VALUES_CHANGE_EVENT,
  readStoredDesignValues,
  type DesignOverlayValues,
} from "../overlay/designOverlayModel";
import {
  resolveBrandMark,
  type BrandLockupProps,
  type CustomBrandMarkId,
  type ResolvedBrandMark,
} from "./brandLockupModel";

export function BrandLockup({
  className,
  label,
  live = true,
  mark,
  name,
  ...props
}: BrandLockupProps) {
  const liveValues = useLiveLockupValues(live && mark == null);
  const resolvedMark = resolveBrandMark(mark ?? liveValues.lockupShape);

  return (
    <span
      className={cn("brand-lockup", className)}
      data-brand-mark={resolvedMark.id}
      {...props}
    >
      <BrandMark mark={resolvedMark} />
      <span className="brand-lockup__wordmark">{name ?? label}</span>
    </span>
  );
}

function BrandMark({ mark }: { mark: ResolvedBrandMark }) {
  if (mark.kind === "coolshape") {
    return (
      <span aria-hidden="true" className="brand-lockup__mark">
        <Coolshape
          className="brand-lockup__coolshape"
          focusable="false"
          index={mark.index}
          noise={false}
          size={200}
          type={mark.type}
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className="brand-lockup__mark"
      data-shape={getCssShapeId(mark.id)}
    >
      <CustomBrandMark mark={mark.id} />
    </span>
  );
}

function CustomBrandMark({ mark }: { mark: CustomBrandMarkId }) {
  if (mark === "rounded-triangle") {
    return (
      <svg
        className="brand-lockup__svg"
        focusable="false"
        viewBox="0 0 100 100"
      >
        <path d="M50 8 C55 8 60 11 63 17 L93 79 C96 86 91 94 83 94 H17 C9 94 4 86 7 79 L37 17 C40 11 45 8 50 8 Z" />
      </svg>
    );
  }

  if (mark === "rounded-diamond") {
    return (
      <svg
        className="brand-lockup__svg"
        focusable="false"
        viewBox="0 0 100 100"
      >
        <path d="M43 8 C47 4 53 4 57 8 L92 43 C96 47 96 53 92 57 L57 92 C53 96 47 96 43 92 L8 57 C4 53 4 47 8 43 Z" />
      </svg>
    );
  }

  if (mark.startsWith("four-")) {
    return (
      <span className="brand-lockup__grid" data-grid-shape={getGridShape(mark)}>
        <span />
        <span />
        <span />
        <span />
      </span>
    );
  }

  return <span className="brand-lockup__shape" />;
}

function getCssShapeId(mark: CustomBrandMarkId): string {
  return mark.replaceAll("-", "_").replace("four_", "grid_");
}

function getGridShape(mark: CustomBrandMarkId): "circle" | "square" | "triangle" {
  if (mark === "four-circle-grid") return "circle";
  if (mark === "four-triangle-grid") return "triangle";
  return "square";
}

function useLiveLockupValues(enabled: boolean) {
  const [values, setValues] = useState<DesignOverlayValues>(() =>
    readStoredDesignValues(DEFAULT_DESIGN_OVERLAY_VALUES),
  );

  useEffect(() => {
    if (!enabled) return undefined;

    const handleValuesChange = (event: Event) => {
      const customEvent = event as CustomEvent<DesignOverlayValues>;
      if (customEvent.detail) setValues(customEvent.detail);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== DESIGN_OVERLAY_STORAGE_KEY) return;
      setValues(readStoredDesignValues(DEFAULT_DESIGN_OVERLAY_VALUES));
    };

    window.addEventListener(DESIGN_VALUES_CHANGE_EVENT, handleValuesChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(DESIGN_VALUES_CHANGE_EVENT, handleValuesChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [enabled]);

  return values;
}
