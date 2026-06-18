import { LandingPage, SectionLab } from "./components/sections";
import { DesignOverlay } from "./components/overlay";

export function App() {
  const isSectionLab =
    window.location.pathname === "/sections" ||
    window.location.pathname === "/sections/";

  return (
    <>
      {isSectionLab ? <SectionLab /> : <LandingPage />}
      <DesignOverlay />
    </>
  );
}
