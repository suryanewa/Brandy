# Brandy Landing Copy

Edit the YAML block below, then run `npm run sync:sources` to regenerate
`src/content/landing.ts`.

```yaml
brand:
  name: "Brandy"
  description: "A modular landing page starter for React teams who want reusable design rules, clean section architecture, and editable content."
nav:
  links:
    - label: "System"
      href: "#system"
    - label: "Modules"
      href: "#sections"
    - label: "Demo"
      href: "#demo"
    - label: "FAQ"
      href: "#faq"
  cta:
    label: "View system"
    href: "#system"
hero:
  title: "Landing pages, built from a system."
  description: "Compose launch-ready pages from tokens, primitives, patterns, and sections without letting one-off styles leak into production."
  primaryCta:
    label: "View system"
    href: "#system"
  secondaryCta:
    label: "Explore modules"
    href: "#sections"
layers:
  - title: "Tokens"
    description: "Semantic color, type, spacing, radius, stroke, shadow, motion, and container values."
  - title: "Primitives"
    description: "Section, Container, Stack, Grid, Split, Card, Button, Heading, and Text."
  - title: "Patterns"
    description: "Reusable arrangements like SectionHeader, BrowserFrame, FAQAccordion, and DemoFrame."
  - title: "Sections"
    description: "Hero, demo, problem, features, use cases, FAQ, final CTA, and footer modules."
  - title: "Page"
    description: "A composition file that orders modules instead of inventing layout rules."
systemMap:
  title: "One page. Five reusable layers."
  description: "Brand decisions live in tokens. Layout lives in primitives. Marketing pages become composition, not reinvention."
problem:
  title: "One-off sections turn launch pages brittle."
  description: "When every module invents its own padding, color, card style, and animation, the page becomes harder to reuse, rebrand, test, and ship."
  items:
    - "Arbitrary spacing and radii hide in section CSS."
    - "Repeated content gets trapped in markup."
    - "New pages copy old mistakes instead of sharing rules."
solution:
  title: "A strict design grammar keeps storytelling flexible."
  description: "Brandy separates design decisions from section implementation, so each section can choose content, layout, emphasis, media, and CTA without creating a new system."
  checks:
    - "Sections choose from tokens."
    - "Repeated layouts use primitives."
    - "Copy lives in structured content."
    - "The page stays composition-only."
howItWorks:
  - layer: "01"
    title: "Define the system"
    description: "Lock brand taste into semantic tokens, shared type styles, and motion presets."
  - layer: "02"
    title: "Compose modules"
    description: "Build sections from primitives and patterns instead of bespoke layout CSS."
  - layer: "03"
    title: "Drive with content"
    description: "Feed repeated lists, FAQ items, CTAs, and proof points from structured data."
featureOverview:
  title: "Strict design grammar. Flexible storytelling."
  description: "Every module can choose content, layout, emphasis, and CTA without inventing new spacing, colors, or motion."
features:
  - title: "No random values"
    description: "Colors, spacing, radii, shadows, type, and motion come from named tokens."
  - title: "Slot-based sections"
    description: "Visuals, actions, and media can change without forking the layout contract."
  - title: "Previewable modules"
    description: "A sections route lets teams inspect modules independently before composing pages."
  - title: "Content contracts"
    description: "Repeated copy stays easy to rewrite, localize, test, and later move to a CMS."
demo:
  title: "Compose before you customize."
  description: "Select a module, inspect the contract, and see how the same tokens keep every layer aligned."
  modules:
    - "Navbar"
    - "Hero"
    - "System map"
    - "Demo"
    - "Features"
    - "FAQ"
    - "Final CTA"
  tokenSets:
    - label: "Accent"
      value: "Fresh green"
      swatch: "green"
    - label: "Surface"
      value: "True white"
      swatch: "white"
    - label: "Radius"
      value: "8px max"
      swatch: "radius"
useCaseOverview:
  title: "Built for teams that ship many versions."
  description: "Founders, designers, and engineers can change the story while the system protects quality."
useCases:
  - audience: "Founders"
    title: "Launch faster without a fragile template."
    description: "Start with a persuasive sequence and adapt the content as positioning changes."
  - audience: "Designers"
    title: "Protect visual rules across every section."
    description: "Keep spacing, type, and component behavior consistent while exploring stories."
  - audience: "Engineers"
    title: "Ship pages as composition, not rewrites."
    description: "Move, reuse, and test sections without chasing hidden dependencies."
benefits:
  title: "The page stays flexible where it matters."
  description: "Messaging, order, visual emphasis, demo moments, and CTAs can evolve while the design grammar stays stable."
  before:
    - "padding: 83px"
    - "border-radius: 19px"
    - "color: #7c5cff"
    - "one-off fade timing"
  after:
    - "var(--section-padding-y-md)"
    - "var(--radius-lg)"
    - "var(--color-accent)"
    - "var(--duration-base)"
starter:
  title: "Everything needed to ship the first page."
  description: "Use the starter as a launch page, a section library, or the foundation for campaign variants."
  planName: "Brandy starter"
  items:
    - "Design tokens"
    - "Primitive components"
    - "Pattern components"
    - "Section modules"
    - "Content file"
    - "Motion presets"
    - "Preview route"
    - "QA checklist"
proofItems:
  - title: "Composition first"
    description: "The page can change order without each section depending on a custom spacer or neighboring gradient."
  - title: "System audit"
    description: "The starter makes it easier to scan for raw colors, arbitrary spacing, and repeated one-off layout styles."
  - title: "Reusable contracts"
    description: "Sections receive structured content, so rewriting or localizing does not require markup surgery."
faqIntro:
  title: "Questions teams ask before using a system."
  description: "Remove adoption concerns before the final CTA."
faq:
  - question: "Is Brandy a template or a component system?"
    answer: "Both. It includes a demo landing page, but the reusable system underneath it is the real product: tokens, primitives, patterns, sections, and content contracts."
  - question: "Can the visual style change?"
    answer: "Yes. Brand decisions live in semantic tokens, so style changes happen in the system layer instead of inside every section."
  - question: "Does it require a CMS?"
    answer: "No. Brandy starts from a local content file and can move to a CMS later if the project needs it."
  - question: "Can sections be reordered?"
    answer: "Yes. Sections are composed independently so the page can change sequence without fragile layout dependencies."
finalCta:
  title: "Start with a system. Ship pages faster."
  description: "Use Brandy as the foundation for launch pages, waitlists, product pages, and campaign variants."
  cta:
    label: "Explore modules"
    href: "#sections"
footer:
  links:
    - label: "System"
      href: "#system"
    - label: "Demo"
      href: "#demo"
    - label: "Modules"
      href: "#sections"
    - label: "FAQ"
      href: "#faq"
    - label: "GitHub"
      href: "https://github.com"
    - label: "Privacy"
      href: "#footer"
  copyright: "(c) 2026 Brandy. Built as a modular landing page system."
```
