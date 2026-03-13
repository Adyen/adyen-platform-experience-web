# Assertions & Waiting

Adapted from [currents-dev/playwright-best-practices-skill](https://github.com/currents-dev/playwright-best-practices-skill). Tailored for this project's Storybook + MSW integration tests.

## Web-First Assertions (Always Prefer These)

Auto-retry until condition is met or timeout. Always prefer these over generic assertions for DOM elements.

```typescript
// Visibility
await expect(page.getByRole('button')).toBeVisible();
await expect(page.getByRole('button')).toBeHidden();
await expect(page.getByRole('button')).not.toBeVisible();

// Enabled/Disabled
await expect(page.getByRole('button')).toBeEnabled();
await expect(page.getByRole('button')).toBeDisabled();

// Text content
await expect(page.getByRole('heading')).toHaveText('Reports');
await expect(page.getByRole('heading')).toContainText('Reports');

// Count (rows, columns, options)
await expect(page.getByRole('row')).toHaveCount(10);
await expect(page.getByRole('columnheader')).toHaveCount(3);

// Attributes
await expect(tab).toHaveAttribute('aria-selected', 'true');

// Input values
await expect(page.getByLabel('Email')).toHaveValue('user@example.com');
await expect(page.getByLabel('Search')).toBeEmpty();

// Focus
await expect(page.getByLabel('Email')).toBeFocused();
```

## Generic Assertions (for Non-UI Values)

These do NOT auto-retry. Use for values extracted from the page.

```typescript
expect(value).toBe(5);
expect(clipboardText).toBe('expected-value');
expect(download.suggestedFilename()).toBe('report.csv');
expect(newPage.url()).toBe('https://expected-url.com');
```

## Soft Assertions

Continue test execution after failure, report all failures at end. Useful for checking multiple independent elements:

```typescript
test('should render all dashboard elements', async ({ page }) => {
    await expect.soft(page.getByRole('heading')).toHaveText('Dashboard');
    await expect.soft(page.getByRole('table')).toBeVisible();
    await expect.soft(page.getByRole('button', { name: 'Export' })).toBeEnabled();
    // All failures reported at end
});

// Early exit when a critical soft assertion fails
test('check form', async ({ page }) => {
    await expect.soft(page.getByRole('form')).toBeVisible();
    if (expect.soft.hasFailures()) return; // No point checking fields

    await expect.soft(page.getByLabel('Name')).toBeVisible();
    await expect.soft(page.getByLabel('Email')).toBeVisible();
});
```

## Parallel Assertions (Performance)

Use `Promise.all` for independent assertions:

```typescript
await Promise.all([
    expect(page.getByText('Title')).toBeVisible(),
    expect(page.getByRole('table')).toBeVisible(),
    expect(page.getByRole('button', { name: 'Next' })).toBeVisible(),
]);
```

## Waiting Strategies

### Auto-Waiting (Default)

Actions automatically wait for elements to be attached, visible, stable, and enabled. Usually no explicit waits needed:

```typescript
await page.getByRole('button', { name: 'Submit' }).click(); // Auto-waits
await page.getByLabel('Email').fill('test@example.com'); // Auto-waits
```

### Wait for Element State

```typescript
await page.getByRole('dialog').waitFor({ state: 'visible' });
await page.getByText('Loading...').waitFor({ state: 'hidden' });
await page.getByTestId('modal').waitFor({ state: 'detached' }); // Removed from DOM
```

### Wait for Network

```typescript
// Wait for specific API response after action
const responsePromise = page.waitForResponse(resp => resp.url().includes('/api/data') && resp.ok());
await page.getByRole('button', { name: 'Load' }).click();
const response = await responsePromise;

// Wait for request (verify retry/refresh triggers correct call)
const requestPromise = page.waitForRequest(req => req.url().includes('/reports'));
await page.getByRole('button', { name: 'Refresh' }).click();
await requestPromise;
```

### Wait for Download

```typescript
const downloadPromise = page.waitForEvent('download');
await downloadButton.click();
const download = await downloadPromise;
expect(download.suggestedFilename()).toBe('report.csv');
```

### Wait for New Tab

```typescript
const newPagePromise = page.context().waitForEvent('page');
await page.getByRole('link', { name: 'External' }).click();
const newPage = await newPagePromise;
await newPage.waitForLoadState();
```

## Polling & Retrying

### `toPass()` — Retry a Block Until It Passes

```typescript
await expect(async () => {
    const response = await page.request.get('/api/status');
    expect(response.status()).toBe(200);
}).toPass({
    intervals: [1000, 2000, 5000],
    timeout: 30000,
});
```

### `expect.poll()` — Poll a Value

```typescript
await expect.poll(() => page.getByTestId('counter').textContent(), { intervals: [500, 1000], timeout: 10000 }).toBe('10');
```

## Defensive Assertions

Add progressive assertions that help diagnose failures:

```typescript
// Bad — single point of failure
await expect(page.getByRole('row')).toHaveCount(5);

// Good — progressive, narrows down the issue
await expect(page.getByRole('table')).toBeVisible();
await expect(page.getByText('Loading')).not.toBeVisible();
await expect(page.getByRole('row')).toHaveCount(5);
```

## Anti-Patterns

| Anti-Pattern                                  | Problem                           | Solution                                                        |
| --------------------------------------------- | --------------------------------- | --------------------------------------------------------------- |
| `await page.waitForTimeout(5000)`             | Slow, flaky, arbitrary timing     | Use auto-waiting or `waitForResponse`                           |
| `await new Promise(r => setTimeout(r, 1000))` | Same as above                     | Use element state waits                                         |
| Generic assertions on DOM elements            | No auto-retry, flaky              | Use web-first assertions: `await expect(locator).toBeVisible()` |
| Increasing global timeout to fix flakes       | Masks root cause, slows all tests | Find and fix the actual timing issue                            |
