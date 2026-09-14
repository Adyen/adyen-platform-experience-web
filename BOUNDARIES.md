# Nx tag taxonomy and boundary rules

## Project tags

### `type:shared`

Shared foundation libraries:

- `@integration-components/assets`
- `@integration-components/composables-vue`
- `@integration-components/core`
- `@integration-components/sdk-internal`
- `@integration-components/style`
- `@integration-components/testing`
- `@integration-components/types`
- `@integration-components/utils`

### `type:domain`, `scope:<name>`

Business domains:

- `@integration-components/capital`
- `@integration-components/disputes`
- `@integration-components/payByLink`
- `@integration-components/payouts`
- `@integration-components/reports`
- `@integration-components/transactions`

Each domain contains:

- `domain/src`: framework-neutral business logic
- `vue/src`: Vue components and composables
- `publish/src`: public exports
- optional `fixtures`, `mocks`, stories, and tests

### `type:publish`

`@integration-components/sdk` aggregates domain exports through each domain's `publish` layer.

## Cross-project rules

| Source         | May import                                                          | Must not import                      |
| -------------- | ------------------------------------------------------------------- | ------------------------------------ |
| `type:shared`  | other `type:shared`                                                 | `type:domain`, `type:publish`        |
| `type:domain`  | `type:shared`                                                       | other domains, `type:publish`        |
| `type:publish` | domains through `@integration-components/<domain>/publish`         | shared implementation paths directly |

## Intra-domain rules

| Layer         | May import                           | Must not import                                  |
| ------------- | ------------------------------------ | ------------------------------------------------ |
| `domain/src`  | shared framework-neutral packages   | `vue/src`, `publish/src`, framework code         |
| `vue/src`     | `domain/src`, shared packages        | `publish/src`, another domain's implementation   |
| `publish/src` | its domain's `vue/src` public barrel | `domain/src` directly, another domain             |

## MSW endpoint ownership

- Shared cross-domain endpoint constants live in `@integration-components/testing/msw`.
- Domain-specific endpoint paths live in `packages/domains/<domain>/mocks/endpoints.ts`.
- Each domain re-exports its paths as a `*_ENDPOINTS` object built from `MSW_BASE_URL`.

## Key invariants

1. `packages/sdk/src/index.ts` imports domains only through `@integration-components/<domain>/publish`.
2. `domain/src` remains framework-neutral.
3. `publish/src` is the only layer that selects the public framework implementation.
4. Shared packages never depend on domain or publish layers.
5. Public package changes must pass `pnpm run check-publish-contract`.
