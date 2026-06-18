# Plan 002: Centralize section composition metadata

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**:
> `sed -n '1,80p' src/components/sections/LandingPage.tsx && sed -n '1,90p' src/components/sections/SectionLab.tsx`
> Expected today: both files import/order the same production sections by hand,
> and `SectionLab.tsx` has a local `labSections` array. If not, stop and
> reconcile this plan with live code.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: no git repository available, 2026-06-18

## Why this matters

The production landing page and the section preview route each maintain their
own section inventory. Adding, removing, renaming, or reordering a section now
requires lockstep edits, and the preview route can silently drift from the page
it is supposed to characterize. A single registry makes section composition a
first-class contract.

## Current state

- `src/components/sections/LandingPage.tsx:1-14` imports every section.
- `src/components/sections/LandingPage.tsx:21-32` renders `Hero`,
  `LogoMarquee`, `Problem`, `Solution`, `HowItWorks`, `Features`, `Demo`,
  `UseCases`, `Benefits`, `Starter`, `FAQ`, and `FinalCTA` in order.
- `src/components/sections/SectionLab.tsx:17-30` repeats the same list in
  `labSections` with labels.
- `src/components/sections/SectionLab.tsx:50-54` renders the local list.
- `Navbar` and `Footer` are page chrome, not section registry entries.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck | `npx tsc -p tsconfig.app.json --noEmit --incremental false` | exit 0, no errors |
| Tests | `npm test` | all tests pass |
| Lint | `npm run lint` | exit 0 |

## Scope

**In scope**:
- `src/components/sections/registry.tsx` (create)
- `src/components/sections/index.ts`
- `src/components/sections/LandingPage.tsx`
- `src/components/sections/SectionLab.tsx`
- `tests/contracts.test.tsx` or `tests/render.test.tsx`

**Out of scope**:
- Changing section visual design.
- Passing content as props to all sections. That is a later, larger content
  boundary refactor.
- Moving `Navbar` or `Footer` into the registry.

## Steps

### Step 1: Create the registry

Create `src/components/sections/registry.tsx` with a typed registry. Use
`ComponentType` from React and preserve the current order.

Target shape:

```tsx
import type { ComponentType } from "react";
import { Benefits } from "./Benefits";
// import the remaining section components

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
```

**Verify**: `npx tsc -p tsconfig.app.json --noEmit --incremental false` ->
exit 0.

### Step 2: Render `LandingPage` from the registry

In `LandingPage.tsx`, remove direct imports for individual sections and import
`pageSections`. Keep `Navbar` and `Footer` direct. Render:

```tsx
<main>
  {pageSections.map(({ label, Component }) => (
    <Component key={label} />
  ))}
</main>
```

**Verify**: `rg -n "import \\{ (Benefits|Demo|FAQ|Features|FinalCTA|Hero|HowItWorks|LogoMarquee|Problem|Solution|Starter|UseCases)" src/components/sections/LandingPage.tsx`
-> no matches.

### Step 3: Render `SectionLab` from the same registry

In `SectionLab.tsx`, remove the local section imports and `labSections`. Import
`pageSections` and map that array in the lab body. Keep the existing label UI.

**Verify**:
`rg -n "const labSections|from \"./Benefits\"|from \"./Demo\"|from \"./Hero\"" src/components/sections/SectionLab.tsx`
-> no matches.

### Step 4: Export the registry

Update `src/components/sections/index.ts` to export `pageSections` and its type
if the file currently centralizes section exports.

**Verify**: `npx tsc -p tsconfig.app.json --noEmit --incremental false` ->
exit 0.

### Step 5: Add a composition contract test

Add a test that imports `pageSections`, renders `/sections`, and asserts every
registry `label` appears in the lab. Also render `/` and assert every registry
entry with a `domId` exists in the page DOM.

Use the style already present in `tests/render.test.tsx` and
`tests/contracts.test.tsx`.

**Verify**: `npm test` -> all tests pass and the new test fails if a registry
entry is removed from either route.

## Test plan

- Add one test for lab labels matching `pageSections`.
- Add one test for landing DOM IDs matching registry `domId` values.
- Keep existing section heading ID tests.

## Done criteria

- [ ] `LandingPage.tsx` and `SectionLab.tsx` both consume `pageSections`.
- [ ] No duplicated manual production section list remains.
- [ ] The registry preserves the old rendering order exactly.
- [ ] New tests cover registry/lab/page alignment.
- [ ] Typecheck, tests, and lint all exit 0.
- [ ] `plans/README.md` status row updated.

## STOP conditions

Stop and report if:

- Any section component requires props before this plan begins.
- Registry rendering changes the page order or removes a section.
- Tests reveal duplicate or missing section IDs not already present in the
  current code.

## Maintenance notes

New sections should be added to `pageSections` once. The production page and the
preview route should not gain separate section inventories again.

