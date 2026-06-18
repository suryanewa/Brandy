# Plan 004: Add verification, CI, and contributor docs

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**:
> `find README.md AGENTS.md docs .github -maxdepth 3 -type f -print 2>/dev/null; sed -n '1,60p' package.json`
> Expected today before this plan: no README/docs/CI/AGENTS files, and
> `package.json` has separate `lint`, `test`, and `typecheck` scripts but no
> aggregate `verify` script. If plan 001-003 changed source structure, document
> the new structure, not the old excerpts.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-split-css-ownership.md, plans/002-centralize-section-registry.md, plans/003-fix-interactive-semantics-and-analytics.md
- **Category**: dx
- **Planned at**: no git repository available, 2026-06-18

## Why this matters

The starter has a useful architecture but no operating manual. Future agents
and contributors currently have to infer setup commands, CSS ownership, section
composition rules, content contracts, and QA expectations from source. A single
verification command plus CI makes the quality gate repeatable; concise docs
make the system easier to extend without reintroducing the issues found in this
audit.

## Current state

- `package.json:6-13` defines `dev`, `build`, `lint`, `preview`, `test`, and
  `typecheck`, but no `verify` script.
- No `README.md`, `docs/`, `.github`, or `AGENTS.md` file was present during
  audit.
- `src/content/landing.ts` is the editable content source.
- `src/types/landing.ts:41-89` defines the `LandingPageContent` contract.
- `/sections` is routed by `src/App.tsx:4-8`.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Verify | `npm run verify` | exits 0 after this plan |
| Build | `npm run build` | exit 0 |
| CI syntax sanity | `sed -n '1,160p' .github/workflows/verify.yml` | readable workflow |

## Scope

**In scope**:
- `package.json`
- `README.md` (create)
- `AGENTS.md` (create)
- `.github/workflows/verify.yml` (create)
- `.editorconfig` (create, optional but recommended)

**Out of scope**:
- Adding new runtime dependencies.
- Changing source behavior.
- Publishing to npm or deploying.

## Steps

### Step 1: Add one verification script

In `package.json`, add:

```json
"verify": "npm run lint && npm test && npm run typecheck && npm audit --audit-level=high"
```

Keep the existing scripts.

**Verify**: `npm run verify` -> lint, tests, typecheck, and audit all exit 0.

### Step 2: Add CI

Create `.github/workflows/verify.yml`:

```yaml
name: Verify

on:
  push:
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run verify
      - run: npm run build
```

Use Node 22 because current dependencies declare modern Node engine ranges.

**Verify**: `sed -n '1,120p' .github/workflows/verify.yml` -> workflow matches
the intended gate.

### Step 3: Add README

Create `README.md` with these sections:

- What Brandy is: a modular React landing page starter.
- Requirements: Node 22 recommended, npm.
- Commands: `npm install`, `npm run dev`, `npm run verify`,
  `npm run build`, `npm run preview`.
- Source map:
  - `src/content/landing.ts` for page copy/data.
  - `src/types/landing.ts` for content contracts.
  - `src/components/primitives` for design-system primitives.
  - `src/components/patterns` for reusable arrangements.
  - `src/components/sections` for page modules.
  - `src/styles` for token/layered CSS ownership after plan 001.
- How to add a section:
  1. create the section component;
  2. add typed content if needed;
  3. add it to `pageSections` after plan 002;
  4. add or update tests;
  5. run `npm run verify`.
- `/sections` preview route purpose.
- QA checklist: desktop/mobile, nav links, CTA anchors, demo controls, FAQ,
  reduced motion, and `npm run verify`.

**Verify**: `rg -n "npm run verify|src/content/landing.ts|/sections|pageSections|QA" README.md`
-> all terms appear.

### Step 4: Add agent instructions

Create `AGENTS.md` with short rules for future agents:

- Run `npm run verify` before handoff.
- Keep source files below 1,000 lines; split before a file reaches that limit.
- Put CSS in the owner file matching the layer.
- Do not duplicate section lists; use `pageSections`.
- Do not add raw design values when a token exists.
- Use structured content in `src/content/landing.ts` rather than hardcoding
  repeated copy in sections.
- Do not commit `dist` or generated caches unless explicitly requested.

**Verify**: `rg -n "1,000|pageSections|npm run verify|tokens|dist" AGENTS.md`
-> all terms appear.

### Step 5: Add editor guardrails

Create `.editorconfig`:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true
```

**Verify**: `sed -n '1,40p' .editorconfig` -> file matches the intended
settings.

### Step 6: Run final verification

Run:

```sh
npm run verify
npm run build
```

**Verify**: both commands exit 0.

## Test plan

No new unit tests are required. This plan adds the verification command and CI
workflow that run the existing test suite and build.

## Done criteria

- [ ] `npm run verify` exists and exits 0.
- [ ] `.github/workflows/verify.yml` runs install, verify, and build.
- [ ] README documents setup, source architecture, section authoring, the
      preview route, and QA.
- [ ] `AGENTS.md` documents architecture and quality rules for future agents.
- [ ] `.editorconfig` exists.
- [ ] `npm run build` exits 0.
- [ ] `plans/README.md` status row updated.

## STOP conditions

Stop and report if:

- `npm run verify` fails due to a source issue introduced by earlier plans.
- CI requires secrets or deployment configuration. This plan should be a local
  verification workflow only.
- The live source structure differs from this plan because plans 001-003 were
  not executed; update docs to match live code rather than documenting a future
  state.

## Maintenance notes

Whenever scripts or architecture change, update README and `AGENTS.md` in the
same pull request. The docs should remain short enough that future agents will
actually read them.

