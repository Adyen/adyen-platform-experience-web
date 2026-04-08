# Common Test Patterns

Project-specific Playwright patterns extracted from all existing integration tests. Consult this reference when writing new specs.

## Assertions

**Parallel assertions for performance:**

```typescript
await Promise.all([
    expect(page.getByText('Title')).toBeVisible(),
    expect(page.getByRole('table')).toBeVisible(),
    expect(page.getByRole('button', { name: 'Next' })).toBeVisible(),
]);
```

**Negative visibility assertions:**

```typescript
await expect(saveButton).not.toBeVisible();
await expect(errorMessage).not.toBeVisible();
```

**Button state assertions:**

```typescript
await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled();
await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
```

**Element count assertions:**

```typescript
await expect(page.getByRole('row')).toHaveCount(10);
```

**Attribute assertions (e.g., active tab):**

```typescript
await expect(tab).toHaveAttribute('aria-selected', 'true');
```

**Loop-based row assertions (verify all rows match filter):**

```typescript
const rows = page.getByRole('row');
const rowCount = await rows.count();
for (let i = 1; i < rowCount; i++) {
    await expect(rows.nth(i).getByRole('cell').nth(colIndex)).toHaveText('Expected');
}
```

## Filters

**Balance account filter:**

```typescript
test.describe('Filter: Balance account', () => {
    test('should open balance account selector', async ({ page }) => {
        const filterButton = page.getByRole('button', { name: /balance account/i });
        await filterButton.click();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
    });

    test('should list balance account options', async ({ page }) => {
        const filterButton = page.getByRole('button', { name: /balance account/i });
        await filterButton.click();
        const options = page.getByRole('option');
        await expect(options).toHaveCount(N);
    });
});
```

**Date range filter:**

```typescript
import { applyDateFilter } from '../../../utils/utils';
```

**Conditional click based on current state (e.g., deselecting a filter option):**

```typescript
const option = dialog.getByRole('option').nth(0);
if ((await option.getAttribute('aria-selected')) === 'true') {
    await option.click();
}
```

## Dialogs & Navigation

**Dismiss dialog by clicking outside:**

```typescript
import { clickOutsideDialog } from '../../../utils/utils';

test('should close dialog when clicking outside', async ({ page }) => {
    const dialog = page.getByRole('dialog');
    await clickOutsideDialog(dialog);
});
```

**View transitions (wait for element to leave DOM):**

```typescript
await element.click();
await element.waitFor({ state: 'detached' });
// Assert next view
```

**Tab navigation (race-condition-safe):**

```typescript
const tabSelectedPromise = expect(tab).toHaveAttribute('aria-selected', 'true');
await tab.click();
await tabSelectedPromise;
```

**Testing callback props via story args:**

```typescript
test('should show callback button when enabled', async ({ page }) => {
    await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });
    await expect(page.getByRole('button', { name: 'Contact support' })).toBeVisible();
});
```

## States

**Empty state:**

```typescript
test('should show empty state message', async ({ page }) => {
    await expect(page.getByText('No results found')).toBeVisible();
});
```

**Error state:**

```typescript
test('should show error message', async ({ page }) => {
    await expect(page.getByRole('alert')).toBeVisible();
});
```

**UI freeze during async operations:**

```typescript
test('should disable inputs during submission', async ({ page }) => {
    await submitButton.click();
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toHaveText('In progress..');
});
```

## Interactions

**Tooltip hover:**

```typescript
test('should show tooltip on hover', async ({ page }) => {
    await page.getByText('Hover target').hover();
    const tooltip = page.getByText('Tooltip content');
    await tooltip.waitFor();
    await expect(tooltip).toBeVisible();
});
```

**Download button testing (error):**

```typescript
test('should show error alert on download failure', async ({ page }) => {
    const downloadButton = page.locator('.adyen-pe-download').first();
    await downloadButton.click();
    await expect(page.getByRole('alert')).toBeVisible();
});
```

**Download assertion (success via browser event):**

```typescript
test('should download file', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await downloadButton.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('expected-file.csv');
});
```

**Clipboard testing:**

```typescript
test('should copy to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Copy' }).click();
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe('expected-value');
});
```

**Network request interception (verify retry/refresh):**

```typescript
test('should retry on refresh click', async ({ page }) => {
    const requestPromise = page.waitForRequest(req => req.url().includes('/endpoint'));
    await page.getByRole('button', { name: 'Refresh' }).click();
    await requestPromise;
});
```

**New tab/window assertion:**

```typescript
test('should open link in new tab', async ({ page }) => {
    const newPagePromise = page.context().waitForEvent('page');
    await page.getByRole('link', { name: 'External link' }).click();
    const newPage = await newPagePromise;
    await newPage.waitForLoadState();
    expect(newPage.url()).toBe('https://expected-url.com');
});
```

**Console output assertion:**

```typescript
test('should log action', async ({ page }) => {
    const consolePromise = new Promise<string>(resolve => {
        page.once('console', msg => resolve(msg.text()));
    });
    await actionButton.click();
    expect(await consolePromise).toBe('Action');
});
```

## Scoping & Disambiguation

**Scope queries with `getComponentRoot`:**

```typescript
import { getComponentRoot } from '../../../utils/utils';

// Avoid matching text in Storybook chrome
await expect(getComponentRoot(page).getByText('Description')).toBeVisible();
```

**User-facing text in locators:**

Use the actual expected text (from `src/assets/translations/en-US.json`) instead of `getTranslatedKey()`:

```typescript
await expect(page.getByText('Reports')).toBeVisible();
```

## Form Validation

**Field error message with ancestor traversal:**

```typescript
const getFieldErrorMessage = (field: Locator) =>
    field.locator('xpath=ancestor::div[contains(@class,"adyen-pe-form-field")]').locator('.adyen-pe-form-field__error');
```

**Progressive input validation:**

```typescript
// Test edge cases systematically: empty -> invalid -> boundary -> valid
await input.fill('');
await expect(getFieldErrorMessage(input)).toBeVisible();
await input.fill('-1');
await expect(getFieldErrorMessage(input)).toHaveText('Must be positive');
await input.fill('999999');
await expect(getFieldErrorMessage(input)).toHaveText('Exceeds maximum');
await input.fill('100');
await expect(getFieldErrorMessage(input)).not.toBeVisible();
```

**Reading current input values:**

```typescript
const value = await page.locator('input[name="reference"]').inputValue();
expect(value).toBe('expected-prefilled-value');
```

## File Uploads

**File upload with fixture:**

```typescript
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixture = path.resolve(__dirname, '../../../fixtures/files/test-file.pdf');

test('should upload file', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(fixture);
    await expect(page.getByText('test-file.pdf')).toBeVisible();
});
```
