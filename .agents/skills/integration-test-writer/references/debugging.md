# Debugging & Troubleshooting

Adapted from [currents-dev/playwright-best-practices-skill](https://github.com/currents-dev/playwright-best-practices-skill). Tailored for this project's Storybook + MSW integration tests.

## Quick Debugging Commands

```bash
# Run in headed mode (see the browser)
pnpm run test:integration -- --headed --grep "{componentName}"

# Run with Playwright inspector (step through actions)
PWDEBUG=1 pnpm run test:integration -- --grep "{componentName}"

# This project's debug script
pnpm run test:integration:debug

# Run with trace enabled
pnpm run test:integration -- --grep "{testName}" --trace on

# View trace from failed test
npx playwright show-trace test-results/{path}/trace.zip

# Interactive UI mode
pnpm run test:integration -- --ui --grep "{componentName}"
```

## Debug in Code

```typescript
test('debug example', async ({ page }) => {
    await goToStory(page, { id: STORY_ID });
    await page.pause(); // Opens inspector, step through from here
});
```

## Trace Viewer

Traces contain screenshots at each action, DOM snapshots, network requests, console logs, and action timeline.

```typescript
// playwright.config.ts already configures:
// trace: 'on-first-retry' in CI
// screenshot: 'only-on-failure' in CI
```

## Troubleshooting by Symptom

| Symptom                                     | Likely Cause                                | Solution                                                |
| ------------------------------------------- | ------------------------------------------- | ------------------------------------------------------- |
| Element not found                           | Wrong selector, element not visible, timing | Check locator with Inspector, wait for visibility       |
| Timeout errors                              | Slow network mock, heavy page load          | Check MSW handler delay, increase per-assertion timeout |
| Test passes locally, fails in CI            | Environment differences, headless rendering | Run headless locally, check CI sharding                 |
| Flaky test                                  | Race condition, timing dependency           | See [flaky-tests.md](flaky-tests.md)                    |
| Wrong text content                          | Missing i18n key, wrong translation         | Check `getTranslatedKey()` matches component            |
| Storybook text matches instead of component | Ambiguous text selector                     | Use `getComponentRoot(page).getByText(...)`             |

## Log Element State

```typescript
// Count matching elements
console.log('Count:', await page.getByRole('button').count());

// Check visibility
console.log('Visible:', await page.getByRole('button').isVisible());

// Highlight element in headed mode
await page.getByRole('button').highlight();

// List all buttons
const buttons = await page.getByRole('button').all();
for (const button of buttons) {
    console.log(await button.textContent());
}

// Screenshot at specific point
await page.screenshot({ path: 'debug.png' });
```

## Debug Network / MSW Issues

```typescript
test('debug network', async ({ page }) => {
    page.on('request', req => console.log('>>', req.method(), req.url()));
    page.on('response', resp => console.log('<<', resp.status(), resp.url()));
    page.on('requestfailed', req => console.log('FAILED:', req.url(), req.failure()?.errorText));

    await goToStory(page, { id: STORY_ID });
});
```

## Debug Console Errors

```typescript
test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`CONSOLE [${msg.type()}]:`, msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
});
```

## Step-by-Step Debugging Process

1. **Reproduce**: Run with `--trace on` or `--repeat-each=10` if intermittent
2. **Inspect**: View trace with `npx playwright show-trace` or run `--headed`
3. **Isolate**: Add `await page.pause()` at the failure point, log element state
4. **Check**: Network requests completing? MSW handler returning expected data? Element in correct state?
5. **Fix**: Fix root cause (not symptoms), run `--repeat-each=5` to confirm stability
