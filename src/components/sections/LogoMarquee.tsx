import type { CSSProperties } from "react";
import amsterdamLockup from "../../assets/lockups/amsterdam-colored.svg";
import araratLockup from "../../assets/lockups/ararat-colored.svg";
import atlanticLockup from "../../assets/lockups/atlantic-colored.svg";
import baselLockup from "../../assets/lockups/basel-colored.svg";
import coloradoLockup from "../../assets/lockups/colorado-colored.svg";
import hamiltonLockup from "../../assets/lockups/hamilton-colored.svg";
import hudsonLockup from "../../assets/lockups/hudson-colored.svg";
import luxLockup from "../../assets/lockups/lux-colored.svg";
import nairobiLockup from "../../assets/lockups/nairobi-colored.svg";
import { Marquee } from "../patterns";
import { Container, Section } from "../primitives";

const sourceLockups = [
  {
    name: "Amsterdam",
    src: amsterdamLockup,
    source: "LogoToUse",
    width: 772,
    height: 90,
  },
  {
    name: "Colorado",
    src: coloradoLockup,
    source: "LogoToUse",
    width: 397,
    height: 90,
  },
  {
    name: "Ararat",
    src: araratLockup,
    source: "LogoToUse",
    width: 305,
    height: 90,
  },
  {
    name: "Nairobi",
    src: nairobiLockup,
    source: "LogoToUse",
    width: 346,
    height: 90,
  },
  {
    name: "Hamilton",
    src: hamiltonLockup,
    source: "LogoToUse",
    width: 392,
    height: 90,
  },
  {
    name: "Atlantic",
    src: atlanticLockup,
    source: "LogoToUse",
    width: 330,
    height: 90,
  },
  {
    name: "Basel",
    src: baselLockup,
    source: "LogoToUse",
    width: 274,
    height: 90,
  },
  {
    name: "Hudson",
    src: hudsonLockup,
    source: "LogoToUse",
    width: 338,
    height: 90,
  },
  {
    name: "Lux",
    src: luxLockup,
    source: "LogoToUse",
    width: 110,
    height: 90,
  },
] as const;

export function LogoMarquee() {
  return (
    <Section className="logo-marquee-section" size="sm" variant="muted">
      <Container size="xl">
        <Marquee
          items={sourceLockups.map((lockup) => (
            <span
              aria-label={`${lockup.name} placeholder lockup from ${lockup.source}`}
              className="source-lockup"
              key={`${lockup.source}-${lockup.name}`}
              role="img"
              style={
                {
                  "--source-lockup-aspect": lockup.width / lockup.height,
                  "--source-lockup-src": `url("${lockup.src}")`,
                } as CSSProperties
              }
            />
          ))}
          label="Source placeholder brand lockups"
        />
      </Container>
    </Section>
  );
}
