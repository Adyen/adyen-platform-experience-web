# NX Monorepo Restructuring Implementation Plan

> Status: planning document only. This file defines the execution plan for the migration; it does not authorize implementation by itself.

## Reference inputs

- `issues/NX Monorepo Restructuring.md`
- `issues/00-00-epic-nx-monorepo-migration.md`
- `issues/00-00-timeline.md`
- `issues/00-01` through `issues/04-04`

## Executive summary

The repository will be restructured from a single-package Preact monolith into an NX workspace organized around:

- **shared foundation libraries** under `packages/shared/*`
- **one NX project per business domain** under `packages/domains/<domain>`
- **four sibling domain layers** inside each domain package, following `packages/domains/<domain>/<layer>/src`:
    - `packages/domains/<domain>/domain/src` for framework-agnostic logic
    - `packages/domains/<domain>/preact/src` for the current implementation
    - `packages/domains/<domain>/vue/src` for the future implementation
    - `packages/domains/<domain>/publish/src` for the currently published surface
- **one publish aggregation project** under `packages/publish`

The migration is explicitly designed to preserve the existing npm package contract while unblocking targeted CI, domain ownership, and future Vue work.

The agreed model is:

1. **One NX project per domain**, not one project per framework layer.
2. The root publish project imports only `@integration-components/<domain>/publish` entrypoints.
3. Each domain's `publish/src/index.ts` initially re-exports only the Preact surface.
4. Vue stays out of the publish graph until a domain explicitly switches selected exports.
5. Cross-project boundaries are enforced by `@nx/enforce-module-boundaries`.
6. Intra-domain boundaries are enforced by folder-level ESLint restrictions.

## Migration goals

- Preserve the current publish contract and public package surface.
- Keep one global Storybook during migration.
- Enable affected-based lint/test/build routing with NX.
- Extract shared logic before domain extraction so domains are not coupled to root internals.
- Finish with a stable dual-framework-ready layout, without publishing Vue yet.

## Non-goals during migration

- No public multi-entry publishing.
- No per-domain Storybook instances (Pattern C). Pattern B — two framework-scoped tool-package Storybooks (`packages/tools/storybook-preact`, `packages/tools/storybook-vue`) sharing `PLAYGROUND_PORT` — is in scope and does not violate this non-goal.
- No Storybook composer host (Pattern A). Additive future option; requires backend coordination for a second CORS-whitelisted port.
- No CSS-in-JS or Shadow DOM rewrite.
- No Bento Vue adoption beyond token consumption.
- No NX Cloud requirement.

## Agreed target architecture

When this plan uses shorthand like `domain/src`, `preact/src`, `vue/src`, or `publish/src`, it means those directories **inside a domain package** — for example `packages/domains/<domain>/preact/src`, not `packages/domains/<domain>/src/preact`.

```text
packages/
├── publish/
│   └── src/index.ts
├── shared/
│   ├── types/
│   ├── utils/
│   ├── core/
│   ├── style/
│   ├── testing/
│   ├── hooks-preact/
│   └── ui-primitives-preact/
├── tools/
│   ├── storybook-preact/
│   │   ├── .storybook/
│   │   ├── src/utils/
│   │   ├── static/
│   │   └── package.json
│   └── storybook-vue/
│       ├── .storybook/
│       ├── src/utils/
│       ├── static/
│       └── package.json
└── domains/
    └── <domain>/
        ├── domain/src/
        ├── preact/src/
        ├── vue/src/
        ├── publish/src/
        ├── stories/
        │   ├── preact/
        │   └── vue/
        ├── mocks/
        └── tests/
```

### Architectural invariants

1. `packages/publish/src/index.ts` may import domains only through `@integration-components/<domain>/publish`.
2. `publish/src` inside a domain is the only layer allowed to compose the currently published implementation.
3. `domain/src` must remain framework-agnostic.
4. `preact/src` and `vue/src` may import from `domain/src`, but not from each other.
5. Shared packages may not depend on domains or publish layers.
6. The root `package.json` contract must remain unchanged throughout migration.
7. Tool packages (`type:tool`) may import from shared, domain, and publish packages; no other package may import from a tool package. Tool packages are never part of the npm publish artifact.
8. `stories/preact/**` inside a domain is globbed only by the Preact Storybook; `stories/vue/**` only by the Vue Storybook.
9. Storybook packages bind to `PLAYGROUND_PORT` read from `envs/*` and are mutually exclusive locally (one Storybook process may hold the port at a time).

