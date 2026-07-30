# Analytics Events

Project-specific patterns for asserting analytics events in Storybook + MSW integration tests. Consult this reference when writing tests that verify event tracking.

## Setup

Always import `test`, `expect`, and `PageAnalyticsEvent` from the analytics fixture — never from `@playwright/test`:

```typescript
import { test, expect, type PageAnalyticsEvent } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents } from '../../../utils/utils';
```

The fixture injects a live `analyticsEvents` array into every test via the `{ analyticsEvents }` destructured argument. Events accumulate in this array as the component emits them. After each assertion, `expectAnalyticsEvents` drains the array so subsequent assertions only see new events — keeping a clean slate between interaction steps.

## Shared Constants

Define shared property objects as `as const` in `shared/constants.ts` (or `constants/analytics.ts`) co-located with spec files. These reduce duplication across assertions.

### Base Properties

Every component needs at least `category` and `subCategory`:

```typescript
export const sharedAnalyticsEventProperties = {
    category: 'Transaction component',
    subCategory: 'Transaction details',
} as const;
```

### Extended Variants

Spread the base and add section-specific properties:

```typescript
export const sharedCopyButtonAnalyticsEventProperties = {
    ...sharedAnalyticsEventProperties,
    sectionName: 'Details',
    label: 'Copy button',
} as const;
```

### Multiple Sub-Categories

One component may have several sub-categories:

```typescript
export const sharedTransactionsListAnalyticsEventProperties = {
    category: 'Transaction component',
    subCategory: 'Transactions list',
} as const;

export const sharedTransactionsInsightsAnalyticsEventProperties = {
    category: 'Transaction component',
    subCategory: 'Transactions insights',
} as const;
```

## Asserting Events

Use `expectAnalyticsEvents` to verify which events were emitted. Each expected event is a `[eventName, partialProperties]` tuple — only specify the properties you care about. The call drains the array after matching, so subsequent calls only see new events.

### Strict Order

Default behavior — events must appear in the specified sequence:

```typescript
await expectAnalyticsEvents(analyticsEvents, [
    ['Duration', sharedTransactionsListAnalyticsEventProperties],
    ['Landed on page', sharedTransactionsInsightsAnalyticsEventProperties],
]);
```

### Non-Strict Order

Use `{ strictOrder: false }` when events may fire concurrently or in non-deterministic order:

```typescript
await expectAnalyticsEvents(
    analyticsEvents,
    [
        [
            'Customized translation',
            {
                category: 'PIE',
                subCategory: 'Core',
                locale: 'en-US',
                keys: [],
            },
        ],
        ['Landed on page', sharedAnalyticsEventProperties],
    ],
    { strictOrder: false }
);
```

### No Events Expected

Use when an action is intercepted (e.g., by a callback prop) and should not trigger analytics. Unlike omitting the assertion entirely, this confirms emptiness and drains the array, preventing stale events from leaking into later assertions:

```typescript
await page.getByRole('button', { name: 'Go back', exact: true }).click();
await expectAnalyticsEvents(analyticsEvents, []);
```

### Inline Property Overrides

Spread the shared base and add event-specific properties:

```typescript
await expectAnalyticsEvents(analyticsEvents, [
    [
        'Modified filter',
        {
            ...sharedTransactionsListAnalyticsEventProperties,
            label: 'Date filter',
            actionType: 'update',
            value: 'Year to date',
        },
    ],
]);
```

## Draining Events in `beforeEach`

Components typically emit events on mount (e.g., `Landed on page`). Drain these in `beforeEach` after navigating to the story so individual tests start with a clean array:

```typescript
test.beforeEach(async ({ page, analyticsEvents }) => {
    // ... navigate to story ...
    await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedAnalyticsEventProperties]]);
});
```

## Common Patterns

### Assert Immediately After the Action

Place `expectAnalyticsEvents` right after the interaction that triggers the event. Delaying the assertion risks picking up events from unrelated intermediate actions:

```typescript
test('should refund payment', async ({ page, analyticsEvents }) => {
    await page.getByRole('button', { name: 'Refund €133.75', exact: true, disabled: false }).click();
    await expectAnalyticsEvents(analyticsEvents, [['Completed refund', sharedAnalyticsEventProperties]]);
});
```

### Multi-Step Flows

Chain multiple `expectAnalyticsEvents` calls within a single test. Each call drains the array, so later calls only see events emitted after the previous drain:

```typescript
test('should reset date range', async ({ page, analyticsEvents }) => {
    // Step 1: apply filter
    await datePicker.getByRole('button', { name: 'Apply', exact: true }).click();
    await expectAnalyticsEvents(analyticsEvents, [
        [
            'Modified filter',
            {
                ...sharedProperties,
                actionType: 'update',
                value: 'Year to date',
            },
        ],
    ]);

    // Step 2: reset
    await datePicker.getByRole('button', { name: 'Reset', exact: true }).click();
    await expectAnalyticsEvents(analyticsEvents, [
        [
            'Modified filter',
            {
                ...sharedProperties,
                actionType: 'update',
                value: 'Last 180 days',
            },
        ],
        ['Modified filter', { ...sharedProperties, actionType: 'reset' }],
    ]);
});
```

### Shared Helpers

Extract repeated action + assertion sequences into helpers that accept `analyticsEvents` and drain internally. This keeps callers isolated from stale events:

```typescript
export const openExportPopover = async (page: Page, analyticsEvents: PageAnalyticsEvent[]) => {
    await page.getByRole('button', { name: 'Export', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expectAnalyticsEvents(analyticsEvents, [['Clicked button', { ...sharedListProperties, label: 'Export' }]]);
};
```

### View Transitions

Navigating between views may emit events for the previous view's unmount and the new view's mount:

```typescript
await page.getByRole('radio', { name: 'Insights', exact: true, checked: false }).click();
await expectAnalyticsEvents(analyticsEvents, [
    ['Duration', sharedPreviousViewProperties],
    ['Landed on page', sharedNextViewProperties],
]);
```

## Anti-Patterns

| Anti-Pattern                                      | Problem                                          | Solution                                           |
| ------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------- |
| Importing `test`/`expect` from `@playwright/test` | `analyticsEvents` fixture not available          | Import from `tests/fixtures/analytics/events`      |
| Not draining mount-time events in `beforeEach`    | Mount events leak into test assertions           | Drain with `expectAnalyticsEvents` in `beforeEach` |
| Asserting full property objects                   | Breaks when new properties added upstream        | Only specify properties you care about             |
| Assuming event order for concurrent actions       | Flaky when emission order is non-deterministic   | Use `{ strictOrder: false }`                       |
| Not passing `analyticsEvents` to shared helpers   | Helper can't drain; stale events leak downstream | Always thread `analyticsEvents` through helpers    |
| Asserting events long after the triggering action | Intermediate actions pollute the array           | Assert immediately after the action                |
