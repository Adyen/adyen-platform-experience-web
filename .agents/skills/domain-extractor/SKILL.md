---
name: domain-extractor
description: This skill should be used when the user asks to "extract a domain", "extract the next domain", "split out the X domain", "move X to its own package", or otherwise wants to migrate one of the external components (transactions, payouts, disputes, capital, payByLink, etc.) from the root `src/components/external/` tree into `packages/domains/<domain>/` following the layered `domain/preact/vue/publish` model. Reuses every learning from the reports extraction (the first reference domain) and enforces the conventions documented in `BOUNDARIES.md`.
user-invocable: true
disable-model-invocation: false
---

# Domain Extractor

## Goal

Extract one external-component domain from root (`src/components/external/<Component>/`, `src/hooks/`, `src/types/`, `mocks/`, `tests/integration/components/`, etc.) into `packages/domains/<domain>/` following the **`domain → preact → publish`** layered model defined in `BOUNDARIES.md`. Keep the public published contract unchanged, isolate the package, and verify with the same gates that landed reports.

The reports domain (under `packages/domains/reports/`) is the canonical reference. Mirror its layout unless `BOUNDARIES.md` says otherwise.

## When to Use

Invoke this skill when the user asks to extract any of these still-in-root domains:

- `capital` (CapitalOverview + CapitalOffer)
- `payByLink` (PaymentLinksOverview + PaymentLinkCreation + PaymentLinkDetails)
- `paymentLinkSettings` (PaymentLinkSettings)

Already extracted (use as reference, not targets):

- `reports` — first reference domain
- `payouts`
- `transactions`
- `disputes`

Do **not** invoke for cross-cutting refactors (e.g. moving shared hooks into `@integration-components/hooks-preact`); those are unrelated to a domain split.

## Inputs

Before starting, gather:

1. **Domain name** (lowercase, single token, e.g. `transactions`)
2. **External components owned by the domain** — the entries under `src/components/external/<X>/`
3. **Domain-specific hooks/types/mock-data** still at root that should travel with the move
4. **Cross-cutting endpoints** the domain currently uses (those stay in `@integration-components/testing/msw`)
5. **Any vue layer** the domain has (some domains do, some don't)

Confirm scope with the user before moving files. Mis-scoping is the most common cause of rework.

## Pre-Extraction Checklist

Run this before touching any files. If anything fails, surface it to the user before proceeding:

- [ ] On a fresh branch off `develop` (`git checkout -b feature/extract-<domain>-domain`)
- [ ] Reports extraction is fully merged or your base includes `packages/domains/reports/` — you need it as a template
- [ ] `pnpm install` clean, `pnpm run types:check`, `pnpm run lint`, `pnpm run build` all green on baseline
- [ ] Identify all imports **into** the domain from root and outside-domain code (`rg "src/components/external/<X>/" -l`)
- [ ] Identify all imports **from** the domain back into root that aren't already covered by shared packages — these become the deep-relative-import problem you must solve

## Process

### Phase 1 — Scaffold the package

Mirror the reports layout exactly. Create:

```
packages/domains/<domain>/
├── package.json           # workspace deps + devDeps + peerDeps (see template below)
├── tsconfig.json          # extends ../../../tsconfig.base.json
├── project.json           # NX config, sourceRoot
├── domain/src/            # framework-agnostic domain logic
├── preact/src/            # Preact components, hooks, styles
├── preact/stories/        # Storybook stories (mocked variants)
├── publish/src/           # public barrel exposed via @integration-components/<d>/publish
├── vue/                   # only if a Vue layer exists
├── mocks/
│   ├── endpoints.ts       # domain-owned endpoint constants
│   ├── mock-data/         # domain payloads
│   └── mock-server/       # MSW handlers + handler-variant objects
└── tests/
    ├── integration/       # Playwright integration specs
    └── contract/          # Playwright contract specs
```

`package.json` template (copy from reports, adjust the `name`):

```json
{
    "name": "@integration-components/<domain>",
    "version": "0.0.1",
    "private": true,
    "type": "module",
    "exports": {
        "./publish": "./publish/src/index.ts",
        "./preact": "./preact/src/index.ts",
        "./domain": "./domain/src/index.ts"
    },
    "dependencies": {
        "@integration-components/core": "workspace:*",
        "@integration-components/hooks-preact": "workspace:*",
        "@integration-components/sdk-internal": "workspace:*",
        "@integration-components/style": "workspace:*",
        "@integration-components/testing": "workspace:*",
        "@integration-components/types": "workspace:*",
        "@integration-components/ui-primitives-preact": "workspace:*",
        "@integration-components/utils": "workspace:*"
    },
    "peerDependencies": { "preact": "catalog:" },
    "devDependencies": {
        "@playwright/test": "^1.56.0",
        "@storybook/preact": "10.2.12",
        "dotenv": "^17.2.3",
        "msw": "^2.4.5"
    }
}
```

Add Vue dev deps (`@storybook/vue3`, `vue`) **only** if the domain has a Vue layer.

### Phase 2 — Move source files

Use `git mv` to preserve history. Move in this order to avoid intermediate broken states:

| From (root)                                                            | To (package)                                                  |
| ---------------------------------------------------------------------- | ------------------------------------------------------------- |
| `src/components/external/<X>/**`                                       | `packages/domains/<d>/preact/src/<X>/**`                      |
| `src/hooks/use<DomainSpecific>.ts`                                     | `packages/domains/<d>/preact/src/hooks/` (if domain-only)     |
| `src/types/<domain-types>.ts`                                          | `packages/domains/<d>/domain/src/types.ts` (or split)         |
| `mocks/mock-data/<domain>/**`                                          | `packages/domains/<d>/mocks/mock-data/**`                     |
| `mocks/mock-server/<domain>.ts`                                        | `packages/domains/<d>/mocks/mock-server/<d>.ts`               |
| `stories/mocked/<domain>.stories.tsx`                                  | `packages/domains/<d>/preact/stories/<d>.mocked.stories.tsx`  |
| `tests/integration/components/<domain>/**`                             | `packages/domains/<d>/tests/integration/<d>/**`               |
| `tests/contract/<domain>/**`                                           | `packages/domains/<d>/tests/contract/<d>/**`                  |
| `src/components/utils/translation/getters.ts` (domain-specific subset) | `packages/domains/<d>/domain/src/<Component>/translations.ts` |

Co-locate translation getters (`get<Domain><X>Type`) with the domain types in `domain/src/`. Have the root `getters.ts` re-export them transitively for back-compat:

```ts
// src/components/utils/translation/getters.ts
export { getPayoutAdjustmentType, getPayoutFundsCapturedType } from '@integration-components/payouts/domain';
```

After moving, **commit** so the history shows pure renames; subsequent edits land in a separate commit.

### Phase 3 — Configure ownership of mock endpoints and fixtures

Per `BOUNDARIES.md` § "MSW endpoint ownership":

1. Create `packages/domains/<d>/mocks/endpoints.ts`:

    ```typescript
    import { MSW_BASE_URL } from '@integration-components/testing/msw';

    export const <DOMAIN>_ENDPOINTS = {
        // domain-specific paths only
        list: `${MSW_BASE_URL}/<domain>`,
        details: `${MSW_BASE_URL}/<domain>/:id`,
        // ...
    } as const;
    ```

2. If the domain uses cross-cutting endpoints (e.g. `balanceAccounts`), import them from `@integration-components/testing/msw` **directly** rather than re-declaring.

3. Remove the migrated entries from root `endpoints/endpoints.ts`. Verify with:

    ```bash
    rg "endpoints\(\)\.(<key1>|<key2>)" --glob '!packages/domains/**'
    ```

    It must return zero hits before deletion.

#### Cross-cutting mock fixtures

If the domain consumes shared mock data from root `mocks/mock-data/` (e.g. `BALANCE_ACCOUNTS`, `BALANCES`, `getDate`), promote them to `@integration-components/testing/fixtures` instead of deep-relative-importing root `mocks/`. The payouts extraction added this subpath; reuse it.

1. Move the shared fixture into `packages/shared/testing/src/fixtures/<x>.ts` and re-export from `packages/shared/testing/src/fixtures/index.ts`.
2. Add the export entry to `packages/shared/testing/package.json`:

    ```json
    "exports": {
        "./fixtures": "./src/fixtures/index.ts",
        "./msw": "./src/msw/index.ts",
        ...
    }
    ```

3. Convert the root `mocks/mock-data/<x>.ts` into a thin re-export so existing root consumers keep working:

    ```ts
    export { BALANCE_ACCOUNTS, BALANCES } from '@integration-components/testing/fixtures';
    ```

4. Update the domain's mocks to import from the new path:

    ```ts
    import { BALANCE_ACCOUNTS, getDate } from '@integration-components/testing/fixtures';
    ```

The wildcard `@integration-components/testing/*` alias already resolves both single-file and directory-with-`index.ts` subpaths — no `tsconfig.base.json` change needed.

### Phase 4 — Path aliases & barrels

1. **`tsconfig.base.json`** — add the three subpath aliases:

    ```json
    "@integration-components/<domain>/publish": [".../publish/src/index.ts"],
    "@integration-components/<domain>/preact":  [".../preact/src/index.ts"],
    "@integration-components/<domain>/domain":  [".../domain/src/index.ts"]
    ```

2. **`packages/sdk/vite.config.ts`** — add resolve.alias entries for the new domain's three subpaths. Rollup cannot resolve pnpm workspace `exports` map entries at build time; it needs explicit Vite aliases. Add:

    ```ts
    '@integration-components/<domain>/publish': resolve(rootDir, 'packages/domains/<d>/publish/src'),
    '@integration-components/<domain>/preact': resolve(rootDir, 'packages/domains/<d>/preact/src'),
    '@integration-components/<domain>/domain': resolve(rootDir, 'packages/domains/<d>/domain/src'),
    ```

    Also verify that all previously-extracted domains and shared packages have their aliases present. If any are missing (e.g. `ui-primitives-preact`, `style`, `sdk-internal`), add them in the same commit. A missing alias causes a `Rollup failed to resolve import` build failure.

3. **`packages/sdk/src/index.ts`** — replace any `import { ... } from '../../src/components/external/<X>'` with `from '@integration-components/<domain>/publish'`. The SDK must **only** consume domains via their `publish` entrypoint.

4. **`src/components/external/index.ts`** and **`src/components/types.ts`** — if anything still re-exports the moved component, update or remove those re-exports.

### Phase 5 — Replace deep-relative imports and cross-domain leaks

Inside the moved files, every `../../../../../src/...` import is now broken or a leak. Replace with package aliases:

| Deep-relative import (bad)                                                      | Replacement (good)                            |
| ------------------------------------------------------------------------------- | --------------------------------------------- |
| `../../../../../src/utils/...`                                                  | `@integration-components/utils`               |
| `../../../../../src/types/...`                                                  | `@integration-components/types`               |
| `../../../../../src/core/...`                                                   | `@integration-components/core` (or `/preact`) |
| `../../../../../src/hooks/...`                                                  | `@integration-components/hooks-preact`        |
| `../../../../../src/components/internal/DataOverviewDisplay/styles.scss` (SCSS) | `@integration-components/style/mixins`        |

**Exception** — root `src/components/internal/*` Preact UI primitives (Button, Modal, Alert, etc.) may still be deep-imported transitionally. Document the exception in `BOUNDARIES.md` § "Transitional exceptions" if it's a new domain. Plan to migrate behind a shared Preact UI package later — do not normalize this for the new domain.

#### Cross-domain Preact imports → promote to `ui-primitives-preact`

Domains must **not** import from other domain packages (`type:domain → type:domain` is forbidden in `BOUNDARIES.md`). If the extracted domain imports Preact components/hooks from another domain (e.g. `MultiSelectionFilter` from `@integration-components/transactions/preact`), **extract the shared piece to `ui-primitives-preact`** before or during the extraction:

1. Identify all cross-domain Preact imports: `rg "from '@integration-components/(?!core|hooks|types|utils|style|testing|sdk|ui-primitives)" packages/domains/<d>`
2. For each hit, assess whether the imported symbol is truly domain-specific or generic (reusable). Generic components/hooks/utilities should move to `@integration-components/ui-primitives-preact` (or `hooks-preact` for hooks).
3. Create the new module in ui-primitives-preact, update all consumers (including the source domain), and optionally leave backward-compat re-exports in the source domain's `index.ts`.
4. **Type decoupling**: If the moved component's types reference a domain-specific type (e.g. `Pick<UsePaginatedRecords<any, string, TransactionsOverviewMultiSelectionFilterParam>, ...>`), replace with a generic equivalent (e.g. `Record<string, string | undefined>`). This makes the type truly reusable without pulling in domain constants.
5. Also check `packages/shared/` for **shared→domain** boundary violations (e.g. `ui-primitives-preact/StatusBox/utils.ts` importing `parsePaymentMethodType` from transactions). These are illegal and must be fixed by making the shared package import locally.

The disputes extraction promoted `MultiSelectionFilter`, `useMultiSelectionFilter`, `PaymentMethodCell`, and `parsePaymentMethodType` from transactions to `ui-primitives-preact` — use those as reference.

#### Shared customization types ledger

`packages/shared/types/src/customization.ts` is the home for cross-domain customization shapes. Reuse — don't duplicate. Already promoted there:

- `DataCustomizationObject<Columns, DataRetrieved, CallbackResponse>`
- `DetailsDataCustomizationObject<Columns, DataRetrieved, CallbackResponse>`
- `CustomDetailsField<T>`, `DetailsCustomFieldConfig<k>`
- `DetailsWithExtraData<T>` (the `{ dataCustomization?: { details?: T } }` wrapper)
- `CustomDataObject` (Icon/Text/Link/Button variants), `CustomDataRetrieved`, `OnDataRetrievedCallback`

If your extraction surfaces a _new_ domain-agnostic customization type (e.g. for Vue-side customization or a new `OverviewDataCustomization` shape), promote it here in a separate commit before the bulk move. Do not leave duplicate copies in the domain layer.

### Phase 5b — Root mock aggregation re-exports

Root `mocks/mock-data/index.ts` and `mocks/mock-server/index.ts` aggregate exports from all domains. After moving mock files into the domain package, update these root files to re-export from the new location:

```ts
// mocks/mock-data/index.ts
export * from '../../packages/domains/<d>/mocks/mock-data/<d>';
```

Also update `src/components/utils/translation/getters.ts` to re-export domain-specific translation factories from the domain package instead of duplicating the logic:

```ts
export { get<Domain>Reason, get<Domain>Status, get<Domain>Type } from '@integration-components/<d>/domain';
```

### Phase 6 — Lint, types, and tooling configs

Update these to include the new package:

- **`.eslintrc.cjs`** — extend `ignorePatterns` / `overrides` if needed; ensure `packages/domains/<d>/**` is linted under the same rules as the rest of `packages/`
- **`.lintstagedrc.cjs`** — extend the globs to match `packages/domains/**`
- **`scripts/eslint-playwright-selectors.cjs`** — add `packages/domains/*/tests/integration/**/*.spec.ts` to the guarded glob list
- **Root `package.json`**:
    - `types:check` script — add `tsc --noEmit --project packages/domains/<d>/tsconfig.json`
    - Make sure `lint`, `lint:playwright-selectors` cover the new package
- **`scripts/check-publish-contract/baseline.json`** — re-run `pnpm run check-publish-contract` and react based on which case applies:
    - **Case A — only file paths/types changed, JS exports count unchanged**: this is expected for an extraction (e.g. payouts moved 23 type files added / 20 removed but kept `js_exports: 2`). Run `pnpm run check-publish-contract:update` to bump the baseline and commit separately: `chore: update publish-contract baseline after <domain> extraction`.
    - **Case B — JS exports changed**: STOP. The extraction broke the public contract. Inspect the diff (`git diff scripts/check-publish-contract/baseline.json`) and fix the extraction (likely a missing re-export in `src/components/external/index.ts` or `packages/sdk/src/index.ts`) before continuing.

### Phase 7 — Update BOUNDARIES.md

If your extraction surfaces a new transitional exception (e.g. an unavoidable deep import that can't be replaced without another shared-package extraction), add an entry under `### Transitional exceptions`. Use the table format already established by the payouts entry:

```markdown
<Domain> inherits the same `src/components/internal/*` exception and additionally has <N> Preact-coupled deep-import(s):

| Import                     | Consumer                                         | Reason                                                                                                                            |
| -------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/utils/<x>` | `packages/domains/<d>/preact/src/.../<File>.tsx` | Cannot move to `@integration-components/utils` because <reason>. Will migrate alongside <Y> when the <Z> package is bootstrapped. |

Do not introduce new exceptions of this kind in subsequent domains. Either reuse this entry (if the same import is already covered) or promote the dependency to a shared package before extracting.
```

Each row should clearly state:

- **Import** — the exact deep-relative path
- **Consumer** — the package-relative file that needs the import
- **Reason** — why it can't currently be promoted, and which future shared package will absorb it

Audit before opening the PR: `rg "from '\.\./" packages/domains/<d> | rg -v 'src/components/internal'`. Every match that survives must have an entry.

## Critical Gotchas (lessons from the reports extraction)

These bit us during the reports extraction. Catch them early:

### 1. JSON imports are runtime-specific

Node ESM (Playwright) **requires** `with { type: 'json' }`; Vite/browser **breaks** with the attribute (strict MIME). Apply selectively:

| File loaded by              | Attribute                       |
| --------------------------- | ------------------------------- |
| Vite / browser / Storybook  | **No** `with { type: ... }`     |
| Node / Playwright / scripts | **Yes** `with { type: 'json' }` |

Failing patterns:

- `Failed to load module script: Expected a JSON module script but ... MIME type 'text/javascript'` → remove the attribute
- `Module "...json" needs an import attribute of "type: json"` → add the attribute

### 2. Circular dependencies between core and hooks-preact

If you find yourself adding a Preact hook in `@integration-components/core`, stop. Move it to `@integration-components/core/preact` (a sub-entry that depends on hooks-preact one-way) or to `@integration-components/hooks-preact`. Reports surfaced this with `useMutation`, `usePushAnalyticEvent`, `useFetch`.

### 3. Lockfile drift

Always run `pnpm install` after changing any `package.json`. Then `pnpm install --lockfile-only --frozen-lockfile` should succeed without changes. If CI complains about lockfile, you forgot this step.

### 4. Storybook test selector lint

The selector-guard ESLint rule (`scripts/eslint-playwright-selectors.cjs`) forbids `[class*="adyen-pe-..."]` selectors in integration tests. Use framework-agnostic locators (roles, labels, data-testids). When you expand the guard's glob to cover `packages/domains/**`, fix any pre-existing violations the guard now catches.

### 5. Endpoint duplication

Do **not** keep domain-owned endpoints in root `endpoints/endpoints.ts` "just in case." Two sources of truth drift. Verify zero root consumers, then delete.

### 6. Storybook MSW preview registration

Mocked stories must register their handlers via the `parameters.msw.handlers` array on each story (or `meta.parameters.msw`), and the MSW worker is bootstrapped in `packages/shared/testing/src/msw/preview.tsx`. Don't reimplement the bootstrap in the domain package.

### 7. SCSS mixins live in `@integration-components/style`

Don't `@use` root `src/components/internal/DataOverviewDisplay/styles.scss` from the domain package. Use `@integration-components/style/mixins` and the `adyen-pe-data-overview` mixin defined there. If the mixin you need isn't shared yet, move it into the shared style package first.

### 8. Domain-package `tsconfig.json` `include` is exhaustive

Any new top-level subdirectory you add (e.g. `vue/publish/src`) must be added to the `include` array, or types:check silently skips it.

### 9. Cross-domain leaks on moved "generic" internals

When you move an internal component that was generic across multiple domains (e.g. `src/components/internal/DataOverviewDetails/`, `DataDetailsModal`, `ModalContent`), grep the moved files for hardcoded references to _other_ domains' types/constants before committing. The payouts extraction surfaced two leaks in `internal/DataOverviewDetails/`:

| Leak                             | Source                                                    | Resolution                                                                                                       |
| -------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `TX_DETAILS_RESERVED_FIELDS_SET` | `src/components/external/TransactionDetails/constants.ts` | Drop entirely if inappropriate for the new domain (it was a copy-paste artifact); rely on domain-local field set |
| `DetailsWithExtraData<T>`        | `src/components/external/TransactionDetails/types.ts`     | Promote to `@integration-components/types/customization.ts` (it's domain-agnostic)                               |

Audit pattern:

```bash
rg "from '.*src/components/external/(?!<Component>)" packages/domains/<d>
```

Any hit is a cross-domain leak that must be resolved before the PR.

### 10. Path-depth (7 vs 8 `../`) when rewriting transitional imports

The number of `../` segments back to root `src/` depends on file nesting:

| File location                                            | Depth |
| -------------------------------------------------------- | ----- |
| `packages/domains/<d>/preact/src/<C>/components/X.tsx`   | 7     |
| `packages/domains/<d>/preact/src/<C>/components/X/Y.tsx` | 8     |
| `packages/domains/<d>/preact/src/internal/<X>/File.tsx`  | 7     |

Easy to mis-count when bulk-rewriting. Verify with `pnpm run types:check`; TS errors will surface immediately.

### 11. Self-contained skeleton when leaving something in root

If you leave a component in root that previously imported domain-specific constants/SCSS (e.g. `DataOverviewDetailsSkeleton` reuses constants from the moved `DataOverviewDetails`), restore a root `constants.ts` and create a fresh `<Skeleton>.scss` so the leftover compiles standalone. The payouts extraction had to:

- Restore `src/components/internal/DataOverviewDetails/constants.ts` with payout-agnostic class names
- Create `src/components/internal/DataOverviewDetails/DataOverviewDetailsSkeleton.scss`
- Re-import the new SCSS from the skeleton component

### 12. Subpath imports for shared hooks/utils not in the package barrel

Some shared hooks/utils aren't re-exported from their package's main barrel. Use the subpath form rather than reaching into root:

| Symbol            | Subpath import                                                 |
| ----------------- | -------------------------------------------------------------- |
| `useModalDetails` | `@integration-components/hooks-preact/useModalDetails`         |
| `getCurrencyCode` | `@integration-components/core/Localization/amount/amount-util` |

The `@integration-components/<pkg>/*` wildcard alias resolves these without further config.

### 13. Hoisted-constant naming collisions

When hoisting a value that has the same short name in multiple consumer files (every preact component file has its own `BASE_CLASS = '<...>'`), the shared module needs **uniquely-prefixed names** because they all live in one namespace once exported from `@integration-components/<d>/domain`. Local consumers re-export with `as BASE_CLASS` so call sites stay untouched:

```ts
// domain/src/ReportsOverview/constants.ts
export const REPORTS_OVERVIEW_CLASS = 'adyen-pe-reports-overview';
export const REPORTS_TABLE_CLASS = 'adyen-pe-reports-table';
export const REPORTS_DOWNLOAD_DISABLED_TIMEOUT = 1000;
```

```ts
// preact/src/ReportsOverview/components/ReportsOverview/constants.ts
export { REPORTS_OVERVIEW_CLASS as BASE_CLASS, EARLIEST_PAYOUT_SINCE_DATE } from '@integration-components/reports/domain';
```

Don't reuse `BASE_CLASS` itself as the exported symbol — the second consumer (vue, or another preact subcomponent) will collide. `EARLIEST_PAYOUT_SINCE_DATE`-style names that are already domain-disambiguated keep their name as-is.

### 14. Cross-domain deps declared in `package.json`

If the domain legitimately imports from another domain (e.g. disputes using transactions' `MultiSelectionFilter`), the importing domain's `package.json` must list the dependency. ESLint's `import-x/no-extraneous-dependencies` flags this. **However**, cross-domain dependencies are a code smell — prefer promoting the shared component to `ui-primitives-preact` and removing the cross-domain dep entirely (see Phase 5 § Cross-domain Preact imports).

### 15. Transitive deps caught by lint

When moving files that use libraries like `classnames` or test utilities like `vitest`, those libraries must appear in the new package's `package.json`. ESLint's `import/no-extraneous-dependencies` flags missing entries. Pre-flight:

```bash
rg "^import .* from ['\"](classnames|vitest|...)" packages/domains/<d>
```

Cross-check each unique package name against `packages/domains/<d>/package.json` `dependencies` / `devDependencies`. Add what's missing in the same commit that introduces the imports.

## Coordinating with parallel framework branches (e.g. Vue)

Domain extractions often run alongside an in-flight branch that adds a second framework layer (Vue, Svelte, …) to the same domain. Mis-coordinating here produces large structural merge conflicts. Apply the following on the **extraction** branch, before the parallel branch lands.

### 1. Hybrid `publish/` layout (preact-default, vue-swappable)

Don't park `publish/` directly under `preact/` (forces every consumer to migrate when vue takes over) and don't make `publish/` a sibling of `preact/` with hardcoded preact paths (forces the parallel branch to rewrite). Use a thin re-export instead:

```
packages/domains/<d>/
├── preact/
│   ├── src/...
│   └── publish/src/index.ts        # canonical preact publish surface
├── vue/
│   ├── src/...                     # added later by the parallel branch
│   └── publish/src/index.ts        # canonical vue publish surface (future)
└── publish/src/index.ts            # one-line re-export — swap target
```

```ts
// packages/domains/<d>/publish/src/index.ts
export * from '../../preact/publish/src';
export type * from '../../preact/publish/src';
```

When the team decides to swap the public surface to vue, this single file is the only line that changes. Both branches' import paths (`@integration-components/<d>/publish` and any inner-layer paths) keep working through the entire transition.

`package.json` exports map only needs `./publish`, `./preact`, `./domain` — do **not** add a separate `./preact/publish` export entry; consumers should never reach the inner layer directly. `tsconfig.json` doesn't need to list `preact/publish/src` in `include` either — it's transitively reached via the re-export.

### 2. Eliminate mechanical conflicts before they happen

Before opening the extraction PR, fetch the parallel branch and run a throwaway merge to surface conflicts:

```bash
git fetch origin <parallel-branch>:refs/remotes/origin/<parallel-branch>
git checkout -b _trial-merge HEAD
git merge --no-commit --no-ff origin/<parallel-branch>
# inspect, then:
git merge --abort
git checkout - && git branch -D _trial-merge
```

Categorise every conflict:

| Type        | Example                             | Action                                                         |
| ----------- | ----------------------------------- | -------------------------------------------------------------- |
| Structural  | Two different `publish/` layouts    | Reconcile in code (apply the hybrid approach)                  |
| Mechanical  | Multi-line array reformatting       | Pre-emptively normalise on the extraction branch               |
| Unavoidable | Both branches edit `pnpm-lock.yaml` | Document the resolution recipe (regenerate via `pnpm install`) |

### 3. `tsconfig.base.json` `paths` formatting

A multi-line `paths` entry (one path per line inside the array) collides over the entire block when both branches add or remove aliases. Convert to **single-line array form** and order new entries to match the parallel branch:

```jsonc
// good: 1-line conflict per added alias
"@integration-components/<d>/publish": ["packages/domains/<d>/publish/src/index.ts"],

// bad: multi-line format yields a whole-block conflict
"@integration-components/<d>/publish": [
    "packages/domains/<d>/publish/src/index.ts"
],
```

### 4. Hoist shared constants/types to `domain/src` proactively

If the parallel branch redeclares the same value the extraction puts in a preact-local file (`EARLIEST_PAYOUT_SINCE_DATE`, BEM root classes, framework-agnostic translation getters), hoist into `domain/src/<Component>/constants.ts` (or `translations.ts`) **on the extraction branch**, with these rules:

- **Prefix-namespaced names** in the shared module (e.g. `REPORTS_OVERVIEW_CLASS`, `REPORTS_TABLE_CLASS`) — call sites still see their short alias via `as BASE_CLASS` re-export, so no preact code changes.
- **Don't hoist diverging values.** If the parallel branch uses `LIMIT_OPTIONS = [5, 10, 20, 50]` while the extraction inherits `[10, 20]`, that's a product decision — surface it, don't paper over it.
- **Add a header comment** in the hoisted file documenting what was _not_ hoisted and why.

Every value hoisted here means the parallel branch's analogous file becomes a one-line re-export instead of a duplication that drifts.

### 5. What stays branch-local

Don't pre-emptively touch the parallel branch's territory:

- `vue/`-prefixed files (`vue/src/...`, `vue/stories/...`, `vue/publish/...`) — no empty stubs on the extraction branch unless the package needs `vue/publish/` to satisfy the hybrid `publish/` re-export (it doesn't, since the re-export points at `preact/publish/`).
- New shared packages introduced by the parallel branch (e.g. `@integration-components/composables-vue`, `@integration-components/core/vue`) — those are _its_ PR's responsibility.
- Vue-only deps in `packages/domains/<d>/package.json` — let the parallel branch add them.

### 6. Hand off post-merge cleanup to the parallel-branch owner

Track these for the parallel-branch reviewer in a comment / Slack note:

- Replace local re-implementations with imports from `@integration-components/<d>/domain` (translation getters, constants, types)
- Apply shared SCSS mixins from `@integration-components/style/mixins` and replace hardcoded pixels with design tokens
- Build MSW URLs from `@integration-components/testing/msw` + `@integration-components/<d>/mocks/endpoints` (never hardcode)
- Resolve any pagination / domain-constant divergences flagged in the hoisted-constants header comment

## Verification

Run these in order. **Do not** push until everything is green:

```bash
# 1. Type check (root + domain)
pnpm run types:check

# 2. Lint (root + domain) + selector guard
pnpm run lint
pnpm run lint:playwright-selectors

# 3. Stylelint for the moved SCSS
pnpm exec stylelint "packages/domains/<d>/**/*.scss"

# 4. Unit tests, focused
pnpm run test -- --run packages/domains/<d>

# 5. Storybook static build (no JSON warnings, no module errors)
pnpm run storybook:build

# 6. Integration tests, focused
pnpm exec cross-env TEST_ENV=1 NODE_OPTIONS='--no-experimental-strip-types' \
  playwright test --project=local-chrome packages/domains/<d>/tests/integration

# 7. Publish contract
pnpm run check-publish-contract

# 8. Lockfile clean
pnpm install --lockfile-only --frozen-lockfile

# 9. Whitespace/EOL guard
git diff --check

# 10. Full build
pnpm run build
```

## Suggested commit structure

Split the work into atomic commits so reviewers can step through. Land shared-package promotions **before** the bulk move so the extraction commit reads as a pure relocation:

1. `refactor(types): promote <SharedTypes> to @integration-components/types` — domain-agnostic types lifted to `customization.ts` etc.
2. `refactor(testing): add fixtures subpath with shared mock data` — only if cross-cutting fixtures are needed
3. `chore(<domain>): scaffold package skeleton` — package.json, tsconfig, project.json, empty barrels
4. `chore(<domain>): move source files` — pure `git mv`, no edits
5. `refactor(<domain>): replace deep-relative imports with package aliases` — the import-rewrite churn
6. `chore(<domain>): own mock endpoints; remove from root` — endpoints decoupling
7. `chore: update lint/types/baseline configs for <domain>` — tooling
8. `docs(boundaries): note transitional exceptions for <domain>` — only if needed

Per repo convention (Conventional Commits with scope): `<type>(<scope>): <subject>`. Subjects on a single line, no body unless absolutely needed.

> Tip: payouts grouped (3) + (4) + (5) + (6) + (7) into one bulk extraction commit and kept (1), (2), (8) as separate one-liners. That worked well for review — the bulk commit reads as 117 file moves + import rewrites; the three short commits provide the architectural framing. Either split granularity is acceptable.

### 16. Mock server type conflicts (`AdyenPlatformExperienceError.status`)

When constructing mock error responses, `AdyenPlatformExperienceError.status` is `string | undefined` while HTTP error response types use `status: number`. Spreading `{ ...error, status: 500 }` creates a type conflict (`Type 'number' is not assignable to type 'never'`). Fix with an explicit cast:

```ts
return HttpResponse.json({ ...error, status, detail: 'detail' } as GetHttpError, { status });
```

## Success Criteria

- `packages/domains/<d>/` mirrors the reports layout
- Public SDK contract (`packages/sdk/src/index.ts` + `dist/`) is unchanged
- Zero deep-relative imports between domain and root other than the documented transitional exception
- Zero cross-domain Preact imports (`type:domain` → `type:domain`) — shared components promoted to `ui-primitives-preact`
- All 10 verification commands pass green
- Domain tests run from the new location and pass
- Root `endpoints/endpoints.ts` no longer references the domain's paths
- `BOUNDARIES.md` reflects any new exceptions
- `packages/sdk/vite.config.ts` has resolve.alias entries for all domain subpaths

## Reference extraction artifacts

When in doubt, copy the pattern from these files:

### Reports (first reference domain)

- `packages/domains/reports/package.json`
- `packages/domains/reports/tsconfig.json`
- `packages/domains/reports/project.json`
- `packages/domains/reports/mocks/endpoints.ts`
- `packages/domains/reports/preact/stories/reportsOverview.mocked.stories.tsx`

### Disputes (reference for cross-domain component promotion)

- `packages/domains/disputes/package.json` — no cross-domain deps
- `packages/shared/ui-primitives-preact/src/MultiSelectionFilter/` — promoted from transactions
- `packages/shared/ui-primitives-preact/src/PaymentMethodCell/` — promoted from transactions
- `packages/sdk/vite.config.ts` — all domain + shared resolve.alias entries

### Shared references

- `BOUNDARIES.md` (§ Transitional exceptions, § MSW endpoint ownership, § Key Invariants)