## Tooling Packages

### Purpose

`type:tool` is a package class introduced by this plan for development-only infrastructure that is never part of the published artifact. Storybook is the first and currently only tooling concern. The class is reserved for future additions (e.g., dedicated visual-regression or deploy-preview tooling) but not pre-populated.

### Architecture — Pattern B (two independent Storybooks)

Storybook is bound to a single renderer per instance, so Preact and Vue stories cannot coexist inside one Storybook. The plan adopts **Pattern B**: two independent Storybook tool packages, each bound to its own renderer, sharing story globs by framework.

- `packages/tools/storybook-preact` — `@storybook/preact-vite`; globs `packages/domains/*/stories/preact/**`.
- `packages/tools/storybook-vue` — `@storybook/vue3-vite`; globs `packages/domains/*/stories/vue/**`.

No composer host (Pattern A) and no per-domain Storybook instances (Pattern C) are adopted during the migration. Both remain **additive** upgrade paths and are not dead-ends: Pattern A can be introduced later by adding a third tool package with `refs`, and Pattern C is the expected post-migration evolution.

### Port & CORS strategy

Both tool packages bind to `PLAYGROUND_PORT` (default `3030`) read from `envs/*` via `envs/getEnvs.ts` — the same mechanism the current root Storybook uses today. The backend's CORS allowlist and the session-API flow depend on this specific host:port pair, so a second fixed port is not viable without backend-team coordination (out of scope for this plan).

Consequences:

1. Only one Storybook process may bind `PLAYGROUND_PORT` at a time. Attempting to start the second while the first is running fails loudly (port-in-use).
2. Developers who need to compare Preact and Vue implementations stop one before starting the other. For mocked-only stories (`mockedApi: true`), an override (`PLAYGROUND_PORT=<other>` for one of them) works at the cost of losing real API access for that instance.
3. Playwright integration tests keep using `PLAYGROUND_PORT` as `baseURL`. Vue integration tests in `04-03` reuse the same webServer contract with a framework-specific command.

### Shared vs per-package concerns

| Concern | Shared | Per-package |
| --- | --- | --- |
| MSW handlers, mock data, fixtures | `@integration-components/testing` | worker registration, `static/mockServiceWorker.js` |
| SCSS tokens / foundation | `@integration-components/style` | — |
| Env loading (`PLAYGROUND_PORT`, `PLAYGROUND_HOST`) | `envs/getEnvs.ts` | `.storybook/dev.js` |
| Story globs | — | framework-specific glob in `.storybook/main.ts` |
| `preview.tsx` / `preview.ts` | — | framework-specific (JSX vs setup) |
| Decorators, Container utility | — | framework-specific |
| Renderer framework | — | `@storybook/preact-vite` vs `@storybook/vue3-vite` |
| `msw-storybook-addon` | shared version policy | one install per package |
| Global types config (locale list, font family) | duplicated initially; promoted to a shared package only if drift appears | — |

A shared `@integration-components/storybook-config` package is intentionally not introduced on day one — duplication across two packages is cheaper than premature abstraction. Promotion is deferred until concrete drift is observed.

### Upgrade paths (future, not in this plan)

- **Pattern A (composer host).** Add `packages/tools/storybook` with a `@storybook/html-vite` framework and `refs` pointing at the two renderer-specific packages. Requires a second CORS-whitelisted port from the backend.
- **Pattern C (per-domain Storybooks).** Move Storybook config into each domain and reference them from the composer host. Post-migration evolution once team ownership aligns per domain.

Both upgrades are strictly additive and do not require refactoring the two tool packages introduced here.

## Delivery model

### Branch strategy — hybrid model

Merge each migration ticket **directly to `develop`** as a regular PR, with one exception: the parallel domain extraction wave (`02-02` through `02-06`) uses a **short-lived integration branch** (~5 working days).

Default workflow (all phases except Phase 2 domain wave):

1. Each issue is implemented as one PR targeting `develop`.
2. Every PR must leave the repo in a fully working state — build, tests, Storybook, and publish contract all pass.
3. Old import paths and new `@integration-components/*` aliases coexist during transition. Both resolve correctly until the old path is fully removed.
4. Keep issue IDs in PR titles and commits.
5. Feature work by other team members continues on `develop` uninterrupted.

Phase 2 domain wave workflow (`02-02` through `02-06`):

