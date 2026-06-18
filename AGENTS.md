# Agent Instructions

- Run `npm run verify` before handoff whenever source, tests, package metadata,
  or docs change.
- Treat `content/design-tokens.yaml` as the editable design-token source and
  `content/landing-copy.md` as the editable copy source. Run `npm run
  sync:sources` after changing either one.
- Keep source files below 1,000 lines; split a file before it reaches that
  limit.
- Put CSS in the owner file matching the layer: tokens, typography, animations,
  primitives, patterns, sections, or responsive overrides.
- Keep overlay-specific UI and variable hooks in `src/components/overlay` and
  `src/styles/overlay.css`; do not mix them into section styles.
- When adding a new design token or hardcoded visual parameter, expose it in
  `content/design-tokens.yaml`, `src/styles/tokens.css`, and
  `src/components/overlay/designTokenCatalog.ts`, then run
  `npm run sync:sources:check`.
- Do not duplicate section lists; add sections to `pageSections`.
- Do not add raw design values when tokens already exist.
- Use structured content in `content/landing-copy.md` rather than hardcoding
  repeated copy in sections. `src/content/landing.ts` is generated.
- Do not commit `dist` or generated caches unless explicitly requested.
