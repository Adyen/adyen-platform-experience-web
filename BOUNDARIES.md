# NX Tag Taxonomy & Boundary Rules

> Defined in IEX-2465 (Phase 0). Enforced automatically in Phase 3 (IEX-03-04).
>
> This reference follows the current workspace naming convention (`@integration-components/*`) while documenting the target boundary model from `implementation-plan.md`.

## Project Tags

### `type:shared`

Shared foundation libraries. `@integration-components/sdk-internal` is the current transitional shared package; the remaining entries describe the planned split.

| Package | Status | Description |
|---------|--------|-------------|
| `@integration-components/sdk-internal` | current | Transitional shared package that re-exports the existing root `src/` surface |
| `@integration-components/types` | planned | Shared types and API models |
| `@integration-components/utils` | planned | Shared utilities |
| `@integration-components/core` | planned | Runtime: config, HTTP, i18n, session |
| `@integration-components/style` | planned | SCSS foundation, tokens, mixins |
| `@integration-components/testing` | planned | MSW setup, fixtures, test utilities |
| `@integration-components/hooks-preact` | planned | Shared Preact hooks |
| `@integration-components/ui-primitives-preact` | planned | Shared Preact UI components |

### `type:domain`, `scope:<name>`

Business domain packages. The target shape is `domain/src`, `preact/src`, `vue/src`, and `publish/src` inside each domain package. `@integration-components/reports` is the current reference domain; the remaining entries are planned.

| Package | Status | Tags |
|---------|--------|------|
| `@integration-components/reports` | current | `type:domain`, `scope:reports` |
| `@integration-components/payouts` | planned | `type:domain`, `scope:payouts` |
| `@integration-components/payment-links` | planned | `type:domain`, `scope:payment-links` |
| `@integration-components/disputes` | planned | `type:domain`, `scope:disputes` |
| `@integration-components/transactions` | planned | `type:domain`, `scope:transactions` |
| `@integration-components/capital` | planned | `type:domain`, `scope:capital` |

### `type:publish`

| Package | Status | Description |
|---------|--------|-------------|
| `@integration-components/sdk` | current | Root aggregator. Target state: re-export only from each domain's `publish` layer |

## Cross-Project Rules

Enforced via `@nx/enforce-module-boundaries` in the ESLint config.

| Source | May import | Must NOT import |
|--------|-----------|-----------------|
| `type:shared` | other `type:shared` | `type:domain`, `type:publish` |
| `type:domain` | `type:shared` | other `type:domain`, `type:publish` |
| `type:publish` | `type:domain` (only via `@integration-components/<domain>/publish`) | `type:shared` directly |

## Intra-Domain Layer Rules

Enforced via ESLint path restrictions within each domain package once the target layer layout is in place.

| Layer | May import | Must NOT import |
|-------|-----------|-----------------|
| `domain/src` | `type:shared` packages | `preact/src`, `vue/src`, `publish/src`, framework code |
| `preact/src` | `domain/src`, `type:shared` packages | `vue/src`, `publish/src` |
| `vue/src` | `domain/src`, `type:shared` packages | `preact/src`, `publish/src` |
| `publish/src` | `preact/src` (current) or `vue/src` (after switchover) | `domain/src` directly, other domains |

## Key Invariants

1. `packages/sdk/src/index.ts` imports domains **only** through `@integration-components/<domain>/publish`.
2. `domain/src` must remain **framework-agnostic** (no Preact/Vue imports).
3. `preact/src` and `vue/src` must **never** import from each other.
4. `publish/src` is the **only** layer allowed to compose what gets published.
5. Shared packages must **never** depend on domain or publish layers.
6. The root `package.json` contract must remain **unchanged** throughout migration.