1. `02-01` (reports template) merges to `develop` as a normal PR — it must land first as the reference pattern.
2. Create a short-lived `migration/domain-wave` branch from `develop`.
3. `02-02` through `02-06` merge into this branch as parallel PRs (3 members, 5 domains, ~5 days).
4. The branch merges back to `develop` as a single reviewed merge once all 5 domains are extracted.
5. `02-07` (publish aggregation) merges to `develop` as a normal PR after the domain branch lands.

Why a short branch here: all 5 domain extractions modify the same shared files (root entry point, story discovery, mock infrastructure). Merging them independently to `develop` would create serial rebase chains. A 5-day branch avoids this while keeping the branch short enough that divergence from `develop` is manageable.

Feature work by non-migration team members continues on `develop` during the domain wave. The merge-back after 5 days should produce limited conflicts since the domain wave only touches files being actively migrated.

### Coexistence principle

During migration, the repo will be in a **partially migrated** state where some code lives in `packages/` and some still lives in root `src/`. This is expected and safe as long as:

- The root build entry point keeps working throughout (it re-exports from wherever code currently lives).
- New `@integration-components/*` barrel exports are added as packages are created, but old deep imports keep resolving until all consumers are rewritten.
- Each PR fully migrates one unit (one shared library or one domain) — no half-moved packages.
- The publish contract diff from `00-03` passes on every PR.

### PR slicing rules

- One PR per issue, merged directly to `develop` (except `02-02`–`02-06` which target the domain wave branch).
- Keep mechanical import rewrites separate from conceptual architecture changes where possible.
- Treat `00-03` publish diff results as a release blocker from the moment they exist.
- Land the reports domain first as the template before parallelizing other domains.
- If a feature PR on `develop` adds new code to an area that has already been migrated, the new code must go to the package location, not the old root location.

### Validation model

Every PR must pass the existing root commands before merge:

- `pnpm build`
- `pnpm lint`
- `pnpm types:check`
- `pnpm test`
- `pnpm test:integration`
- `pnpm test:contract`
- `pnpm storybook` / `pnpm storybook:build`

After `03-01`, those same developer entrypoints remain available but delegate to NX targets. The transition is invisible to developers who don't use NX commands directly.

## Timeline baseline

Use `issues/00-00-timeline.md` as the scheduling baseline:

- **38 working days / ~8 weeks** with 3 team members
- **critical path**:

```text
00-01 -> 00-02 -> 01-01 -> 01-02 -> 01-05 -> 01-06 -> 01-07 -> 01-08 -> 01-09 -> 02-01
-> domain extraction wave -> 02-07 -> 03-01 -> 03-02 -> 03-03
-> 04-01 -> 04-03 -> 04-04
```

`01-07` (Preact Storybook tool package) and `01-08` (Vue Storybook tool package scaffold) share ~50% of their work (package scaffolding, NX targets, boundary rules). Running them in parallel adds ~1.5 working days to the critical path, not 3.

Recommended contingency: add a small buffer to `02-07` and `03-04`, because the final agreed `publish` indirection and ESLint layer restrictions make those issues slightly heavier than a minimal NX migration.

---

## Phase 0 — Prove the architecture before touching production code

## `00-01` NX workspace initialization spike

### Objective

Prove that NX can reproduce the current build contract with the agreed target shape.

### Detailed steps

1. Add `nx.json` at the repo root.
2. Extract `vite.preset.ts` from the current root Vite config while preserving:
    - `preserveModules`
    - environment handling
    - JS/CSS/type output shape
    - plugin loading behavior
3. Add `tsconfig.base.json` with `@integration-components/*` path aliases.
4. Create:
    - one sample shared lib
    - one sample domain package using `domain/src`, `preact/src`, `vue/src`, `publish/src`
    - one sample `packages/publish` project
5. Wire the sample domain `publish/src/index.ts` so it re-exports only the Preact surface.
6. Run the sample publish build and compare its output to the current baseline.

### Deliverables

- working NX workspace skeleton
- shared Vite preset
- base tsconfig aliases
- sample domain + sample publish project
- explicit yes/no answer on viability

### Exit criteria

- NX can reproduce the build contract shape
- aliases resolve correctly inside packages
- sample domain publish indirection works

## `00-02` Storybook, SCSS, and affected validation

### Objective

Prove that the three highest-risk platform concerns are viable in the new layout.

### Detailed steps

1. Update Storybook discovery in the spike workspace to `packages/**/stories/**`.
2. Verify story rendering, static assets, and datasets.
3. Move sample SCSS into a package and validate `@use '@integration-components/style'` from package-local code.
4. Modify the sample shared library and confirm `nx affected:build` / `nx affected:test` propagate to dependents correctly.

