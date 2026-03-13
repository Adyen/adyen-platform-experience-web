# Debugging & Troubleshooting

Repo-focused guidance for this project's Storybook + MSW integration tests.

## Quick Debugging Commands

```bash
# Run in headed mode (see the browser)
pnpm exec playwright test tests/integration/components/{componentName} --project local-chrome --headed

# Run with Playwright inspector (step through actions)
PWDEBUG=1 pnpm exec playwright test tests/integration/components/{componentName} --project local-chrome

# This project's debug script
pnpm run test:integration:debug

# Run with trace enabled
pnpm run test:integration -- --grep "{testName}" --trace on

# View trace from failed test
npx playwright show-trace test-results/{path}/trace.zip

# Inspect Playwright's generated failure snapshot first
cat test-results/{path}/error-context.md
```

## Debug in Code

```typescript
test('debug example', async ({ page }) => {
    await goToStory(page, { id: STORY_ID });
    await page.pause(); // Opens inspector, step through from here
});
```

## Trace Viewer

Traces contain screenshots at each action, DOM snapshots, network requests, console logs, and action timeline. In this repo, also check `test-results/**/error-context.md` because it often reveals the rendered DOM faster than opening a trace.

```typescript
// playwright.config.ts already configures:
// trace: 'on-first-retry' in CI
// screenshot: 'only-on-failure' may be enabled for targeted debugging if needed
```

## Troubleshooting by Symptom

| Symptom                                     | Likely Cause                                | Solution                                                               |
| ------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------- |
| Element not found                           | Wrong selector, element not visible, timing | Check locator with Inspector, wait for visibility                      |
| Timeout errors                              | Slow network mock, heavy page load          | Check MSW handler delay, current page limit, and per-assertion timeout |
| Test passes locally, fails in CI            | Environment differences, headless rendering | Run headless locally, check CI sharding                                |
| Flaky test                                  | Race condition, timing dependency           | See [flaky-tests.md](flaky-tests.md)                                   |
| Wrong text content                          | Missing i18n key, wrong translation         | Check `getTranslatedKey()` matches component                           |
| Storybook text matches instead of component | Ambiguous text selector                     | Use `getComponentRoot(page).getByText(...)`                            |

## Log Element State

```typescript
// Count matching elements
console.log('Rows:', await page.getByRole('table').getByRole('rowgroup').nth(1).getByRole('row').count());

// Check visibility
console.log('Visible:', await page.getByRole('button', { name: 'Balance account', exact: true }).isVisible());

// Highlight element in headed mode
await page.getByRole('button').highlight();

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

## Step-by-Step Debugging Process

1. **Reproduce**: Run the component folder with `--trace on` or `--repeat-each=5`
2. **Inspect**: Read `test-results/**/error-context.md` first, then open the trace if needed
3. **Isolate**: Add `await page.pause()` at the failure point, log row counts / key locator visibility
4. **Check**: Did the MSW handler return the expected data? Is pagination limiting the rendered rows? Is the text combined in one container?
5. **Fix**: Fix root cause (not symptoms), rerun the focused component folder and burn-in again
