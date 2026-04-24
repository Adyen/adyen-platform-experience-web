# Console & JavaScript Error Handling

Adapted from [currents-dev/playwright-best-practices-skill](https://github.com/currents-dev/playwright-best-practices-skill). Tailored for this project's Storybook + MSW integration tests.

## Capturing Console Output

### Capture All Console Messages

```typescript
test('debug console output', async ({ page }) => {
    const logs: string[] = [];

    page.on('console', msg => {
        logs.push(`${msg.type()}: ${msg.text()}`);
    });

    await goToStory(page, { id: STORY_ID });
    console.log('Captured logs:', logs);
});
```

### Capture by Type

```typescript
test('check for console errors', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
        if (msg.type() === 'warning') warnings.push(msg.text());
    });

    await goToStory(page, { id: STORY_ID });

    expect(errors, `Console errors:\n${errors.join('\n')}`).toHaveLength(0);
});
```

## Asserting Console Output (Action Callbacks)

Used in `dataCustomization` tests to verify custom button callbacks:

```typescript
test('should log action on button click', async ({ page }) => {
    const consolePromise = new Promise<string>(resolve => {
        page.once('console', msg => resolve(msg.text()));
    });
    await actionButton.click();
    expect(await consolePromise).toBe('Action');
});
```

## Catching Uncaught Exceptions

```typescript
test('no uncaught exceptions', async ({ page }) => {
    const pageErrors: Error[] = [];

    page.on('pageerror', error => {
        pageErrors.push(error);
    });

    await goToStory(page, { id: STORY_ID });
    // ... test actions ...

    expect(pageErrors, `Uncaught exceptions:\n${pageErrors.map(e => e.message).join('\n')}`).toHaveLength(0);
});
```

## Fail with Allowed Exceptions

```typescript
test('no unexpected console errors', async ({ page }) => {
    const allowedErrors = [/Failed to load resource.*favicon/, /ResizeObserver loop/];

    const unexpectedErrors: string[] = [];

    page.on('console', msg => {
        if (msg.type() === 'error') {
            const text = msg.text();
            const isAllowed = allowedErrors.some(pattern => pattern.test(text));
            if (!isAllowed) unexpectedErrors.push(text);
        }
    });

    await goToStory(page, { id: STORY_ID });

    expect(unexpectedErrors, `Unexpected console errors:\n${unexpectedErrors.join('\n')}`).toHaveLength(0);
});
```

## Debug Helper (add to `beforeEach` temporarily)

```typescript
test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`CONSOLE [${msg.type()}]:`, msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
    page.on('requestfailed', req => console.error(`REQUEST FAILED: ${req.url()}`));
});
```
