# Integration & Contract Tests

## Package Identity

Playwright-based test suites for external components. Two test projects:
**integration** (Storybook-driven, `local-chrome`) and **contract** (API schema validation).

Unit tests live colocated with source in `src/` — see [source-overview.md](../patterns/source-overview.md).

## Directory Layout

| Directory                                                  | Purpose                                                          |
| ---------------------------------------------------------- | ---------------------------------------------------------------- |
| `packages/domains/{domain}/vue/tests/integration/{Component}/` | Integration specs per external component (Storybook + MSW)   |
| `packages/sdk/tests/integration/{concern}/`                | SDK-level (global) specs (harness stories in `packages/sdk/stories/`) |
| `packages/domains/{domain}/domain/tests/contract/`         | API contract validation specs                                   |
| `packages/shared/testing/src/playwright/`                  | Shared Playwright utilities (`utils.ts`, `utils/filters/`, contract helpers) |
| `packages/shared/testing/src/fixtures/`                    | Shared fixture data (balance accounts, analytics, files)         |
| `packages/domains/{domain}/fixtures/`                     | Per-domain fixture data                                           |

## Running Tests

```bash
# Integration tests (requires Storybook build)
pnpm run test:integration                                                        # All integration specs
pnpm exec playwright test packages/domains/capital --project local-chrome       # One domain only
pnpm exec playwright test packages/sdk/tests/integration --project local-chrome # SDK-level suites only

# Contract tests
pnpm run test:contract
```

### Prerequisites for Integration Tests

Integration tests run against a built Storybook. The Playwright `webServer` builds and serves it automatically (`pnpm run storybook:static:vue`), reusing any server already running on port 3030. To avoid rebuilding on every run, serve it yourself first:

```bash
pnpm run storybook:static    # Build Storybook + start preview server
# Then, in another terminal, the runner reuses the running server:
pnpm run test:integration
```

CI builds Storybook first, then runs tests with sharding.

### Story Coverage

`goToStory` tags each test with the story it opens, and a Playwright reporter writes `story-coverage/visited*.json` (one file per shard). After a run:

```bash
pnpm run test:integration:story-coverage   # Per-domain table: stories opened by a passing test vs Storybook index.json
```

It reads `packages/tools/storybook/storybook-static/index.json` by default (`--index` overrides) and writes `story-coverage/summary.json`. Real-API (`api-*`) stories are excluded. Domains with no spec file in the run (e.g. running one domain only) show as "not run" and are excluded from the total. Always navigate with `goToStory`, never `page.goto('/iframe.html…')`, or the test is invisible to this report. CI appends the table to the integration workflow's step summary.

## Patterns & Conventions

### Spec File Naming

- Integration: `packages/domains/{domain}/vue/tests/integration/{Component}/{scenario}.spec.ts`
- SDK-level: `packages/sdk/tests/integration/{concern}/{scenario}.spec.ts` (one per harness story)
- Each spec tests one scenario (e.g., `grantActive.spec.ts`, `errorMissingActionsGeneric.spec.ts`)
- Name files after the **scenario**, not the component

### Test Utilities

- `packages/shared/testing/src/playwright/utils.ts` — shared helpers (navigation, waiting, assertions), imported as `@integration-components/testing/playwright/utils`
- `packages/shared/testing/src/playwright/utils/filters/` — filter interaction helpers

### Mocking

Integration tests use **MSW (Mock Service Worker)** via Storybook's `msw-storybook-addon`.
Mock handlers are defined in `mocks/mock-server/` and mock data in `mocks/mock-data/`; domain-specific handlers and endpoint paths live in `packages/domains/{domain}/mocks/`.
Each Storybook story configures its own MSW handlers for the scenario under test.

### SDK-Level (Global) Suites

Concerns owned by the SDK itself — `window.AdyenPlatformExperienceMetadata`, session permissions, translations and locales — are not domain-specific and live in `packages/sdk`:

| Directory                                                     | Purpose                                          |
|---------------------------------------------------------------| ------------------------------------------------ |
| `packages/sdk/stories/*.stories.ts`                           | Harness stories for SDK concerns (group `SDK/*`) |
| `packages/sdk/tests/integration/{concern}/{scenario}.spec.ts` | One spec per harness story                      |

- Each concern pairs a flat harness story under `packages/sdk/stories/{concern}.stories.ts` with a spec directory under `packages/sdk/tests/integration/{concern}/`, one spec per story variant. A harness renders only a marker; loading it evaluates the SDK entry (`@integration-components/sdk-internal`), so the page matches what a host page loads.
- Keep only the test cases that pin the important aspects of the contract. Helpers stay inline in the spec; promote them to `@integration-components/testing/playwright/*` once a second concern needs them.

Wiring points: `playwright.config.ts` (`testDir: 'packages'` and `sdk/tests/integration/**/*.spec.ts` on the `local-chrome` project), the Storybook stories globs in `packages/tools/storybook/src/.storybook/vue/main.ts`, the `packages/sdk/tsconfig.json` includes, and the ESLint devDependencies allowlist plus selector-guard globs.

## Playwright Config

- Config: `playwright.config.ts` (root)
- Projects: `local-chrome` (integration), `contract`
- Timeout: 30s per test, 10min global
- CI: 2 retries, headless, sharded execution
- Base URL: `http://localhost:3030` (from `envs/env.default`)

## Common Gotchas

- **Storybook build**: the runner builds and serves it automatically; pre-build it yourself only to speed up repeated runs
- **Timezone**: Tests run in `UTC` timezone (set in Playwright config)
- **CI sharding**: Integration tests are sharded across workers for speed
- **Flaky tests**: CI retries 2x — if a test is flaky, fix it rather than relying on retries

## Unit Test Guidelines

For unit testing hooks and components, see:

- `.agents/testing/unit-tests/general_testing_guidelines.md`
- `.agents/testing/unit-tests/composables_testing_guidelines.md`
- `.agents/testing/unit-tests/components_testing_guidelines.md`