### Deliverables

- Storybook spike findings
- SCSS alias portability proof
- affected graph proof

### Exit criteria

- package-based stories render
- SCSS compiles from packages
- affected routing behaves correctly

## `00-03` Publish diff tooling and taxonomy

### Objective

Create the publish safety net and boundary rules that protect later phases.

### Detailed steps

1. Implement a diff script or CI step that compares current root output vs NX publish output for:
    - JS files / export names
    - CSS files / hashes
    - `.d.ts` public surface
    - `package.json` entrypoints / exports
2. Define NX tags:
    - `scope:<domain>`
    - `type:shared`
    - `type:domain`
    - `type:publish`
    - `type:tool` — dev-only packages (e.g., Storybook tool packages); never part of the publish graph.
3. Define folder-level domain rules for:
    - `domain/src`
    - `preact/src`
    - `vue/src`
    - `publish/src`
4. Document how later lint rules will encode those constraints.
5. Define cross-project boundary rules:
    - `type:tool` may depend on `type:shared`, `type:domain`, `type:publish`, `type:tool`.
    - `type:shared`, `type:domain`, and `type:publish` declare `bannedExternalImports: ["@integration-components/tools-*"]` so nothing depends on tool packages.

### Deliverables

- publish contract diff tooling
- tag taxonomy (including `type:tool`)
- boundary rule reference (including tool-package rules)

### Exit criteria

- diff tool is stable enough to use after every major restructuring step
- taxonomy is explicit and agreed
- tool packages are enforced as a sink (nothing imports from them)

---

## Phase 1 — Extract the shared foundation first

### Phase objective

Move reusable code into shared packages before splitting domains so domains do not remain coupled to root internals.

## `01-01` Shared `types` and `utils`

### Detailed steps

1. Inventory root types, models, and utility modules.
2. Classify them as shared, domain-specific, or framework-coupled.
3. Create `packages/shared/types` and `packages/shared/utils`.
4. Move only framework-free code.
5. Rewrite imports to `@integration-components/types` and `@integration-components/utils`.
6. Run unit tests and publish diff.

### Done looks like

- shared packages exist and resolve everywhere
- no framework imports exist in them
- root build output is unchanged

## `01-02` Shared `core`

### Detailed steps

1. Create `packages/shared/core`.
2. Move runtime modules from `src/core`:
    - config
    - HTTP client
    - localization
    - session
3. Keep any framework adapters out of `shared/core`.
4. Rewrite imports to `@integration-components/core`.
5. Validate provider initialization still works.

### Done looks like

- runtime API is importable via `@integration-components/core`
- no Preact code lives in shared core
- components still render and tests stay green

## `01-03` Shared `style`

### Detailed steps

1. Create `packages/shared/style`.
2. Move SCSS foundation files and token utilities.
3. Configure alias resolution in the shared Vite preset.
4. Bulk-rewrite `@use` / `@import` calls to `@use '@integration-components/style'`.
5. Compare compiled CSS output.

### Done looks like

- SCSS works from any package
- no deep root-relative SCSS imports remain
- CSS parity is preserved

## `01-04` Shared `testing`

### Detailed steps

1. Create `packages/shared/testing`.
2. Move shared MSW server setup, shared mock data, fixtures, and test utilities.
3. Keep domain-specific mocks in place for Phase 2.
4. Rewrite test imports to `@integration-components/testing`.
5. Run unit, integration, and contract suites.

### Follow-up

After `01-07` lands, the Preact Storybook's `preview.tsx` imports MSW handlers and mock-server setup from `@integration-components/testing` instead of relative root paths. The Vue Storybook introduced in `01-08` consumes the same module from day one.

## `01-05` Shared `hooks-preact`

### Detailed steps

1. Inventory hooks in root `src/hooks` and shared internal usage.
2. Move only hooks reused across domains or clearly infra-level.
3. Leave domain-specific hooks with their future domain.
4. Rewrite imports to `@integration-components/hooks-preact`.
5. Validate related tests.

## `01-06` Shared `ui-primitives-preact`

### Detailed steps

1. Identify internal UI components used across 2+ domains.
2. Move components, co-located styles, and tests into `packages/shared/ui-primitives-preact`.
3. Rewrite consumers to `@integration-components/ui-primitives-preact`.
4. Validate SCSS against `@integration-components/style` and perform Storybook review.

