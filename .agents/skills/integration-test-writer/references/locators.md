# Locator Strategies

Repo-focused guidance for this project's Storybook + MSW integration tests.

## Priority Order

1. **Role-based** (preferred): `getByRole` — matches how users and assistive technology see the page
2. **Label-based**: `getByLabel`, `getByPlaceholder`
3. **Text-based**: `getByText`, `getByTitle` — use `getTranslatedKey()` for i18n strings
4. **Test IDs**: `getByTestId` — for custom elements without semantic roles already exposed by the component
5. **CSS class**: `page.locator('.adyen-pe-tag', { hasText: 'Status' })` — only for project-specific UI (tags, download buttons)
6. **XPath** (last resort): `locator('xpath=ancestor::div[...]')` — only for ancestor traversal (e.g., form field errors)

## Role-Based Locators

```typescript
// Buttons
page.getByRole('button', { name: 'Balance account', exact: true });
page.getByRole('button', { name: 'Date range', exact: true });

// Tables
page.getByRole('table');
page.getByRole('columnheader');
page.getByRole('row');
page.getByRole('cell', { name: 'Report' });

// Dialogs (balance account selector, date picker)
page.getByRole('dialog');

// Options (balance account list items)
page.getByRole('option', { selected: true });
page.getByRole('option', { selected: false, disabled: false });

// Tabs (existing components that use tabs)
page.getByRole('tab', { name: 'Ongoing & closed' });

// Alerts (error banners, download errors)
page.getByRole('alert');

// Links / headings when rendered semantically
page.getByRole('link', { name: 'Summary' });
page.getByRole('heading', { name: 'Reports' });
```

## Text & Label Locators

```typescript
// Use translated keys for i18n strings
import { getTranslatedKey } from '../../../utils/utils';
page.getByText(getTranslatedKey('reports.overview.title'));
page.getByLabel(getTranslatedKey('common.actions.apply.labels.default'));
```

## Scoping to Avoid Storybook Chrome Matches

```typescript
import { getComponentRoot } from '../../../utils/utils';

// Scope queries to the component root to avoid matching Storybook UI
await expect(getComponentRoot(page).getByText('Description')).toBeVisible();
```

## Filtering & Chaining

```typescript
// Filter by text
page.getByRole('row').filter({ hasText: 'Payout' });
page.getByRole('option').filter({ hasText: 'S. Hopper - Main Account' });

// Filter by child locator
page.getByRole('row').filter({
    has: page.getByRole('button', { name: 'Download' }),
});

// Combine filters
page.getByRole('row')
    .filter({ hasText: 'Payout' })
    .filter({ has: page.getByRole('button', { name: 'Details' }) });

// Navigate down the DOM
page.getByRole('table').getByRole('rowgroup').nth(1).getByRole('row');

// Parent/ancestor traversal
page.getByText('Child').locator('..');
page.getByText('Child').locator('xpath=ancestor::div[contains(@class,"adyen-pe-form-field")]');

// nth, first, last
page.getByRole('row').first();
page.getByRole('row').last();
page.getByRole('row').nth(2); // 0-indexed
```

## Project-Specific CSS Class Locators

Only use these when no semantic selector exists:

```typescript
// Download buttons
page.locator('.adyen-pe-download').first();

// Alert containers without a better semantic hook
page.locator('.adyen-pe-alert');
```

## Dynamic Content

Locators auto-wait for actionability by default. For explicit state waiting:

```typescript
await page.getByRole('button').waitFor({ state: 'visible' });
await page.getByText('Loading').waitFor({ state: 'hidden' });
await page.getByTestId('modal').waitFor({ state: 'detached' }); // Removed from DOM
```

## Anti-Patterns

| Anti-Pattern                                      | Problem                           | Solution                                                |
| ------------------------------------------------- | --------------------------------- | ------------------------------------------------------- |
| `page.locator('.adyen-pe-button')`                | Brittle, implementation-dependent | `page.getByRole('button', { name: 'Balance account' })` |
| `page.locator('[id="generated-id-123"]')`         | Breaks when IDs change            | Use role, text, label, or test-id                       |
| `page.locator('div > div:nth-child(2) > button')` | Fragile CSS chain                 | Use semantic selectors                                  |
| Testing implementation details                    | Breaks on refactoring             | Test user-visible behavior                              |
| `{ force: true }` on clicks                       | Hides real visibility/a11y issues | Fix the element state instead                           |
