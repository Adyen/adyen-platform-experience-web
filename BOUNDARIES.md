# NX Tag Taxonomy & Boundary Rules

> Defined in IEX-2465 (Phase 0). Enforced automatically in Phase 3 (IEX-03-04).
>
> This reference follows the current workspace naming convention (`@integration-components/*`) while documenting the target boundary model from `implementation-plan.md`.

## Project Tags

### `type:shared`

Shared foundation libraries. `@integration-components/sdk-internal` is the current transitional shared package; the remaining entries describe the planned split.

| Package                                        | Status  | Description                                                                  |
| ---------------------------------------------- | ------- | ---------------------------------------------------------------------------- |
| `@integration-components/sdk-internal`         | current | Transitional shared package that re-exports the existing root `src/` surface |
| `@integration-components/types`                | planned | Shared types and API models                                                  |
| `@integration-components/utils`                | planned | Shared utilities                                                             |
| `@integration-components/core`                 | planned | Runtime: config, HTTP, i18n, session                                         |
| `@integration-components/style`                | planned | SCSS foundation, tokens, mixins                                              |
| `@integration-components/testing`              | planned | MSW setup, fixtures, test utilities                                          |
| `@integration-components/hooks-preact`         | current | Shared Preact hooks                                                          |
| `@integration-components/ui-components-preact` | current | Shared Preact UI components                                                  |

### Domain integration package

| Package                                      | Tag                       | Description                                                    |
| -------------------------------------------- | ------------------------- | -------------------------------------------------------------- |
| `@integration-components/domain-integration` | `type:domain-integration` | Domain definitions, application bindings, and scoped lifecycle |

### `type:domain`, `scope:<name>`

Business domain packages. The target shape is `domain/src`, `preact/src`, `vue/src`, and `publish/src` inside each domain package. `@integration-components/reports` is the current reference domain; the remaining entries are planned.

| Package                                | Status  | Tags                                |
| -------------------------------------- | ------- | ----------------------------------- |
| `@integration-components/reports`      | current | `type:domain`, `scope:reports`      |
| `@integration-components/payouts`      | current | `type:domain`, `scope:payouts`      |
| `@integration-components/transactions` | current | `type:domain`, `scope:transactions` |
| `@integration-components/payByLink`    | current | `type:domain`, `scope:payByLink`    |
| `@integration-components/disputes`     | current | `type:domain`, `scope:disputes`     |
| `@integration-components/capital`      | current | `type:domain`, `scope:capital`      |

### `type:publish`

| Package                       | Status  | Description                                                                                       |
| ----------------------------- | ------- | ------------------------------------------------------------------------------------------------- |
| `@integration-components/sdk` | current | Root aggregator and application composition layer for portable domain definitions and SDK facades |

## Cross-Project Rules

Enforced via `@nx/enforce-module-boundaries` in the ESLint config.

| Source                    | May import                                                                              | Must NOT import                                                     |
| ------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `type:domain-integration` | platform APIs only                                                                      | project packages, application policy, or frameworks                 |
| `type:shared`             | domain integration and other `type:shared`                                              | `type:domain`, `type:publish`                                       |
| `type:domain`             | domain integration and `type:shared`                                                    | other `type:domain`, `type:publish`                                 |
| `type:publish`            | `type:domain`, `type:domain-integration`, and `type:shared` for application composition | domain internals outside approved publish or definition entrypoints |

## Intra-Domain Layer Rules

Enforced via ESLint path restrictions within each domain package once the target layer layout is in place.

| Layer         | May import                                             | Must NOT import                                        |
| ------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| `domain/src`  | `type:shared` packages                                 | `preact/src`, `vue/src`, `publish/src`, framework code |
| `preact/src`  | `domain/src`, `type:shared` packages                   | `vue/src`, `publish/src`                               |
| `vue/src`     | `domain/src`, `type:shared` packages                   | `preact/src`, `publish/src`                            |
| `publish/src` | `preact/src` (current) or `vue/src` (after switchover) | `domain/src` directly, other domains                   |

### Transitional exceptions

The shared Preact UI primitives now live in `@integration-components/ui-components-preact`. Every consumer (root `src/`, shared packages, domains) imports them via that package's subpath entrypoints (e.g. `@integration-components/ui-components-preact/Button/Button`). All domain-specific internal components (`CapitalHeader`, `CapitalSlider`) have been extracted with the capital domain. No components remain under root `src/components/internal/` that are pending extraction. (`StoreSelector` was promoted to `ui-components-preact` during the payByLink extraction.)

