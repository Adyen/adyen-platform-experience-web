# Test Organization

Adapted from [currents-dev/playwright-best-practices-skill](https://github.com/currents-dev/playwright-best-practices-skill). Tailored for this project's Storybook + MSW integration tests.

## Directory Structure

```
tests/
├── integration/components/          # Integration specs per external component
│   └── {componentName}/
│       ├── default.spec.ts          # Happy path (main story)
│       ├── emptyList.spec.ts        # Empty data scenario
│       ├── errorList.spec.ts        # Error response scenario
│       ├── singleBalanceAccount.spec.ts
│       ├── dataCustomization.spec.ts
│       └── {scenario}.spec.ts       # One file per story variant
├── e2e/components/                  # End-to-end specs (real APIs)
├── contract/v1/, contract/v2/       # API contract validation
├── models/
│   ├── external-components/         # POMs for external components
│   └── internal-components/         # POMs for DataGrid, FilterBar, etc.
├── utils/
│   ├── utils.ts                     # goToStory, clickOutsideDialog, etc.
│   └── datePicker.ts                # Date picker interaction helpers
└── fixtures/
    ├── analytics/events.ts          # Custom test/expect with analytics
    └── files/                       # Test fixture files (PDFs, etc.)
```

## Naming Conventions

- **Spec files**: Named after the **scenario**, not the component
    - `default.spec.ts`, `emptyList.spec.ts`, `grantActive.spec.ts`
    - NOT `reportsOverview.spec.ts`
- **Story IDs**: `mocked-{category}-{component-name}--{story-name-kebab-case}`
    - `mocked-reports-reports-overview--default`
    - `mocked-payouts-payouts-overview--empty-list`

## Spec File Structure

**One spec file per mocked story variant.** Each is self-contained.

```typescript
import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-reports-reports-overview--default';

test.beforeEach(async ({ page }) => {
    await goToStory(page, { id: STORY_ID });
});

test.describe('ReportsOverview - Default', () => {
    test.describe('Render', () => {
        test('should render title', async ({ page }) => { ... });
        test('should render table columns', async ({ page }) => { ... });
    });

    test.describe('Filter: Balance account', () => {
        test('should open selector', async ({ page }) => { ... });
        test('should list options', async ({ page }) => { ... });
    });

    test.describe('Filter: Date range', () => {
        test('should open date picker', async ({ page }) => { ... });
    });
});
```

## Test Grouping with `test.describe`

Group tests by user-facing behavior:

| Group                     | What to test                                                         |
| ------------------------- | -------------------------------------------------------------------- |
| `Render`                  | Visual elements present: title, table columns, row count, pagination |
| `Filter: Balance account` | Open/close, list options, select, reload data                        |
| `Filter: Date range`      | Presets, custom selection, reset                                     |
| `Details modal`           | Open via row click, content, close via button/click-outside          |
| `Action: {name}`          | Multi-step flows (accept, defend, download)                          |
| `Pagination`              | Next/prev buttons, limit selection                                   |

## Mock Architecture

Each component needs:

1. **Mock data** in `mocks/mock-data/{component}.ts`
2. **Mock handlers** in `mocks/mock-server/{component}.ts` (default + variant objects)
3. **Mocked stories** in `stories/mocked/{component}.stories.tsx` (one story per scenario)

Handler variants follow the pattern:

```typescript
export const COMPONENT_HANDLERS = {
    singleBalanceAccount: { handlers: [...] },
    emptyList: { handlers: [...] },
    errorList: { handlers: [...] },
};
```

## Running Tests

```bash
pnpm run test:integration                                    # All integration specs
pnpm run test:integration -- --grep "reportsOverview"        # Filter by component
pnpm run test:integration -- --grep "reportsOverview" --headed  # With browser visible
pnpm run test:integration:debug                              # Debug mode
```

### Prerequisites

Integration tests run against a **built Storybook**:

```bash
pnpm run storybook:static    # Build Storybook + start preview server
# Then in another terminal:
pnpm run test:integration
```

## Anti-Patterns

| Anti-Pattern                          | Problem                         | Solution                                |
| ------------------------------------- | ------------------------------- | --------------------------------------- |
| Long test files with multiple stories | Hard to maintain, slow to debug | One spec file per story variant         |
| Tests depending on execution order    | Flaky, hard to debug            | Keep tests independent via `beforeEach` |
| Testing multiple features in one test | Hard to debug failures          | One feature/behavior per test           |
| Combining stories in one spec         | Ambiguous failures              | Each spec targets exactly one story ID  |
