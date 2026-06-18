# Plan 003: Fix interactive semantics, analytics, and demo invariants

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**:
> `sed -n '1,130p' src/components/patterns/DemoFrame.tsx && sed -n '1,80p' src/components/patterns/FAQAccordion.tsx && sed -n '1,90p' src/components/sections/Navbar.tsx`
> Expected today: `DemoFrame` indexes `layers[0]` and `demo.modules[1]`, FAQ
> always tracks `faq_item_opened` on click, and the mobile menu is a `div`.
> If those facts are false, stop and reconcile this plan with live code.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: bug
- **Planned at**: no git repository available, 2026-06-18

## Why this matters

Several interactive controls work visually but do not expose the same state to
assistive technology or analytics. Demo controls rely on `data-*` state,
mobile layer labels are hidden with `display: none`, FAQ close actions are
counted as opens, and valid typed content can crash the demo when arrays are
empty. These are small localized fixes that make the starter safer to reuse.

## Current state

- `src/components/patterns/DemoFrame.tsx:12` accepts `layers: FeatureItem[]`.
- `src/components/patterns/DemoFrame.tsx:16-20` initializes
  `selectedLayer = 0`, `selectedModule = 1`, then indexes `layers` and
  `demo.modules`.
- `src/components/patterns/DemoFrame.tsx:24-29` dereferences
  `activeModule` and `activeLayer.title`.
- `src/components/patterns/DemoFrame.tsx:44` and line 72 expose active state
  only through `data-active` and `data-selected`.
- `src/styles/utilities.css:903` hides `.demo-layer span` with `display: none`
  at tablet/mobile widths. After plan 001, this selector may live in
  `src/styles/responsive.css`.
- `src/components/patterns/FAQAccordion.tsx:23-25` closes an open FAQ with
  `setOpenIndex(-1)` but always tracks `faq_item_opened`.
- `src/components/sections/Navbar.tsx:22` uses a desktop `<nav>`, while
  `src/components/sections/Navbar.tsx:52` renders mobile links in a plain
  `<div>`. The mobile CTA at lines 58-64 does not close the menu.
- `src/types/landing.ts:54` and `src/types/landing.ts:66` type critical demo
  arrays as ordinary arrays.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck | `npx tsc -p tsconfig.app.json --noEmit --incremental false` | exit 0, no errors |
| Tests | `npm test` | all tests pass |
| Lint | `npm run lint` | exit 0 |

## Scope

**In scope**:
- `src/types/landing.ts`
- `src/content/landing.ts`
- `src/components/patterns/DemoFrame.tsx`
- `src/components/patterns/FAQAccordion.tsx`
- `src/components/sections/Navbar.tsx`
- `src/styles/utilities.css` or the split CSS file containing `.demo-layer span`
- `tests/interactions.test.tsx` (create) or existing test files

**Out of scope**:
- Rebuilding the demo as tabs/listbox unless necessary for accessibility.
- Changing analytics event names except if tests prove the existing event is
  unusable. Prefer tracking opens only.
- Moving analytics out of `Button`.

## Steps

### Step 1: Encode non-empty demo arrays

In `src/types/landing.ts`, add:

```ts
export type NonEmptyArray<T> = readonly [T, ...T[]];
```

Change:

- `layers: FeatureItem[]` to `layers: NonEmptyArray<FeatureItem>`.
- `demo.modules: string[]` to `demo.modules: NonEmptyArray<string>`.

Update `src/content/landing.ts` so `layers` satisfies
`NonEmptyArray<FeatureItem>` and `demo.modules` satisfies
`NonEmptyArray<string>`.

**Verify**: `npx tsc -p tsconfig.app.json --noEmit --incremental false` ->
exit 0.

### Step 2: Clamp demo active indices

In `DemoFrame.tsx`, keep the existing initial selected module intent without
assuming there are at least two modules:

