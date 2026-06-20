import {
  useLayoutEffect,
  useState,
  type RefObject,
} from "react";
import { getStaticLogoFitCount } from "./logoMarqueeLockups";

export function useStaticLogoFitCount(
  viewportRef: RefObject<HTMLDivElement | null>,
  measureGroupRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
  lockupCount: number,
) {
  const [fitCount, setFitCount] = useState(lockupCount);

  useLayoutEffect(() => {
    if (!enabled) return;

    const measure = () => {
      const viewport = viewportRef.current;
      const group = measureGroupRef.current;
      if (!viewport || !group) return;

      const nextCount = getStaticLogoFitCount(viewport.clientWidth, group);
      setFitCount(nextCount);
    };

    measure();

    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    window.addEventListener("load", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("load", measure);
    };
  }, [enabled, lockupCount, measureGroupRef, viewportRef]);

  return enabled ? fitCount : lockupCount;
}