## `01-07` Preact Storybook tool package

### Objective

Relocate the existing root-level Storybook infrastructure into a dedicated tool package (`packages/tools/storybook-preact`) without changing runtime behaviour. This is a pure move + NX wiring ticket.

### Detailed steps

1. Create `packages/tools/storybook-preact` with `package.json` (name: `@integration-components/tools-storybook-preact`, `type:tool` in `project.json` tags, `private: true`).
2. Move into the new package:
    - `.storybook/` (main.ts, preview.tsx, manager.ts, dev.js, tsconfig.json)
    - `stories/utils/*` (`Container.tsx`, `sessionRequest.js`, helpers, styles)
    - `static/mockServiceWorker.js` and `static/mockFiles/`
3. Keep port and CORS contract unchanged: `dev.js` continues to read `PLAYGROUND_PORT` / `PLAYGROUND_HOST` via `envs/getEnvs.ts`.
4. Update path resolution in `.storybook/main.ts` to the new package depth (rootDir, envs, endpoints, SCSS `loadPaths`).
5. Keep the transitional `stories/**` glob in `main.ts` pointing at the root `stories/` folder so Phase 2 domain extraction can relocate stories incrementally. Removal of this glob is deferred to `03-02`.
6. Add `project.json` with targets:
    - `storybook` — dev server via `node .storybook/dev.js`
    - `storybook:build` — `storybook build` for CI
    - `storybook:static` — static build for Playwright `webServer`
7. Rewrite root `package.json` scripts (`storybook`, `storybook:build`, `storybook:static`) to forward to NX targets so developer UX is unchanged.
8. Move Storybook-only devDependencies (`@storybook/*`, `storybook`, `msw-storybook-addon`) out of root `package.json` and into the tool package.
9. Move the root `msw.workerDirectory` entry into the tool package's `package.json`.
10. Record the baseline story count for parity validation in `03-02`.

### Done looks like

- `pnpm storybook`, `pnpm storybook:build`, `pnpm storybook:static` behave identically to before the move.
- Root `.storybook/`, `stories/utils/`, `static/` no longer exist (or exist only as transitional re-exports if needed for Phase 2).
- Playwright integration tests pass against the new static build.
- No change in published artifact.

## `01-08` Vue Storybook tool package scaffold

### Objective

Stand up `packages/tools/storybook-vue` as an empty-but-bootable Vue Storybook so the Vue pilot (`04-03`) does not need to create infrastructure from scratch. This ticket validates the end-to-end Vue + MSW + CORS contract on a smoke story.

### Detailed steps

1. Create `packages/tools/storybook-vue` with `package.json` (name: `@integration-components/tools-storybook-vue`, `private: true`, `type:tool` in `project.json` tags).
2. Install framework: `@storybook/vue3-vite` plus matching addon set kept in version-lockstep with `storybook-preact`.
3. Write minimal `.storybook/main.ts` with `framework: '@storybook/vue3-vite'` and a story glob pointed at `packages/domains/*/stories/vue/**/*.stories.*` (empty during Phase 1).
4. Write `.storybook/preview.ts` with locale/fontFamily globalTypes duplicated from `storybook-preact` (deliberately not extracted to a shared config — see Tooling Packages section).
5. Write `.storybook/dev.js` that reads `PLAYGROUND_PORT` / `PLAYGROUND_HOST` via `envs/getEnvs.ts` identically to the Preact package.
6. Add a runtime guard in `dev.js` that emits a human-readable error if `PLAYGROUND_PORT` is already bound, explaining the mutual-exclusion contract.
7. Install `msw-storybook-addon` and wire it up in `preview.ts`. Confirm compatibility with Vue 3 by running a single smoke story that exercises an MSW-mocked request (de-risks `04-03`).
8. Write a placeholder `src/utils/Container.ts` targeting a stubbed Vue public API surface (`AdyenPlatformExperienceVue`). The real shape is finalized in `04-03`; the placeholder anchors the API footprint early.
9. Add `project.json` with `storybook` and `storybook:build` targets.
10. Add root `package.json` scripts: `storybook:preact`, `storybook:vue`, `storybook:build:preact`, `storybook:build:vue`. Keep `pnpm storybook` aliased to the Preact target for backward compatibility.
11. Pin `storybook` core and `msw-storybook-addon` versions across both tool packages via pnpm overrides; add a pre-push check asserting the two `package.json` manifests declare identical versions.

### Done looks like

