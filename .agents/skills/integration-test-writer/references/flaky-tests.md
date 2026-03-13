# Flaky Tests: Prevention, Detection & Fixing

Repo-focused guidance for this project's Storybook + MSW integration tests.

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
pnpm exec playwright test tests/integration/components/{componentName} --project local-chrome --repeat-each=5

# Run with trace to capture failure details
pnpm run test:integration -- --grep "testName" --trace on

# View trace from failed run
npx playwright show-trace test-results/{path}/trace.zip
```

## Fixing Strategies

### UI-Driven Flakiness

```typescript
// Bad: No wait for element state
await page.locator('.adyen-pe-download').click();

// Good: Auto-waiting via role-based selector + assertion
await page.getByRole('button', { name: 'Download report', exact: true }).click();
await expect(page.getByRole('alert')).toBeVisible();
```

### Timing Flakiness

```typescript
// Bad: Arbitrary sleep
await page.getByRole('button', { name: 'Balance account', exact: true }).click();
await page.waitForTimeout(3000);

// Good: Wait for specific condition
await page.getByRole('button', { name: 'Balance account', exact: true }).click();
await expect(page.getByRole('dialog')).toBeVisible();

// Better: Wait for network response, then assert
const requestPromise = page.waitForRequest(req => req.url().includes('/reports'));
await page.getByRole('button', { name: 'Refresh', exact: true }).click();
await requestPromise;
await expect(page.getByRole('table')).toBeVisible();
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
pnpm exec playwright test tests/integration/components/{componentName} --project local-chrome --repeat-each=5
```

### Isolation Checklist

- Each test gets a fresh page via `test.beforeEach` calling `goToStory`
- No module-level mutable state shared between tests
- Each spec file is self-contained (no dependency on other spec files)
- MSW handlers are deterministic (no random data, fixed dates via `setTime` or `page.clock.setFixedTime(...)`)

### Defensive Assertions

```typescript
// Bad — single point of failure with no context
await expect(page.getByRole('row')).toHaveCount(5);

// Good — progressive assertions narrow down the issue
await expect(page.getByRole('table')).toBeVisible();
await expect(page.getByText('Loading')).not.toBeVisible();
await expect(page.getByRole('table').getByRole('rowgroup').nth(1).getByRole('row')).toHaveCount(10);
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
