---
name: integration-test-writer
description: This skill should be used when the user asks to "write integration tests", "add integration test coverage", "create tests for a new story", "add a mocked story and test", or when creating Playwright specs for external components against Storybook + MSW mocks.
user-invocable: true
disable-model-invocation: false
---

# Integration Test Writer

## Goal

Create Playwright integration tests for external components in this repository. Tests run against built Storybook stories with MSW mock handlers providing API responses.

## Reference Guides

Consult these adapted Playwright best practice references when needed:

| Topic                | File                                                                 | Use When                                                         |
| -------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Locators             | [references/locators.md](references/locators.md)                     | Choosing selectors, filtering, chaining                          |
| Assertions & Waiting | [references/assertions-waiting.md](references/assertions-waiting.md) | Writing assertions, waiting strategies, polling                  |
| Flaky Tests          | [references/flaky-tests.md](references/flaky-tests.md)               | Diagnosing/fixing intermittent failures                          |
| Clock Mocking        | [references/clock-mocking.md](references/clock-mocking.md)           | Testing date/time-dependent features                             |
| Debugging            | [references/debugging.md](references/debugging.md)                   | Troubleshooting failures, using trace viewer                     |
| Common Patterns      | [references/common-patterns.md](references/common-patterns.md)       | Project-specific assertion, filter, dialog, interaction patterns |
| Analytics Events     | [references/analytics-events.md](references/analytics-events.md)     | Asserting analytics events, fixture setup, shared constants      |

## When to Use

- Adding integration test coverage for an external component that has none
- Writing tests for new mocked story variants (e.g., empty list, error, single balance account)
- Expanding test coverage for existing components with new scenarios

## Inputs

Before writing tests, gather:

1. **Target component** — which external component under `src/components/external/`
2. **Mocked stories** — which stories exist in `stories/mocked/{component}.stories.tsx`
3. **Mock handlers** — what MSW handlers exist in `mocks/mock-server/{component}.ts`
4. **User stories / acceptance criteria** — what user-facing behavior to verify

## Process

### 1. Audit existing coverage

- Check `tests/integration/components/{componentName}/` for existing specs
- Check `stories/mocked/{component}.stories.tsx` for available story variants
- Check `mocks/mock-server/{component}.ts` for handler variant objects
- Identify gaps: stories without tests, acceptance criteria without coverage

### 2. Create missing mock handler variants (if needed)

Add a `{COMPONENT}_OVERVIEW_HANDLERS` object to `mocks/mock-server/{component}.ts` following this pattern:

```typescript
import { http, HttpResponse } from 'msw';
import { BALANCE_ACCOUNTS_SINGLE } from '../mock-data';
import { endpoints } from '../../endpoints/endpoints';

const mockEndpoints = endpoints();

export const {COMPONENT}_OVERVIEW_HANDLERS = {
    singleBalanceAccount: {
        handlers: [
            http.get(mockEndpoints.balanceAccounts, () => {
                return HttpResponse.json({ data: BALANCE_ACCOUNTS_SINGLE });
            }),
        ],
    },
    emptyList: {
        handlers: [
            http.get(mockEndpoints.{endpoint}, () => {
                return HttpResponse.json({ data: [], _links: {} });
            }),
        ],
    },
    errorList: {
        handlers: [
            http.get(mockEndpoints.{endpoint}, () => {
                return HttpResponse.error();
            }),
        ],
    },
};
```

Common variants to consider:

- `singleBalanceAccount` — single BA hides the selector
- `emptyList` — returns empty data array
- `errorList` — returns network error
- Component-specific error states (e.g., download errors)

For components with multiple sub-features (e.g., list + details + actions), organize mock responses into separate objects per domain:

```typescript
export const ComponentOverviewMockedResponses = { emptyList: { ... }, errorList: { ... } };
export const ComponentDetailsMockedResponses = { default: { ... }, errorDetails: { ... } };
```

For complex scenarios, handlers can combine multiple endpoint overrides in a single `handlers` array:

```typescript
downloadServerError: {
    handlers: [
        http.get(mockEndpoints.details, () => HttpResponse.json(DEFAULT_DETAILS)),
        http.get(mockEndpoints.download, () => HttpResponse.error()),
    ],
},
```

### 3. Create missing mocked stories (if needed)

Add story exports to `stories/mocked/{component}.stories.tsx`:

```typescript
export const EmptyList: ElementStory<typeof Component> = {
    name: 'Empty list',
    args: { mockedApi: true },
    parameters: {
        msw: { ...COMPONENT_HANDLERS.emptyList },
    },
};
```

Each test file maps 1:1 to a mocked story. Story IDs follow the pattern:
`mocked-{category}-{component-name}--{story-name-kebab-case}`

### 4. Write test specs

#### File structure

```
tests/integration/components/{componentName}/
├── default.spec.ts
├── emptyList.spec.ts
├── errorList.spec.ts
├── singleBalanceAccount.spec.ts
├── dataCustomization.spec.ts
└── {otherScenario}.spec.ts
```