- `pnpm storybook:vue` boots a working Vue Storybook on `PLAYGROUND_PORT`.
- MSW-mocked request succeeds in the smoke story.
- Starting the Vue Storybook while the Preact one is running fails with a helpful message.
- CI pipeline builds both `storybook-preact` and `storybook-vue` via NX.
- No domain-owned Vue stories exist yet; population is scheduled for `04-03`.

## `01-09` Barrels and cleanup

### Detailed steps

1. Audit every shared package barrel for completeness.
2. Remove any remaining imports into shared internals.
3. Delete dead duplicated code from root `src`.
4. Run the full test suite and publish diff.

### Phase 1 exit gate

- all shared APIs are consumed through `@integration-components/*`
- no deep shared-internal imports remain
- publish diff stays clean
- full tests pass
- both Storybook tool packages boot successfully and share `PLAYGROUND_PORT` with mutual-exclusion enforcement

---

## Phase 2 — Extract business domains

### Branch workflow

1. `02-01` (reports template) merges to `develop` as a normal PR.
2. Create the `migration/domain-wave` branch from `develop`.
3. `02-02` through `02-06` merge into `migration/domain-wave` as parallel PRs (~5 days).
4. The domain wave branch merges back to `develop` as a single reviewed merge.
5. `02-07` (publish aggregation) merges to `develop` as a normal PR.

### Standard domain extraction recipe

Use the same migration template for every domain:

1. Create domain package skeleton and metadata.
2. Add `domain/src`, `preact/src`, `vue/src`, `publish/src`, `stories`, `mocks`, `tests`.
3. Move current shipped implementation into `preact/src`.
4. Extract business logic into `domain/src`.
5. Add placeholder Vue layer under `vue/src`.
6. Move stories, mocks, and tests into the domain package.
7. Wire `publish/src/index.ts` to re-export only the current shipped Preact surface.
8. Update the root build entry point to re-export from the new package location.
9. Rewrite imports to allowed layers only.
10. Run Storybook, targeted tests, and publish diff.

## `02-01` Reports template

### Why first

Reports is the smallest and lowest-risk domain. It becomes the reference example for every other domain. Merges directly to `develop`.

### Special requirements

- document the pattern for later domains
- prove `publish/src/index.ts` works in a real domain
- document root entry point rewiring for subsequent domains

## `02-02` Payouts

### Scope

- `PayoutsOverview`
- `PayoutDetails`

### Migration focus

- preserve both public exports
- move all related stories/tests/mocks together

## `02-03` Payment Links

### Scope

- `PaymentLinksOverview`
- `PaymentLinkCreation`
- `PaymentLinkDetails`
- `PaymentLinkSettings`

### Migration focus

- shared view-state between creation and details
- country dataset mocks and MSW handlers
- largest amount of intra-domain coordination aside from Capital

## `02-04` Disputes

### Scope

- `DisputeManagement`
- `DisputesOverview`

### Migration focus

- maintain the large integration test surface while relocating package ownership

## `02-05` Transactions

### Scope

- `TransactionsOverview`
- `TransactionDetails`

### Migration focus

- date filter presets
- pagination state
- contract coverage plus large integration suite

## `02-06` Capital

### Scope

- `CapitalOverview`
- `CapitalOffer`

### Migration focus

- grant models
- offer calculations
- API contracts
- largest integration surface
- confirm root external component folder is effectively empty afterward

## `02-07` Root publish aggregation

> Merges to `develop` after the domain wave branch has landed.

### Detailed steps

1. Create `packages/publish`.
2. Re-export from each domain's `@integration-components/<domain>/publish`.
3. Reproduce the exact dist shape via NX/Vite/tsc.
4. Only after parity is proven, point root `package.json` entrypoints to the new output.
5. Re-run publish diff and downstream consumption checks.

### Phase 2 exit gate

- all public components now live in domain packages
- root aggregator imports only domain `publish` entrypoints
- publish contract remains unchanged

---

## Phase 3 — Make NX the operational source of truth

## `03-01` Root scripts delegate to NX

### Detailed steps

1. Replace direct root build/test/lint/typecheck orchestration with NX target wrappers.
2. Configure dependency chaining shared -> domains -> publish.
3. Keep old root build config only as fallback reference until stabilization is complete.
4. Verify familiar `pnpm` entrypoints still work.

## `03-02` Storybook story glob finalization

### Objective

Close out the transitional story discovery windows that `01-07` left open once Phase 2 has moved every story into its owning domain package. Heavy lifting (tool-package relocation, NX targets, boundary rules) already landed in `01-07` / `01-08`.

