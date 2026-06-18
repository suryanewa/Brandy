# Brandy

Brandy is a modular React landing page starter. It keeps page copy, content
contracts, design primitives, reusable patterns, and page sections separated so
new landing pages can be composed without one-off styling.

## Requirements

- Node 22 recommended
- npm

## Commands

```sh
npm install
npm run dev
npm run sync:sources
npm run sync:sources:check
npm run verify
npm run build
npm run preview
```

`npm run sync:sources` regenerates code from editable source files. `npm run
verify` checks source sync, lint, tests, typecheck, and a high-severity audit.
Run it before handing off changes.

## Source Map

- `content/landing-copy.md` owns editable page copy.
- `content/design-tokens.yaml` owns editable design token values, including
  responsive token overrides.
- `src/content/landing.ts` is generated from the markdown copy source.
- `src/types/landing.ts` defines the landing page content contracts.
- `src/components/primitives` contains design-system primitives.
- `src/components/patterns` contains reusable section arrangements.
- `src/components/sections` contains page modules, `LandingPage`, `SectionLab`,
  and the `pageSections` registry in `src/components/sections/registry.tsx`.
- `src/components/overlay` contains the embeddable design-parameter side panel
  and token catalog.
- `src/styles/tokens.css` is synced from `content/design-tokens.yaml`.
- `src/styles/typography.css` owns type scales and text utilities.
- `src/styles/animations.css` owns shared animation rules.
- `src/styles/primitives.css` owns base layout and primitive component styles.
- `src/styles/patterns.css` owns reusable pattern styles.
- `src/styles/sections.css` owns section and route-specific styles.
- `src/styles/responsive.css` owns responsive overrides.
- `src/styles/overlay.css` owns the design overlay chrome and live CSS-variable
  hooks.

## Design Overlay

Every route embeds `DesignOverlay`, a compact side panel for adjusting Brandy's
design parameters in the browser. It includes a searchable all-token editor for
CSS variables, typography, alignment, component dimensions, motion, depth, and
layout ratios, plus quick semantic controls. It writes CSS custom properties to
`document.documentElement`, persists quick controls under
`brandy:design-overlay:v1`, persists direct token overrides under
`brandy:design-token-values:v1`, and can reset individual tokens, groups, or the
full design. The UI borrows its dense row rhythm, subtle slider behavior,
compact color controls, and right-sheet structure from the Taki settings panel.
During `npm run dev`, design changes are debounced and posted to Vite
automatically. The dev sync updates `content/design-tokens.yaml`, regenerates
`tokens.css` and the token catalog defaults without forcing a page reload.

## Source Sync

- Edit design values in `content/design-tokens.yaml`.
- Edit landing copy in the fenced YAML block in `content/landing-copy.md`.
- During `npm run dev`, YAML and markdown sources are watched and synced with
  their generated CSS and TypeScript outputs automatically. Overlay token edits
  also sync back to `content/design-tokens.yaml` automatically.
- Run `npm run sync:sources` for one-off regeneration outside the dev server.
- Run `npm run sync:sources:check` to verify generated files are current without
  writing.

## Adding a Section

1. Create the section component in `src/components/sections`.
2. Add typed content to `content/landing-copy.md` and `src/types/landing.ts` if
   the section needs new copy or data, then run `npm run sync:sources`.
3. Add the component to `pageSections` in
   `src/components/sections/registry.tsx` so the landing page and `/sections`
   preview route stay in sync.
4. Add or update focused tests for the behavior or content contract.
5. Run `npm run verify`.

## Preview Route

`/sections` renders `SectionLab`, which previews each registered page section
independently. Use it to inspect section spacing, anchors, responsive behavior,
and content changes before composing the final page.

## QA Checklist

- Check desktop and mobile layouts.
- Confirm nav links and CTA anchors scroll to the expected sections.
- Exercise demo controls and FAQ interactions.
- Check reduced-motion behavior for animated surfaces.
- Run `npm run verify` and `npm run build`.
