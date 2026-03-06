# tests/ — Integration, E2E & Contract Tests

## Package Identity

Playwright-based test suites for external components. Three test projects:
**integration** (Storybook-driven), **e2e** (real API), and **contract** (API schema validation).

Unit tests live colocated with source in `src/` — see [source-overview.md](../patterns/source-overview.md).

## Directory Layout

| Directory                      | Purpose                                                    |
| ------------------------------ | ---------------------------------------------------------- |
| `integration/components/`      | Integration specs per external component (Storybook + MSW) |
| `e2e/components/`              | End-to-end specs against real APIs                         |
| `contract/v1/`, `contract/v2/` | API contract validation specs                              |
| `contract/utils/`              | Contract test utilities                                    |
| `models/`                      | Page object models for external and internal components    |
| `utils/`                       | Shared test utilities (`utils.ts`, `datePicker.ts`)        |
| `fixtures/`                    | Test fixture data (analytics, files)                       |

## Running Tests

```bash
# Integration tests (requires Storybook build)
pnpm run test:integration                              # All integration specs
pnpm run test:integration -- --grep "capitalOverview"  # Filter by component

# E2E tests
pnpm run test:e2e

# Contract tests
pnpm run test:contract

# Debug mode (opens browser devtools)
pnpm run test:integration:debug
```

### Prerequisites for Integration Tests

Integration tests run against a built Storybook. For local development:

```bash
pnpm run storybook:static    # Build Storybook + start preview server
# Then in another terminal:
pnpm run test:integration
```

CI builds Storybook first, then runs tests with sharding.

## Patterns & Conventions

### Spec File Naming

- Integration: `tests/integration/components/{component}/{scenario}.spec.ts`
- Each spec tests one scenario (e.g., `grantActive.spec.ts`, `errorMissingActionsGeneric.spec.ts`)
- Name files after the **scenario**, not the component

### Page Object Models

Use models in `tests/models/` for reusable component interactions:

```
models/
├── external-components/   # Models for external components
└── internal-components/   # Models for internal UI primitives
```

### Test Utilities

- `tests/utils/utils.ts` — shared helpers (navigation, waiting, assertions)
- `tests/utils/datePicker.ts` — date picker interaction helpers

### Mocking

Integration tests use **MSW (Mock Service Worker)** via Storybook's `msw-storybook-addon`.
Mock handlers are defined in `mocks/mock-server/` and mock data in `mocks/mock-data/`.
Each Storybook story configures its own MSW handlers for the scenario under test.

## Playwright Config

- Config: `playwright.config.ts` (root)
- Projects: `local-chrome` (integration), `local-chrome-e2e` (e2e), `contract`
- Timeout: 30s per test, 10min global
- CI: 2 retries, headless, sharded execution
- Base URL: `http://localhost:3030` (from `envs/env.default`)

## Common Gotchas

- **Storybook must be built/running** before integration tests — `pnpm run storybook:static`
- **Timezone**: Tests run in `UTC` timezone (set in Playwright config)
- **CI sharding**: Integration tests are sharded across workers for speed
- **Flaky tests**: CI retries 2x — if a test is flaky, fix it rather than relying on retries

## Unit Test Guidelines

For unit testing hooks and components, see:

- `.agents/testing/unit-tests/general_testing_guidelines.md`
- `.agents/testing/unit-tests/hooks_testing_guidelines.md`
- `.agents/testing/unit-tests/components_testing_guidelines.md`
