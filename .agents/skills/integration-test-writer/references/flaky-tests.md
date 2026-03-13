# Flaky Tests: Prevention, Detection & Fixing

Adapted from [currents-dev/playwright-best-practices-skill](https://github.com/currents-dev/playwright-best-practices-skill). Tailored for this project's Storybook + MSW integration tests.

## Categories of Flakiness

| Category               | Symptoms                        | Common Causes                                |
| ---------------------- | ------------------------------- | -------------------------------------------- |
| **UI-driven**          | Element not found, click missed | Missing waits, animations, dynamic rendering |
| **Environment-driven** | CI-only failures                | Slower CPU, headless mode differences        |
| **Test-suite-driven**  | Fails when run with other tests | Leaked state, order dependencies             |

## Decision Tree

```
Test fails intermittently
├─ Fails locally too?
│  ├─ YES → Timing/async issue → Check waits and assertions
│  └─ NO → CI-specific → Check environment differences
│
├─ Fails only when run with other tests?
│  └─ YES → State leak → Check that beforeEach reloads the story
│
└─ Fails randomly regardless of conditions?
   └─ External dependency → Check MSW mock is deterministic
```

## Detection

```bash
# Run test multiple times to confirm instability
pnpm run test:integration -- --grep "componentName" --repeat-each=20

# Run with trace to capture failure details
pnpm run test:integration -- --grep "testName" --trace on

# View trace from failed run
npx playwright show-trace test-results/{path}/trace.zip
```

## Fixing Strategies

### UI-Driven Flakiness

```typescript
// Bad: No wait for element state
await page.click('#submit');

// Good: Auto-waiting via role-based selector + assertion
await page.getByRole('button', { name: 'Submit' }).click();
await expect(page.getByRole('heading', { name: 'Success' })).toBeVisible();

// Bad: Brittle CSS selector
await page.click('div.container > div:nth-child(2) > button.btn-primary');

// Good: Semantic selector
await page.getByRole('button', { name: 'Continue' }).click();
```

### Timing Flakiness

```typescript
// Bad: Arbitrary sleep
await page.getByRole('button', { name: 'Load' }).click();
await page.waitForTimeout(3000);

// Good: Wait for specific condition
await page.getByRole('button', { name: 'Load' }).click();
await expect(page.getByRole('row')).toHaveCount(10, { timeout: 10000 });

// Better: Wait for network response, then assert
const responsePromise = page.waitForResponse(resp => resp.url().includes('/api/data') && resp.ok());
await page.getByRole('button', { name: 'Load' }).click();
await responsePromise;
await expect(page.getByRole('row')).toHaveCount(10);
```

### Race-Condition-Safe Tab Navigation

```typescript
// Create the expectation BEFORE clicking (stores the promise)
const tabSelectedPromise = expect(tab).toHaveAttribute('aria-selected', 'true');
await tab.click();
await tabSelectedPromise;
```

## Prevention

### Burn-In New Tests

```bash
# Run new tests many times before merging
pnpm run test:integration -- --grep "componentName" --repeat-each=5
```

### Isolation Checklist

- Each test gets a fresh page via `test.beforeEach` calling `goToStory`
- No module-level mutable state shared between tests
- Each spec file is self-contained (no dependency on other spec files)
- MSW handlers are deterministic (no random data, fixed dates via `setTime`)

### Defensive Assertions

```typescript
// Bad — single point of failure with no context
await expect(page.getByRole('row')).toHaveCount(5);

// Good — progressive assertions narrow down the issue
await expect(page.getByRole('table')).toBeVisible();
await expect(page.getByText('Loading')).not.toBeVisible();
await expect(page.getByRole('row')).toHaveCount(5);
```

## CI-Specific Notes

This project's CI config (`playwright.config.ts`):

- 2 retries in CI
- UTC timezone
- Base URL: `http://localhost:3030`
- Sharded execution across workers

If a test is flaky, **fix it** rather than relying on retries.

## Anti-Patterns

| Anti-Pattern                              | Problem                             | Solution                                                    |
| ----------------------------------------- | ----------------------------------- | ----------------------------------------------------------- |
| `waitForTimeout()` as primary wait        | Arbitrary, hides real timing issues | Use auto-waiting assertions                                 |
| Increasing global timeout to fix flakes   | Masks root cause, slows all tests   | Find and fix actual timing issue                            |
| Retrying until pass without investigation | Hides systemic problems             | Fix root cause, use retries for diagnosis only              |
| Module-level mutable state                | Leaks between tests                 | Use Playwright's default isolation (fresh context per test) |
| Ignoring flaky tests                      | Problem compounds over time         | Fix or quarantine with `test.fixme()` and a ticket          |