```ts
const [selectedModule, setSelectedModule] = useState(() =>
  Math.min(1, demo.modules.length - 1),
);
const activeLayerIndex = Math.min(selectedLayer, layers.length - 1);
const activeModuleIndex = Math.min(selectedModule, demo.modules.length - 1);
const activeLayer = layers[activeLayerIndex];
const activeModule = demo.modules[activeModuleIndex];
```

Use `activeLayerIndex` and `activeModuleIndex` for selected state comparisons.

**Verify**: `npx tsc -p tsconfig.app.json --noEmit --incremental false` ->
exit 0, with no non-null assertions added.

### Step 3: Expose demo button names and selection state

For demo layer buttons:

- Add `aria-label={layer.title}` if the visible text may be hidden by CSS.
- Add `aria-pressed={isActive}`.

For demo module buttons:

- Add `aria-pressed={index === activeModuleIndex}`.
- Keep the visible module text.

If you touch the CSS that hides `.demo-layer span`, prefer a reusable
visually-hidden utility instead of `display: none`; otherwise the `aria-label`
is sufficient.

**Verify**: Add or update tests so `screen.getByRole("button", { name: "Tokens" })`
exists and the active layer/module button exposes `aria-pressed="true"`.

### Step 4: Correct FAQ analytics

In `FAQAccordion.tsx`, track only when a click opens a closed item:

```ts
onClick={() => {
  setOpenIndex(isOpen ? -1 : index);
  if (!isOpen) {
    track("faq_item_opened", { question: item.question });
  }
}}
```

**Verify**: Add a test that opens and then closes the same FAQ item and asserts
only the opening transition dispatches `faq_item_opened`.

### Step 5: Keep mobile nav semantics and close behavior aligned

In `Navbar.tsx`:

- Change the mobile menu wrapper from `div` to `nav`.
- Add `aria-label="Mobile navigation"`.
- Keep `id="mobile-menu"` and `data-open={isOpen}` so CSS still applies.
- Pass `onClick={() => setIsOpen(false)}` to the mobile CTA `Button`.

**Verify**: Add a test that toggles the mobile menu, clicks the CTA, and asserts
the toggle button has `aria-expanded="false"` afterward.

### Step 6: Run the full gate

Run:

```sh
npx tsc -p tsconfig.app.json --noEmit --incremental false
npm test
npm run lint
```

**Verify**: all commands exit 0.

## Test plan

Create `tests/interactions.test.tsx` unless an existing test file is a cleaner
fit. Use `render`, `screen`, and `fireEvent` from `@testing-library/react`.
Capture analytics by listening for `brandy:analytics` on `window`, matching the
pattern in `tests/analytics.test.ts`.

Cover:

- Demo layer and module buttons have accessible names and `aria-pressed`.
- FAQ open transition dispatches `faq_item_opened`; close transition does not.
- Mobile navigation is a navigation landmark and the mobile CTA closes it.
- Optional: render `DemoFrame` with a one-module content object to prove the
  default active module does not become `undefined`.

## Done criteria

- [ ] Demo critical arrays are non-empty at the type level.
- [ ] `DemoFrame` does not dereference potentially undefined active items.
- [ ] Demo selection state is exposed with ARIA, not only `data-*`.
- [ ] FAQ close actions no longer emit `faq_item_opened`.
- [ ] Mobile menu is a labeled nav and closes after CTA activation.
- [ ] New interaction tests cover these behaviors.
- [ ] Typecheck, tests, and lint all exit 0.
- [ ] `plans/README.md` status row updated.

## STOP conditions

Stop and report if:

- TypeScript cannot infer `NonEmptyArray` for the existing content without
  unsafe casts.
- Fixing demo semantics requires rewriting the visual interaction model.
- Any analytics event rename is required. This plan should preserve event names
  unless explicitly approved.

## Maintenance notes

Future interactive patterns should expose selected/open state through ARIA when
the control has state. `data-*` attributes are fine for styling, but should not
be the only semantic representation.

