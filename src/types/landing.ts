export type Cta = {
  label: string;
  href: string;
};

export type NavLink = {
  label: string;
  href: string;
};

export type NonEmptyArray<T> = readonly [T, ...T[]];

export type SectionHeaderContent = {
  title: string;
  description?: string;
  eyebrow?: string;
};

export type FeatureItem = {
  title: string;
  description: string;
};

export type UseCase = FeatureItem & {
  audience: string;
};

export type StepItem = FeatureItem & {
  layer: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type DemoTokenSet = {
  label: string;
  value: string;
  swatch: "green" | "white" | "radius";
};

export type LandingPageContent = {
  brand: {
    name: string;
    description: string;
  };
  nav: {
    links: NavLink[];
    cta: Cta;
  };
  hero: SectionHeaderContent & {
    primaryCta: Cta;
    secondaryCta: Cta;
  };
  layers: NonEmptyArray<FeatureItem>;
  systemMap: SectionHeaderContent;
  problem: SectionHeaderContent & {
    items: string[];
  };
  solution: SectionHeaderContent & {
    checks: string[];
  };
  howItWorks: StepItem[];
  featureOverview: SectionHeaderContent;
  features: FeatureItem[];
  demo: SectionHeaderContent & {
    modules: NonEmptyArray<string>;
    tokenSets: DemoTokenSet[];
  };
  useCaseOverview: SectionHeaderContent;
  useCases: UseCase[];
  benefits: SectionHeaderContent & {
    before: string[];
    after: string[];
  };
  starter: SectionHeaderContent & {
    planName: string;
    items: string[];
  };
  proofItems: FeatureItem[];
  faqIntro: SectionHeaderContent;
  faq: FaqItem[];
  finalCta: SectionHeaderContent & {
    cta: Cta;
  };
  footer: {
    links: NavLink[];
    copyright: string;
  };
};
