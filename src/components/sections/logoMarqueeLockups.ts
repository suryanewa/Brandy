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

export type SourceLockup = {
  name: string;
  src: string;
  source: string;
  width: number;
  height: number;
};

export const SOURCE_LOCKUPS: readonly SourceLockup[] = [
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
];

export const GRID_LOGO_COUNT = 8;

export function getStaticLogoFitCount(containerWidth: number, group: HTMLElement): number {
  if (containerWidth <= 0) return 0;

  const items = group.querySelectorAll(".marquee__item");
  if (items.length === 0) return 0;

  const styles = getComputedStyle(group);
  const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
  let usedWidth = 0;
  let fitCount = 0;

  for (const item of items) {
    const itemWidth = item.getBoundingClientRect().width;
    const nextWidth = fitCount === 0 ? itemWidth : usedWidth + gap + itemWidth;
    if (nextWidth > containerWidth) break;
    usedWidth = nextWidth;
    fitCount += 1;
  }

  return fitCount;
}

export function getLockupStyle(lockup: SourceLockup): CSSProperties {
  return {
    "--source-lockup-aspect": lockup.width / lockup.height,
    "--source-lockup-src": `url("${lockup.src}")`,
  } as CSSProperties;
}
