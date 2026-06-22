import { FontLab, LandingPage, SectionLab } from "./components/sections";
import { DesignOverlay } from "./components/overlay";
import { HeroVisualBootstrap } from "./components/overlay/HeroVisualBootstrap";

function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname === `${route}/`;
}

export function App() {
  const { pathname } = window.location;
  const isSectionLab = matchesRoute(pathname, "/sections");
  const isFontLab = matchesRoute(pathname, "/fonts");

  return (
    <>
      <HeroVisualBootstrap />
      {isSectionLab ? (
        <SectionLab />
      ) : isFontLab ? (
        <FontLab />
      ) : (
        <LandingPage />
      )}
      <DesignOverlay />
    </>
  );
}
