# File Upload & Download Testing

Adapted from [currents-dev/playwright-best-practices-skill](https://github.com/currents-dev/playwright-best-practices-skill). Tailored for this project's Storybook + MSW integration tests.

## File Downloads

### Basic Download (Reports CSV, Transactions CSV)

```typescript
test('should download CSV report', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.locator('.adyen-pe-download').first().click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('report.csv');
});
```

### Save and Verify Content

```typescript
import fs from 'fs';

test('should download valid CSV', async ({ page }, testInfo) => {
    const downloadPromise = page.waitForEvent('download');
    await downloadButton.click();
    const download = await downloadPromise;

    const filePath = testInfo.outputPath(download.suggestedFilename());
    await download.saveAs(filePath);

    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('Name,Email,Status');
    expect(content.trim().split('\n').length).toBeGreaterThan(1);

    // Attach to test report for debugging
    await testInfo.attach('downloaded-file', { path: filePath });
});
```

### Download Error Testing

When the MSW handler returns an error (429, 500), the component shows an alert instead of downloading:

```typescript
test('should show error alert on download failure', async ({ page }) => {
    const downloadButton = page.locator('.adyen-pe-download').first();
    await downloadButton.click();
    await expect(page.getByRole('alert')).toBeVisible();
});
```

## File Uploads

### Basic Upload (Dispute Evidence)

```typescript
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixture = path.resolve(__dirname, '../../../fixtures/files/test-file.pdf');

test('should upload evidence file', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(fixture);
    await expect(page.getByText('test-file.pdf')).toBeVisible();
});
```

### Upload from Buffer (Dynamic Content)

```typescript
test('should upload generated file', async ({ page }) => {
    await page.getByLabel('CSV File').setInputFiles({
        name: 'data.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from('Name,Email\nJohn,john@example.com'),
    });
    await expect(page.getByText('data.csv')).toBeVisible();
});
```

### Clear and Re-upload

```typescript
const input = page.locator('input[type="file"]');
await input.setInputFiles(fixture);
await input.setInputFiles([]); // Clear
await input.setInputFiles(newFixture); // Re-upload
```

## Anti-Patterns

| Anti-Pattern                                   | Problem                         | Solution                                        |
| ---------------------------------------------- | ------------------------------- | ----------------------------------------------- |
| Not waiting for download                       | Race condition                  | Always use `page.waitForEvent('download')`      |
| Hardcoded download paths                       | Conflicts in parallel runs      | Use `testInfo.outputPath()`                     |
| Skipping content verification                  | Download might be empty/corrupt | Verify file content when possible               |
| Using `{ force: true }` for hidden file inputs | May not trigger proper events   | `setInputFiles` works directly on hidden inputs |
