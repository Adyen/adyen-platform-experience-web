# Test Annotations

Adapted from [currents-dev/playwright-best-practices-skill](https://github.com/currents-dev/playwright-best-practices-skill). Tailored for this project's Storybook + MSW integration tests.

## Skip, Fixme, Fail

| Annotation     | Runs? | Use Case                                             |
| -------------- | ----- | ---------------------------------------------------- |
| `test.skip()`  | No    | Feature not applicable / not ready                   |
| `test.fixme()` | No    | Known bug, needs investigation — tracked with ticket |
| `test.fail()`  | Yes   | Expected to fail, tracking a known bug               |

### Skip

```typescript
// Skip unconditionally
test.skip('feature not implemented', async ({ page }) => {});

// Skip with reason
test('payment flow', async ({ page }) => {
    test.skip(true, 'Payment gateway in maintenance');
});

// Skip in CI
test('local only', async ({ page }) => {
    test.skip(!!process.env.CI, 'Skipped in CI');
});
```

### Fixme (Known Bug — Preferred Over Skip for Bugs)

```typescript
test.fixme('broken after refactor', async ({ page }) => {
    // Test won't run but is tracked — link the ticket in description
});

test('flaky on CI', async ({ page }) => {
    test.fixme(!!process.env.CI, 'Investigate CI flakiness - IEX-XXXX');
});
```

### Fail (Expected Failure — Test Still Runs)

```typescript
test('known rendering bug', async ({ page }) => {
    test.fail(); // If test passes, it means the bug was fixed!
    await page.goto('/buggy-page');
    await expect(page.getByText('Working')).toBeVisible();
});
```

## Slow Tests

```typescript
// Triple the default timeout
test('large data import', async ({ page }) => {
    test.slow();
    // ...
});

// Custom timeout
test('very long operation', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes
});

// Timeout for describe block
test.describe('Slow integration tests', () => {
    test.describe.configure({ timeout: 60000 });
    // All tests here have 60s timeout
});
```

## Test Steps (Improved Report Readability)

Group logical actions into steps for better trace and report output:

```typescript
test('checkout flow', async ({ page }) => {
    await test.step('Add item to cart', async () => {
        await page.getByRole('button', { name: 'Add to Cart' }).click();
    });

    await test.step('Open balance account selector', async () => {
        await page.getByRole('button', { name: /balance account/i }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
    });

    await test.step('Select account and verify table reload', async () => {
        await selectFirstUnselectedBalanceAccount(page.getByRole('dialog'));
        await expect(page.getByRole('row')).toHaveCount(10);
    });
});
```

### Steps with Return Values

```typescript
const rowCount = await test.step('Count table rows', async () => {
    return await page.getByRole('row').count();
});
```

## Custom Annotations

```typescript
test('critical report feature', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'ticket', description: 'IEX-657' });
    testInfo.annotations.push({ type: 'priority', description: 'high' });
    // ...
});
```

## Anti-Patterns

| Anti-Pattern                             | Problem                | Solution                             |
| ---------------------------------------- | ---------------------- | ------------------------------------ |
| Skipping without reason                  | Hard to track why      | Always provide description           |
| Too many skipped tests                   | Test debt accumulates  | Review and clean up regularly        |
| Using `skip` instead of `fixme` for bugs | Loses intent           | Use `fixme` for bugs, `skip` for N/A |
| Not using steps in complex flows         | Hard to debug failures | Group logical actions in steps       |
