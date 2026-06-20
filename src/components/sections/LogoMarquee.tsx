import { useEffect, useRef, useState } from "react";
import { Marquee } from "../patterns";
import { Container, Section } from "../primitives";
import {
  getLockupStyle,
  GRID_LOGO_COUNT,
  SOURCE_LOCKUPS,
  type SourceLockup,
} from "./logoMarqueeLockups";
import { useStaticLogoFitCount } from "./useStaticLogoFitCount";

const LOGOS_PRESET_CHANGE_EVENT = "brandy:section-presets-change";

function readLogosPreset() {
  if (typeof document === "undefined") return "marquee";
  return document.documentElement.dataset.brandyLogosPreset ?? "marquee";
}

function useLogosPreset() {
  const [preset, setPreset] = useState(readLogosPreset);

  useEffect(() => {
    const syncPreset = () => setPreset(readLogosPreset());
    window.addEventListener(LOGOS_PRESET_CHANGE_EVENT, syncPreset);
    return () => window.removeEventListener(LOGOS_PRESET_CHANGE_EVENT, syncPreset);
  }, []);

  return preset;
}

function LockupMark({ lockup }: { lockup: SourceLockup }) {
  return (
    <span
      aria-label={`${lockup.name} placeholder lockup from ${lockup.source}`}
      className="source-lockup"
      role="img"
      style={getLockupStyle(lockup)}
    />
  );
}

function LockupMeasureRow({ lockups }: { lockups: readonly SourceLockup[] }) {
  return (
    <>
      {lockups.map((lockup) => (
        <span className="marquee__item" key={`${lockup.source}-${lockup.name}`}>
          <LockupMark lockup={lockup} />
        </span>
      ))}
    </>
  );
}

export function LogoMarquee() {
  const logosPreset = useLogosPreset();
  const viewportRef = useRef<HTMLDivElement>(null);
  const measureGroupRef = useRef<HTMLDivElement>(null);
  const isStaticPreset = logosPreset === "static";
  const staticFitCount = useStaticLogoFitCount(
    viewportRef,
    measureGroupRef,
    isStaticPreset,
    SOURCE_LOCKUPS.length,
  );

  const visibleLockups =
    logosPreset === "grid"
      ? SOURCE_LOCKUPS.slice(0, GRID_LOGO_COUNT)
      : isStaticPreset
        ? SOURCE_LOCKUPS.slice(0, staticFitCount)
        : SOURCE_LOCKUPS;

  return (
    <Section className="logo-marquee-section" size="sm" variant="muted">
      <Container size="xl">
        <div className="logo-marquee__viewport" ref={viewportRef}>
          {isStaticPreset ? (
            <div className="logo-marquee-static-measure" aria-hidden="true">
              <div className="marquee__group" ref={measureGroupRef}>
                <LockupMeasureRow lockups={SOURCE_LOCKUPS} />
              </div>
            </div>
          ) : null}
          <Marquee
            items={visibleLockups.map((lockup) => (
              <LockupMark key={`${lockup.source}-${lockup.name}`} lockup={lockup} />
            ))}
            label="Source placeholder brand lockups"
          />
        </div>
      </Container>
    </Section>
  );
}
