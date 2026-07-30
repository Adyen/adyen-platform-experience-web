# Date, Time & Clock Mocking

Repo-focused guidance for this project's Storybook + MSW integration tests.

## Project Convention

This project uses `setTime(page)` from `tests/utils/utils.ts` which calls `page.clock.setFixedTime('2025-01-01T00:00:00.00Z')`. Use it in `test.beforeEach` when the component renders dates or times. If the mock data or acceptance criteria are tied to another specific date, prefer a local `NOW` constant plus `page.clock.setFixedTime(NOW)`.

```typescript
import { setTime } from '../../../utils/utils';

test.beforeEach(async ({ page }) => {
    await setTime(page); // Freezes to 2025-01-01T00:00:00Z
    await goToStory(page, { id: STORY_ID });
});
```

Alternatively, freeze to a specific time with `page.clock.setFixedTime()`:

```typescript
test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(NOW); // Custom Date.now() value
    await goToStory(page, { id: STORY_ID });
});
```

This repo often uses explicit constants such as:

```typescript
const NOW = '2024-07-17T00:00:00.000Z';

test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(NOW);
    await goToStory(page, { id: STORY_ID });
});
```

## Critical Rule: Install/Set Clock BEFORE Navigation

```typescript
// Good — time is mocked when page loads
await setTime(page);
await goToStory(page, { id: STORY_ID });

// Bad — page already captured real time
await goToStory(page, { id: STORY_ID });
await setTime(page); // Too late!
```

## When to Use Clock Mocking

- **Reports**: date columns, date filters, "last 30 days" default ranges, stable custom-data story rows
- **Payouts/Transactions**: date-dependent table content, date picker interactions
- **Capital**: term end dates ("May 16, 2025"), days remaining ("135 days left")
- **Payment Links**: expiry dates, timestamps

## Timezone

This project's Playwright config sets `UTC` timezone. All tests run in UTC, so assertions should assume UTC-rendered dates unless the component explicitly formats another timezone.

## Anti-Patterns

| Anti-Pattern                           | Problem                                         | Solution                                           |
| -------------------------------------- | ----------------------------------------------- | -------------------------------------------------- |
| Installing clock after `goto()`        | Page already captured real time                 | Set clock before `goToStory`                       |
| Hardcoded relative dates in assertions | Tests break over time                           | Use fixed dates with clock mock                    |
| Not accounting for timezone            | Tests fail in different regions                 | Use explicit UTC times (project defaults to UTC)   |
| Using the default frozen date blindly  | Date filters may no longer match the story data | Pick a `NOW` value aligned with the mocked dataset |
