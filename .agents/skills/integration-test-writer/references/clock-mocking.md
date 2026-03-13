# Date, Time & Clock Mocking

Adapted from [currents-dev/playwright-best-practices-skill](https://github.com/currents-dev/playwright-best-practices-skill). Tailored for this project's Storybook + MSW integration tests.

## Project Convention

This project uses `setTime(page)` from `tests/utils/utils.ts` which calls `page.clock.setFixedTime('2025-01-01T00:00:00.00Z')`. Use it in `test.beforeEach` when the component renders dates or times.

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

- **Reports**: date columns, date filters, "last 30 days" default ranges
- **Payouts/Transactions**: date-dependent table content, date picker interactions
- **Capital**: term end dates ("May 16, 2025"), days remaining ("135 days left")
- **Payment Links**: expiry dates, timestamps

## Timezone

This project's Playwright config sets `UTC` timezone. All tests run in UTC.

## Advanced: Time Advancement

For features with timers, debounce, or auto-refresh:

```typescript
test('session timeout warning', async ({ page }) => {
    await page.clock.install({ time: new Date('2025-01-15T09:00:00Z') });
    await goToStory(page, { id: STORY_ID });

    // Advance 25 minutes
    await page.clock.fastForward('25:00');
    await expect(page.getByText('Session expires in 5 minutes')).toBeVisible();
});
```

## Anti-Patterns

| Anti-Pattern                             | Problem                         | Solution                                         |
| ---------------------------------------- | ------------------------------- | ------------------------------------------------ |
| Installing clock after `goto()`          | Page already captured real time | Set clock before `goToStory`                     |
| Hardcoded relative dates in assertions   | Tests break over time           | Use fixed dates with clock mock                  |
| Not accounting for timezone              | Tests fail in different regions | Use explicit UTC times (project defaults to UTC) |
| Using `waitForTimeout` with mocked clock | Conflicts with mocked timers    | Use `fastForward` instead                        |
