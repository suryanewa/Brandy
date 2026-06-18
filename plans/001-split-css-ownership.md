# Plan 001: Split CSS ownership by architecture layer

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**:
> `test ! -d .git && wc -l src/styles/utilities.css src/styles/tokens.css src/main.tsx || git diff --stat HEAD -- src/styles src/main.tsx`
> Expected today: `src/styles/utilities.css` is 993 lines, `src/main.tsx`
> imports `tokens.css`, `typography.css`, `animations.css`, and
> `utilities.css`. If those facts are false, compare this plan with live code
> before proceeding.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: no git repository available, 2026-06-18

## Why this matters

The codebase describes a layered system: tokens, primitives, patterns,
sections, and composition. The CSS does not honor that boundary yet:
`utilities.css` is already 993 lines and contains nearly every runtime selector.
That makes small section work risky because any selector can accidentally depend
on global order or private markup. Splitting by owner makes the landing system
easier to extend without crossing the 1,000-line danger zone.

## Current state

- `src/main.tsx:4-7` imports all global CSS and ends with
  `./styles/utilities.css`.
- `src/styles/utilities.css:5` starts base/primitives such as `.section`,
  `.container`, `.stack`, `.grid`, `.split`, `.cluster`, `.card`, `.button`,
  and `.badge`.
- `src/styles/utilities.css:282` starts reusable patterns such as
  `.section-header`, `.browser-frame`, `.marquee`, `.demo-frame`, and FAQ
  selectors.
- `src/styles/utilities.css:355` starts section/route classes such as
  `.navbar`, `.hero-*`, `.problem-*`, `.solution-*`, `.footer`, and
  `.section-lab`.
- `src/styles/utilities.css:850` starts global responsive overrides, including
  section-specific `.hero-browser .demo-frame` selectors at lines 954-986.
- Raw repeated component values exist in the CSS: `max-width: 760px` at lines
  284 and 750, button heights at lines 223/228/233, and demo/browser heights
  around lines 332, 447, 461, 694, and 704.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck | `npx tsc -p tsconfig.app.json --noEmit --incremental false` | exit 0, no errors |
| Tests | `npm test` | all tests pass |
| Lint | `npm run lint` | exit 0 |
| Build | `npm run build` | exit 0 |

## Scope

**In scope**:
- `src/main.tsx`
- `src/styles/tokens.css`
- `src/styles/utilities.css`
- `src/styles/primitives.css` (create)
- `src/styles/patterns.css` (create)
- `src/styles/sections.css` (create)
- `src/styles/responsive.css` (create)

**Out of scope**:
- React component behavior changes.
- Renaming public class names unless absolutely required to preserve ownership.
- Adding a CSS framework or CSS Modules.

## Steps

### Step 1: Add explicit CSS owners

Create these files:

- `src/styles/primitives.css` for base layout and primitive component selectors.
- `src/styles/patterns.css` for reusable pattern selectors.
- `src/styles/sections.css` for section and route-specific selectors.
- `src/styles/responsive.css` for the existing media-query overrides.

Move selectors out of `utilities.css` without changing selector names or
declaration order inside each moved block. Keep comments short and structural.
The first split should preserve behavior, not redesign CSS.

**Verify**: `wc -l src/styles/*.css` -> `utilities.css` is no longer near 1,000
lines and no new file is over 700 lines.

### Step 2: Update import order

In `src/main.tsx`, replace the `utilities.css` import with explicit layer
imports after `animations.css`:

```ts
import "./styles/primitives.css";
import "./styles/patterns.css";
import "./styles/sections.css";
import "./styles/responsive.css";
```

Leave `tokens.css`, `typography.css`, and `animations.css` first.

**Verify**: `sed -n '1,20p' src/main.tsx` -> imports appear in this order:
tokens, typography, animations, primitives, patterns, sections, responsive.

### Step 3: Either delete or shrink `utilities.css`

Preferred: delete `src/styles/utilities.css` after all selectors move. If a
transition file is safer, keep it as a tiny compatibility note with no runtime
selectors and remove its import from `main.tsx`.

**Verify**: `rg -n "utilities\\.css" src` -> no matches.

### Step 4: Promote repeated component values to tokens

In `src/styles/tokens.css`, add component/chrome tokens for repeated values that
are part of the system contract, not one-off art direction. Start with these:

- section header readable max width currently repeated as `760px`.
- button min heights currently `2.25rem`, `2.75rem`, and `3.25rem`.
- browser/demo minimum heights used by `.browser-frame__content`,
  `.hero-browser .browser-frame__content`, and `.demo-frame`.

Use names such as `--content-readable-max`, `--button-height-sm`,
`--button-height-md`, `--button-height-lg`, `--browser-content-min-height`,
`--demo-frame-min-height`, and `--hero-demo-height`. Replace the matching raw
values in the split CSS files. Do not tokenize every numeric value; leave
single-use visual proportions alone unless a name improves clarity.

**Verify**:
`rg -n "760px|2\\.25rem|2\\.75rem|3\\.25rem" src/styles` -> no matches for
the values replaced in this step.

### Step 5: Run the full gate

Run:

```sh
npx tsc -p tsconfig.app.json --noEmit --incremental false
npm test
npm run lint
npm run build
```

**Verify**: all commands exit 0.

## Test plan

No new unit tests are required for the mechanical CSS split. The build and
existing tests must pass. If the executor has browser tooling available, also
open `/` and `/sections` at desktop and mobile widths and compare the hero,
demo, mobile navigation, and section lab visually before marking done.

## Done criteria

- [ ] `src/main.tsx` imports the new CSS owner files in explicit layer order.
- [ ] `src/styles/utilities.css` is deleted or contains no runtime selectors.
- [ ] No CSS file under `src/styles` exceeds 700 lines.
- [ ] Repeated button height and section-readable-width raw values are replaced
      with named tokens.
- [ ] Typecheck, tests, lint, and build all exit 0.
- [ ] `plans/README.md` status row updated.

## STOP conditions

Stop and report if:

- Moving selectors changes class names that are used by components.
- The split requires component markup changes.
- Build or lint fails twice after a reasonable fix attempt.
- A browser smoke check shows major visual regressions in the hero, demo,
  mobile nav, or `/sections` route.

## Maintenance notes

Future CSS should land in the owner file that matches the component layer. If a
single CSS file approaches 700 lines again, split by component or section before
it reaches the 1,000-line danger threshold.