| Import                                                   | Consumer                                                                                                                                                                                                                          | Reason                                                                                                                                                               |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/utils/getErrorMessage`                   | `packages/domains/payouts/preact/src/internal/DataOverviewDetails/DataOverviewDetails.tsx`, `packages/domains/transactions/preact/src/TransactionDetails/components/TransactionData/TransactionData.tsx`                          | Returns JSX and is tightly coupled to other root utilities; extraction is tracked separately and will land once a Preact-friendly home for these helpers is decided. |
| `../../../../domain/src/config/*.json`                   | `packages/domains/disputes/preact/src/DisputeManagement/context/dispute/context.tsx`                                                                                                                                              | JSON config files in `domain/src/config/` are imported via relative path because TypeScript path aliases cannot resolve `.json` imports through barrel re-exports.   |
| `../../../../domain/src/config/*.json`                   | `packages/domains/payByLink/preact/src/PaymentLinkCreation/hooks/useInvalidFieldsConfig.ts`, `packages/domains/payByLink/preact/src/PaymentLinkSettings/components/TermsAndConditions/Requirements/useTermsRequirementsConfig.ts` | Same JSON-import resolution constraint as disputes above; config files stored under `domain/src/config/`.                                                            |
| `../../../../../../domain/src/config/pollingConfig.json` | `packages/domains/capital/preact/src/CapitalOverview/components/GrantActions/hooks/usePollingConfig.ts`                                                                                                                           | Same JSON-import resolution constraint as disputes above; config files stored under `domain/src/config/`.                                                            |

Do not introduce new exceptions of this kind in subsequent domains. Either reuse these entries (if the same import is already covered) or promote the dependency to a shared package before extracting.

### MSW endpoint ownership

When extracting a domain, follow this convention to keep mock endpoint URLs decoupled:

| Constant                                    | Owner                                          |
| ------------------------------------------- | ---------------------------------------------- |
| `MSW_BASE_URL` (regex base URL)             | `@integration-components/testing/msw`          |
| `BALANCE_ACCOUNTS_ENDPOINT` (cross-cutting) | `@integration-components/testing/msw`          |
| Domain-specific paths (e.g. `/reports`)     | `packages/domains/<domain>/mocks/endpoints.ts` |

- Each extracted domain owns its endpoint paths and re-exports them as a `*_ENDPOINTS` object built from `MSW_BASE_URL`.
- Cross-cutting endpoints used by multiple domains live in the shared msw package; never duplicated per domain.
- When a domain is extracted, remove its entries from root `endpoints/endpoints.ts` once no root consumer references them.
- Root `endpoints/endpoints.ts` shrinks toward empty as more domains extract.

## Key Invariants

1. SDK public exports use each legacy domain's `publish` entrypoint or an approved portable domain `definitions` entrypoint wrapped by an SDK-owned facade.
2. `domain/src` must remain **framework-agnostic** (no Preact/Vue imports).
3. `preact/src` and `vue/src` must **never** import from each other.
4. `publish/src` is the **only** layer allowed to compose what gets published.
5. Shared packages must **never** depend on domain or publish layers.
6. The root package's published exports must remain **unchanged** throughout migration.

## Domain integration rules

The composition boundary is defined by
[`docs/domain-integration-contract.md`](./docs/domain-integration-contract.md).

| Source                      | May import                                                      | Must NOT import                                   |
| --------------------------- | --------------------------------------------------------------- | ------------------------------------------------- |
| Domain integration package  | platform APIs and relative modules                              | projects, application policy, frameworks, or Vite |
| Domain definition           | domain integration and shared code                              | application-private services                      |
| SDK application composition | domain definitions, local domain assets, Core, and SDK services | domain internals outside approved entrypoints     |

Domains own their dependency types. Applications own bindings from local
services to those types. Global domain IDs, capability registries, runtime
versions, manifests, and adapter Vite plugins are prohibited until a concrete
remote-loading requirement is approved. Domains own local translation sources
and portable dependency contracts. The SDK owns public routes, Smartling
aggregation, Core stitching, framework adapters, and SDK element facades.
None of these concerns belong in the generic integration package.