### Detailed steps

1. Confirm every story file now lives under `packages/domains/*/stories/{preact,vue}/` — audit repo for stragglers.
2. Remove the transitional `stories/**` glob from `packages/tools/storybook-preact/.storybook/main.ts`.
3. Confirm `packages/tools/storybook-vue/.storybook/main.ts` globs only `packages/domains/*/stories/vue/**`.
4. Delete the root `stories/` folder (including any remaining datasets / assets that should have migrated to their owning packages).
5. Validate story count parity against the baseline recorded in `01-07`.
6. Verify static assets, datasets, and MSW behavior still resolve from the tool packages.

## `03-03` CI migration

### Detailed steps

1. Update PR workflows to NX targets for build/lint/typecheck/unit.
2. Build Storybook via NX in integration workflows.
3. Keep integration/build on full-workspace runs initially.
4. Enable `nx affected` only for lint and unit at first.
5. Fix env handling for static Storybook URLs.

## `03-04` Boundary enforcement

### Detailed steps

1. Add `@nx/enforce-module-boundaries` for cross-project rules.
2. Add folder-level ESLint path restrictions for intra-domain rules.
3. Tag all projects correctly.
4. Fix all violations.
5. Gate CI on both classes of rules.

### Rules that must hold

- domain projects cannot import other domain projects
- publish can only import domains through `@integration-components/<domain>/publish`
- shared cannot import domain or publish layers
- `domain/src` cannot import `preact/src`, `vue/src`, or `publish/src`
- `preact/src` and `vue/src` can import `domain/src`, but not each other
- `publish/src` is the only layer allowed to compose the publish surface

## `03-05` Publish diff in CI

### Detailed steps

1. Run the publish diff on every PR.
2. Fail on accidental JS/CSS/types/entrypoint changes.
3. Provide an intentional baseline-update path for approved contract changes.

### Phase 3 exit gate

- root operations run through NX
- lint/unit are affected-aware
- boundary rules are enforced automatically
- publish diff blocks regressions in CI

---

## Phase 4 — Stabilize, then open the Vue lane

## `04-01` Stabilization sweep

### Detailed steps

1. Sweep for stale imports, flaky tests, story discovery misses, and publish regressions accumulated across incremental PRs.
2. Confirm root `src/` contains no code that should have been migrated — delete any remaining dead files.
3. Tune NX cache inputs/outputs — verify cache hits are correct and no stale builds occur.
4. Re-run the full CI matrix and publish diff.
5. Run a package dry-run publish to confirm the artifact is shippable.

## `04-02` Generators

### Detailed steps

1. Implement domain generator for the final package shape.
2. Implement component generator for `domain/src`, `preact/src`, and `vue/src`.
3. Optionally wire new components into `publish/src/index.ts`.
4. Add shared-lib generator.

## `04-03` Vue pilot

### Detailed steps

1. Use `reports` as the pilot domain.
2. Finalize the Vue public API surface (`AdyenPlatformExperienceVue` or equivalent) — explicit design deliverable, not implicit. Replace the placeholder `Container.ts` scaffolded in `01-08` with the real entry point.
3. Implement the Vue version under `vue/src/<Component>`.
4. Share logic from `domain/src/<Component>`.
5. Populate `packages/tools/storybook-vue` with Reports Vue stories under `packages/domains/reports/stories/vue/`. No composer host is introduced; developers run the Preact and Vue Storybooks on the same `PLAYGROUND_PORT` mutually exclusively (`pnpm storybook:preact` vs `pnpm storybook:vue`).
6. Add unit and integration tests. Decide Playwright scoping in this ticket — either (a) extend the existing `local-chrome` project with a `STORYBOOK_TARGET=vue` switch that flips the webServer command, or (b) introduce a `local-chrome-vue` project reusing the same `baseURL`. Document the choice.
7. Keep `publish/src/index.ts` pointing to Preact during the pilot.
8. Confirm Vue remains outside the published bundle.
9. Document the single-port mutual-exclusion workflow in the Vue pilot acceptance notes so the rest of the team understands the dev-loop contract.

## `04-04` Vue switchover checklist

### Detailed steps

1. Document readiness checks:
    - feature parity
    - integration results
    - visual parity
    - accessibility
    - performance
    - stakeholder approval
2. Define rollback by re-pointing the domain's `publish/src/index.ts` back to Preact.
3. Make it explicit that the root aggregator does not change during a domain switchover.

