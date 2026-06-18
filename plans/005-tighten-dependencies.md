# Plan 005: Tighten dependency classification and TypeScript range

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**:
> `sed -n '1,45p' package.json && sed -n '1,40p' package-lock.json`
> Expected today: `@vitejs/plugin-react` and `vite` are in production
> `dependencies`, and `typescript` uses `^6.0.3`. If package structure differs,
> adjust the plan to preserve the intended runtime/dev split.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/004-add-verification-docs-ci.md
- **Category**: dx
- **Planned at**: no git repository available, 2026-06-18

## Why this matters

The package currently exposes build tooling as production dependencies, so
production installs and downstream starter consumers carry avoidable tooling
surface. The TypeScript range also allows a future minor version outside the
current `typescript-eslint` peer window. This plan tightens package intent
without changing runtime code.

## Current state

- `package.json:14-20` lists `@vitejs/plugin-react`, `lucide-react`, `react`,
  `react-dom`, and `vite` under `dependencies`.
- `vite.config.ts:2` imports `@vitejs/plugin-react`; this is build/test tooling,
  not runtime UI code.
- `package.json:31` sets `"typescript": "^6.0.3"`.
- `package-lock.json:1223`, `1258`, `1280`, `1315`, `1340`, `1382`, `1419`,
  and `3366` show `typescript-eslint` peer windows of `>=4.8.4 <6.1.0`.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Update lockfile | `npm install` | exits 0 and updates lockfile only as needed |
| Production deps check | `npm ls --omit=dev --depth=0` | lists runtime deps only |
| Verify | `npm run verify` | exits 0 |
| Build | `npm run build` | exits 0 |

## Scope

**In scope**:
- `package.json`
- `package-lock.json`
- `README.md` only if deployment/install wording from plan 004 needs a small
  clarification

**Out of scope**:
- Upgrading major dependency versions.
- Replacing `lucide-react`.
- Changing Vite config or application code.
- Removing unused motion APIs.

## Steps

### Step 1: Move Vite tooling to devDependencies

In `package.json`:

- Remove `@vitejs/plugin-react` from `dependencies`.
- Remove `vite` from `dependencies`.
- Add both entries to `devDependencies` with the same version ranges.

After this step, production `dependencies` should be:

```json
"dependencies": {
  "lucide-react": "^1.20.0",
  "react": "^19.2.7",
  "react-dom": "^19.2.7"
}
```

**Verify**: `node -e "const p=require('./package.json'); console.log(Object.keys(p.dependencies)); console.log(Object.keys(p.devDependencies).filter(k=>k.includes('vite')))"` ->
first line contains only `lucide-react`, `react`, `react-dom`; second line
contains `@vitejs/plugin-react` and `vite`.

### Step 2: Pin TypeScript to the supported minor

Change `"typescript": "^6.0.3"` to `"typescript": "~6.0.3"`.

This keeps patch updates while preventing an automatic 6.1 install before
`typescript-eslint` supports it.

**Verify**: `node -e "console.log(require('./package.json').devDependencies.typescript)"` ->
prints `~6.0.3`.

### Step 3: Regenerate the lockfile

Run `npm install` to update the root package metadata in `package-lock.json`.

**Verify**:

```sh
node -e "const root=require('./package-lock.json').packages['']; console.log(root.dependencies); console.log(root.devDependencies.typescript)"
```

Expected: root `dependencies` does not include Vite tooling, and TypeScript is
`~6.0.3`.

### Step 4: Confirm production dependency surface

Run:

```sh
npm ls --omit=dev --depth=0
```

Expected output includes only the package root plus `lucide-react`, `react`, and
`react-dom` as top-level production dependencies.

### Step 5: Run the full gate

Run:

```sh
npm run verify
npm run build
```

If plan 004 was not executed, replace `npm run verify` with:

```sh
npm run lint
npm test
npm run typecheck
npm audit --audit-level=high
```

**Verify**: all commands exit 0.

## Test plan

No unit tests are needed for dependency classification. The lockfile update,
production dependency check, verify script, and build are the test plan.

## Done criteria

- [ ] Vite tooling lives in `devDependencies`.
- [ ] Runtime dependencies are limited to UI/runtime packages.
- [ ] TypeScript uses `~6.0.3`.
- [ ] `package-lock.json` matches `package.json`.
- [ ] `npm ls --omit=dev --depth=0` shows the expected production surface.
- [ ] Verify and build pass.
- [ ] `plans/README.md` status row updated.

## STOP conditions

Stop and report if:

- Deployment documentation or host configuration requires production installs
  to build the app without dev dependencies.
- `npm install` upgrades unrelated packages unexpectedly.
- `npm run build` fails after moving Vite packages to devDependencies.

## Maintenance notes

When upgrading TypeScript, upgrade `typescript-eslint` in the same change and
check peer ranges before loosening the version range again.