**One spec file per story variant** — each file is self-contained.

#### Spec file template

```typescript
import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-{category}-{component-name}--{story-variant}';

test.beforeEach(async ({ page }) => {
    await goToStory(page, { id: STORY_ID });
});

test.describe('{ComponentName} - {Scenario}', () => {
    test.describe('Render', () => {
        test('should render the component title', async ({ page }) => {
            await expect(page.getByText('Expected Title')).toBeVisible();
        });

        test('should render the table with correct columns', async ({ page }) => {
            const columnHeaders = page.getByRole('columnheader');
            await expect(columnHeaders).toHaveCount(N);
            await Promise.all([expect(columnHeaders.nth(0)).toHaveText('Column 1'), expect(columnHeaders.nth(1)).toHaveText('Column 2')]);
        });
    });
});
```

#### Selector strategy (in priority order)

1. **Role-based** (preferred): `getByRole('button', { name: 'Submit' })`, `getByRole('dialog')`, `getByRole('table')`
2. **Text-based**: `getByText('Expected text', { exact: true })`, `getByLabel('Label')`
3. **Test ID**: `getByTestId('element-id')` — for custom UI elements without semantic roles
4. **CSS class**: `page.locator('.adyen-pe-tag', { hasText: 'Status' })` — only for component-specific elements like tags or download buttons

#### Common test patterns

For the full catalog of assertion, filter, dialog, interaction, scoping, form validation, and file upload patterns, consult **[references/common-patterns.md](references/common-patterns.md)**.

### 5. Translate user stories into test groups

Map each user story's acceptance criteria to `test.describe` blocks:

| Acceptance Criteria                  | Test Describe             | Spec File                           |
| ------------------------------------ | ------------------------- | ----------------------------------- |
| "User can view list of items"        | `Render`                  | `default.spec.ts`                   |
| "User can filter by balance account" | `Filter: Balance account` | `default.spec.ts`                   |
| "User can select date range"         | `Filter: Date range`      | `default.spec.ts`                   |
| "User sees empty state"              | `Empty state`             | `emptyList.spec.ts`                 |
| "User sees error"                    | `Error state`             | `errorList.spec.ts`                 |
| "User can perform action X"          | `Action: X`               | `default.spec.ts` or dedicated spec |
| "Custom columns render"              | `Data customization`      | `dataCustomization.spec.ts`         |

### 6. Analytics testing (only if the component emits analytics events)

If the component has analytics, import the custom fixture instead of `@playwright/test`:

```typescript
import { test, expect, type PageAnalyticsEvent } from '../../../fixtures/analytics/events';
```

Use `expectAnalyticsEvents()` from `tests/utils/utils.ts` to assert event sequences.

Define shared analytics constants in a `constants/analytics.ts` file:

```typescript
export const sharedComponentAnalyticsEventProperties = {
    componentName: 'componentName',
    category: 'Component category',
    subCategory: 'Component sub-category',
} as const;
```

Use `strictOrder: false` when event ordering is non-deterministic (e.g., concurrent actions on load):

```typescript
await expectAnalyticsEvents(analyticsEvents, expectedEvents, { strictOrder: false });
```

### 7. Inline reusable assertion functions

For repeated assertion blocks within a spec, define scoped async functions inside `test.describe`:

```typescript
test.describe('Component - Default', () => {
    const expectDefaultRendering = async (page: Page) => {
        await Promise.all([expect(page.getByText('Title')).toBeVisible(), expect(page.getByRole('table')).toBeVisible()]);
    };

    test('should render default view', async ({ page }) => {
        await expectDefaultRendering(page);
    });

    test('should return to default view after action', async ({ page }) => {
        // ... perform action ...
        await expectDefaultRendering(page);
    });
});
```

POMs can compose internal component POMs (e.g., `DataGridPage`, `FilterBarPage`) as properties. Use POMs when 3+ specs share the same interaction helpers; otherwise prefer inline helpers or self-contained tests.

### 8. Props forwarding verification

When a parent component forwards props to sub-components, verify the prop reaches the child:

```typescript
test('should forward reference to creation sub-component', async ({ page }) => {
    // Open sub-component
    await page.getByRole('button', { name: 'Create' }).click();
    // Verify prefilled value
    const value = await page.locator('input[name="reference"]').inputValue();
    expect(value).toBe('expected-value');
});
```

## Shared utilities reference