### Phase 4 exit gate

- the repo has a validated Vue pilot
- publish isolation still holds
- switchover mechanics are documented and reversible

---

## Validation matrix

## Per issue

- targeted unit tests for moved code
- Storybook smoke check where UI is involved
- integration and/or contract tests for affected domains
- publish diff whenever dist shape or entrypoints are touched

## Per phase

- `pnpm build`
- `pnpm lint`
- `pnpm types:check`
- `pnpm test`
- `pnpm test:integration`
- `pnpm test:contract`
- `pnpm storybook:build` or equivalent Storybook validation

## Per PR (incremental merge gate)

- CI green (build, lint, typecheck, unit, integration, contract)
- publish diff clean
- no half-moved packages — each PR fully migrates one unit

## Main risks and mitigations

### Build contract drift

- Mitigation: publish diff from Phase 0 onward

### Storybook regressions after relocation

- Mitigation: validate in `00-02`, operationalize in `03-02`, sweep in `04-01`

### SCSS alias failures inside packages

- Mitigation: solve once in `vite.preset.ts`, validate before moving production styles

### Vue leaking into the published bundle

- Mitigation: root publish imports only domain `publish` entrypoints; domain `publish/src/index.ts` remains Preact-only until explicit switchover

### Architecture rules existing only on paper

- Mitigation: enforce cross-project rules in NX and intra-domain rules in ESLint

### Coexistence complexity during partial migration

- Mitigation: re-export shims at old locations keep both old and new paths resolving; shims are cleaned up in `01-09` (shared) and `04-01` (final sweep). Each PR must pass the full CI gate including publish diff.

### `msw-storybook-addon` Vue 3 compatibility

- Mitigation: validated during `01-08` on a smoke story, not deferred to `04-03`. If incompatible, `01-08` surfaces it early and either pins a compatible version or designs a manual MSW-in-preview fallback.

### Storybook dependency drift between Preact and Vue tool packages

- Mitigation: pnpm overrides pin `storybook` core and `msw-storybook-addon` to identical versions across both packages. A pre-push check asserts the two `package.json` manifests declare identical versions. Drift across the two Storybooks causes subtle HMR, worker-registration, and addon-loading bugs that are expensive to diagnose.

### Single-port CORS constraint confusing contributors

- Mitigation: `01-08`'s `dev.js` includes a runtime guard that fails fast with a human-readable error if `PLAYGROUND_PORT` is already bound. Root `package.json` scripts (`storybook:preact`, `storybook:vue`) document the mutual-exclusion contract. The Tooling Packages section of this plan describes the single-port rationale in full.

### Vue public API design bottleneck

- Mitigation: the public API surface (`AdyenPlatformExperienceVue` or equivalent) is an explicit deliverable in `04-03`, not implicit. The placeholder `Container.ts` in `01-08` anchors the API shape early — even if the implementation lands later, the shape is locked in before stories are written against it.

## Definition of done

The migration is complete when all of the following are true:

1. shared code is extracted into explicit shared packages
2. external components are owned by domain packages
3. root publish imports only `@integration-components/<domain>/publish`
4. the npm package contract remains compatible with the current release
5. Storybook and CI run through NX targets
6. boundaries are enforced automatically
7. Vue can coexist in-domain without affecting what is published
8. generators and switchover documentation exist for future work
9. two independent Storybook instances (`packages/tools/storybook-preact`, `packages/tools/storybook-vue`) are discoverable via NX targets, isolated from the publish graph, and both consume `PLAYGROUND_PORT` from `envs/*` with mutual-exclusion enforcement
10. tool packages are enforced as a sink (nothing depends on them) by NX module-boundary rules and ESLint

## Recommended execution order

```text
00-01
-> 00-02 + 00-03
-> 01-01
-> 01-02 + 01-03
-> 01-04 + 01-05
-> 01-06
-> 01-07 (Preact SB) + 01-08 (Vue SB scaffold)
-> 01-09
-> 02-01
-> 02-03 + 02-04 + 02-06 + 02-02
-> 02-05
-> 02-07
-> 03-01
-> 03-02 + 03-04 + 03-05
-> 03-03
-> 04-01
-> 04-02 + 04-03
-> 04-04
```

`01-07` and `01-08` touch disjoint package directories and run in parallel. `01-09` depends on both landing.

## Planning-only note

This document intentionally stops at planning. Source moves, config changes, NX setup, and migration work should only start when implementation is explicitly requested.
