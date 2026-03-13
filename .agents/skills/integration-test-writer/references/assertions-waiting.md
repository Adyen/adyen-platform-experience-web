# Assertions & Waiting

Repo-focused guidance for this project's Storybook + MSW integration tests.

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

// Combined error copy rendered in a single paragraph/container
const errorMessage = page.locator('p').filter({ hasText: getTranslatedKey('reports.overview.errors.listUnavailable') });
await expect(errorMessage).toContainText(getTranslatedKey('reports.overview.errors.listUnavailable'));
await expect(errorMessage).toContainText(getTranslatedKey('common.errors.retry'));
```

## Generic Assertions (for Non-UI Values)

These do NOT auto-retry. Use for values extracted from the page.

```typescript
expect(value).toBe(5);
expect(download.suggestedFilename()).toBe('report.csv');
expect(newPage.url()).toBe('https://expected-url.com');
```

## Soft Assertions

Continue test execution after failure, report all failures at end. Use sparingly; most repo tests prefer regular `expect` plus progressive assertions.

```typescript
test('should render all dashboard elements', async ({ page }) => {
    await expect.soft(page.getByRole('heading')).toHaveText('Dashboard');
    await expect.soft(page.getByRole('table')).toBeVisible();
    await expect.soft(page.getByRole('button', { name: 'Export' })).toBeEnabled();
    // All failures reported at end
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
await page.getByRole('dialog').waitFor({ state: 'detached' }); // Removed from DOM
```

### Wait for Network

```typescript
// Wait for request (verify filter refresh / retry triggers correct call)
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
await page.getByRole('link', { name: 'Summary' }).click();
const newPage = await newPagePromise;
await newPage.waitForLoadState();
```

## Polling & Retrying

`toPass()` and `expect.poll()` are available, but they should be a fallback after better locators and web-first assertions. In this repo, most integration tests should rely on Playwright auto-waiting, `waitForRequest`, and DOM assertions first.

## Defensive Assertions

Add progressive assertions that help diagnose failures:

```typescript
// Bad — single point of failure
await expect(page.getByRole('row')).toHaveCount(5);

// Good — progressive, narrows down the issue
await expect(page.getByRole('table')).toBeVisible();
await expect(page.getByText('Loading')).not.toBeVisible();
await expect(page.getByRole('table').getByRole('rowgroup').nth(1).getByRole('row')).toHaveCount(10);
```

## Anti-Patterns

| Anti-Pattern                                  | Problem                           | Solution                                                        |
| --------------------------------------------- | --------------------------------- | --------------------------------------------------------------- |
| `await page.waitForTimeout(5000)`             | Slow, flaky, arbitrary timing     | Use auto-waiting or `waitForResponse`                           |
| `await new Promise(r => setTimeout(r, 1000))` | Same as above                     | Use element state waits                                         |
| Generic assertions on DOM elements            | No auto-retry, flaky              | Use web-first assertions: `await expect(locator).toBeVisible()` |
| Increasing global timeout to fix flakes       | Masks root cause, slows all tests | Find and fix the actual timing issue                            |
