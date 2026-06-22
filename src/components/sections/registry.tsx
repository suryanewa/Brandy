import type { ComponentType } from "react";
import { Bento } from "./Bento";
import { Cards } from "./Cards";
import { Content } from "./Content";
import { FAQ } from "./FAQ";
import { FinalCTA } from "./FinalCTA";
import { Hero } from "./Hero";
import { LogoMarquee } from "./LogoMarquee";

export type PageSectionDefinition = {
  label: string;
  domId?: string;
  Component: ComponentType;
};

export const pageSections = [
  { label: "Hero", domId: "top", Component: Hero },
  { label: "LogoMarquee", Component: LogoMarquee },
  { label: "Content", domId: "content", Component: Content },
  { label: "Cards", domId: "cards", Component: Cards },
  { label: "Bento", domId: "bento", Component: Bento },
  { label: "FAQ", domId: "faq", Component: FAQ },
  { label: "FinalCTA", domId: "final-cta", Component: FinalCTA },
] satisfies PageSectionDefinition[];
