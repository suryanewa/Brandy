import type { ComponentType } from "react";
import { Benefits } from "./Benefits";
import { Demo } from "./Demo";
import { FAQ } from "./FAQ";
import { Features } from "./Features";
import { FinalCTA } from "./FinalCTA";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { LogoMarquee } from "./LogoMarquee";
import { Problem } from "./Problem";
import { Solution } from "./Solution";
import { Starter } from "./Starter";
import { UseCases } from "./UseCases";

export type PageSectionDefinition = {
  label: string;
  domId?: string;
  Component: ComponentType;
};

export const pageSections = [
  { label: "Hero", domId: "top", Component: Hero },
  { label: "LogoMarquee", Component: LogoMarquee },
  { label: "Problem", domId: "problem", Component: Problem },
  { label: "Solution", domId: "system", Component: Solution },
  { label: "HowItWorks", domId: "how-it-works", Component: HowItWorks },
  { label: "Features", domId: "sections", Component: Features },
  { label: "Demo", domId: "demo", Component: Demo },
  { label: "UseCases", domId: "use-cases", Component: UseCases },
  { label: "Benefits", domId: "benefits", Component: Benefits },
  { label: "Starter", domId: "starter", Component: Starter },
  { label: "FAQ", domId: "faq", Component: FAQ },
  { label: "FinalCTA", domId: "final-cta", Component: FinalCTA },
] satisfies PageSectionDefinition[];
