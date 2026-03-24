# NX Tag Taxonomy & Boundary Rules

> Defined in IEX-2465 (Phase 0). Enforced automatically in Phase 3 (IEX-03-04).

## Project Tags

### `type:shared`

Framework-agnostic or framework-specific foundation libraries.

| Package | Description |
|---------|-------------|
| `@iex/lib` | Current root library (temporary, Phase 0) |
| `@iex/types` | Shared types and API models |
| `@iex/utils` | Shared utilities |
| `@iex/core` | Runtime: config, HTTP, i18n, session |
| `@iex/style` | SCSS foundation, tokens, mixins |
| `@iex/testing` | MSW setup, fixtures, test utilities |
| `@iex/hooks-preact` | Shared Preact hooks |
| `@iex/ui-primitives-preact` | Shared Preact UI components |

### `type:domain`, `scope:<name>`

Business domain packages. Each contains `domain/src`, `preact/src`, `vue/src`, `publish/src`.

| Package | Tags |
|---------|------|
| `@iex/reports` | `type:domain`, `scope:reports` |
| `@iex/payouts` | `type:domain`, `scope:payouts` |
| `@iex/payment-links` | `type:domain`, `scope:payment-links` |
| `@iex/disputes` | `type:domain`, `scope:disputes` |
| `@iex/transactions` | `type:domain`, `scope:transactions` |
| `@iex/capital` | `type:domain`, `scope:capital` |

### `type:publish`

| Package | Description |
|---------|-------------|
| `@iex/publish` | Root aggregator — re-exports from each domain's `publish` layer |

## Cross-Project Rules

Enforced via `@nx/enforce-module-boundaries` in `eslint.config`.

| Source | May import | Must NOT import |
|--------|-----------|-----------------|
| `type:shared` | other `type:shared` | `type:domain`, `type:publish` |
| `type:domain` | `type:shared` | other `type:domain`, `type:publish` |
| `type:publish` | `type:domain` (only via `@iex/<domain>/publish`) | `type:shared` directly |

## Intra-Domain Layer Rules

Enforced via ESLint path restrictions within each domain package.

| Layer | May import | Must NOT import |
|-------|-----------|-----------------|
| `domain/src` | `type:shared` packages | `preact/src`, `vue/src`, `publish/src`, framework code |
| `preact/src` | `domain/src`, `type:shared` packages | `vue/src`, `publish/src` |
| `vue/src` | `domain/src`, `type:shared` packages | `preact/src`, `publish/src` |
| `publish/src` | `preact/src` (current) or `vue/src` (after switchover) | `domain/src` directly, other domains |

## Key Invariants

1. `packages/publish/src/index.ts` imports domains **only** through `@iex/<domain>/publish`.
2. `domain/src` must remain **framework-agnostic** (no Preact/Vue imports).
3. `preact/src` and `vue/src` must **never** import from each other.
4. `publish/src` is the **only** layer allowed to compose what gets published.
5. Shared packages must **never** depend on domain or publish layers.
6. The root `package.json` contract must remain **unchanged** throughout migration.