| Utility                                             | Location                                        | Purpose                                                  |
| --------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------- |
| `goToStory(page, { id, args? })`                    | `tests/utils/utils.ts`                          | Navigate to a Storybook story                            |
| `clickOutsideDialog(dialog)`                        | `tests/utils/utils.ts`                          | Click outside to dismiss a dialog                        |
| `selectFirstUnselectedBalanceAccount(dialog)`       | `tests/utils/utils.ts`                          | Select first unselected BA option                        |
| `applyDateFilter(page, options?)`                   | `tests/utils/utils.ts`                          | Apply a date range via the date picker                   |
| `setTime(page)`                                     | `tests/utils/utils.ts`                          | Freeze time to `2025-01-01T00:00:00Z`                    |
| `getTranslatedKey(key)`                             | `tests/utils/utils.ts`                          | Get i18n translation by key                              |
| `getComponentRoot(page)`                            | `tests/utils/utils.ts`                          | Get `.adyen-pe-component` root locator                   |
| `getClipboardContent(page)`                         | `tests/utils/utils.ts`                          | Read clipboard text via `navigator.clipboard.readText()` |
| `sleep(ms?)`                                        | `tests/utils/utils.ts`                          | Wait for a given duration (default 100ms)                |
| `expectAnalyticsEvents(events, expected, options?)` | `tests/utils/utils.ts`                          | Assert analytics event sequence (`strictOrder` option)   |
| Date picker helpers                                 | `tests/utils/datePicker.ts`                     | `resetDatePicker`, `selectTodayDateFromDatePicker`, etc. |
| Analytics fixture                                   | `tests/fixtures/analytics/events.ts`            | Custom `test`/`expect` with `analyticsEvents` array      |
| `DataGridPage`                                      | `tests/models/internal-components/dataGrid.ts`  | POM for DataGrid interactions                            |
| `FilterBarPage`                                     | `tests/models/internal-components/filterBar.ts` | POM for FilterBar interactions                           |

## Best Practices (Quick Reference)

For detailed guidance, consult the reference files. Key points:

- **Anti-patterns**: Never use `waitForTimeout`, brittle CSS selectors, generic assertions, or `{ force: true }`. See [references/flaky-tests.md](references/flaky-tests.md).
- **Flaky test prevention**: Burn-in with `--repeat-each=5`. Use defensive progressive assertions. See [references/flaky-tests.md](references/flaky-tests.md).
- **Row counts**: Assert the number of rows/buttons that are actually rendered for the current page limit; do not assume the full mock dataset size equals the visible row count.
- **Error text**: When multiple translation strings render inside a single paragraph/container, scope to that locator and use `toContainText(...)` for each fragment instead of separate exact `getByText(...)` assertions.
- **Waiting strategies**: Prefer auto-waiting. Use `toPass()` or `expect.poll()` for polling. See [references/assertions-waiting.md](references/assertions-waiting.md).
- **Locator filtering**: Use `filter({ hasText })`, `filter({ has })`, `nth()`, `first()`, `last()`. See [references/locators.md](references/locators.md).
- **Debugging**: Run `--headed`, `PWDEBUG=1`, or `pnpm run test:integration:debug`. Use `page.pause()` in code, and inspect `test-results/**/error-context.md` first when Playwright prints an error-context path. See [references/debugging.md](references/debugging.md).
- **Clock mocking**: Always call `setTime(page)` before `goToStory`. See [references/clock-mocking.md](references/clock-mocking.md).

## Hard Rules

1. **One spec file per story variant** — do not combine multiple stories in one file
2. **Use `test.beforeEach` for `goToStory`** — do not call it inside individual tests unless testing different args
3. **Never hardcode user-facing strings** — use `getTranslatedKey()` when referencing i18n keys in assertions, or match the rendered text from translations
4. **Prefer role-based selectors** over CSS classes or test IDs
5. **Use `Promise.all`** for independent parallel assertions
6. **Do not import from `react`** — if needed, import from `@playwright/test` or the analytics fixture
7. **Keep tests self-contained** — each spec file should work independently without shared state
8. **Match existing patterns** — before writing, read 2-3 existing integration tests for similar components to match the local style
9. **Use `setTime(page)` in `beforeEach`** when the component renders dates or times — ensures deterministic output
10. **Use `getComponentRoot(page)`** to scope queries when text might match Storybook chrome
11. **Use `page.waitForEvent('download')`** to assert downloads — do not assume file system writes
12. **Grant clipboard permissions explicitly** via `context.grantPermissions(['clipboard-read', 'clipboard-write'])` before clipboard tests
13. **Use `page.waitForRequest`** to verify that retry/refresh buttons trigger the expected API call

## Verification

After writing tests:

1. Ensure Storybook builds with the new stories: `pnpm run build-storybook`
2. Run the new integration tests: `pnpm run test:integration -- --grep "{componentName}"`
3. For a component-folder focused run, use: `pnpm run test:integration -- tests/integration/components/{componentName}`
4. Burn-in for flakiness:
    - grep-based: `pnpm run test:integration -- --grep "{componentName}" --repeat-each=5`
    - path-based: `pnpm exec playwright test tests/integration/components/{componentName} --project local-chrome --repeat-each=5`
5. If a test fails intermittently, debug with trace: `pnpm run test:integration -- --grep "{testName}" --trace on`
6. View trace: `npx playwright show-trace test-results/{path}/trace.zip`
