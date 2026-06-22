import { useLayoutEffect } from "react";
import { initHeroBackground } from "./heroBackgroundRuntime";

export function HeroVisualBootstrap() {
  useLayoutEffect(() => {
    initHeroBackground();
  }, []);

  return null;
}
