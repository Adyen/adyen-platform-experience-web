# Locator Strategies

Adapted from [currents-dev/playwright-best-practices-skill](https://github.com/currents-dev/playwright-best-practices-skill). Tailored for this project's Storybook + MSW integration tests.

## Priority Order

1. **Role-based** (preferred): `getByRole` — matches how users and assistive technology see the page
2. **Label-based**: `getByLabel`, `getByPlaceholder`
3. **Text-based**: `getByText`, `getByTitle` — use `getTranslatedKey()` for i18n strings
4. **Test IDs**: `getByTestId` — for custom elements without semantic roles (e.g., `grant-id-copy-text`)
5. **CSS class**: `page.locator('.adyen-pe-tag', { hasText: 'Status' })` — only for project-specific UI (tags, download buttons)
6. **XPath** (last resort): `locator('xpath=ancestor::div[...]')` — only for ancestor traversal (e.g., form field errors)

## Role-Based Locators

```typescript
// Buttons
page.getByRole('button', { name: 'Submit', exact: true });
page.getByRole('button', { name: /submit/i });

// Tables
page.getByRole('table');
page.getByRole('columnheader');
page.getByRole('row');
page.getByRole('cell', { name: 'Status' });

// Dialogs (balance account selector, date picker)
page.getByRole('dialog');

// Options (balance account list items)
page.getByRole('option', { selected: true });
page.getByRole('option', { selected: false, disabled: false });

// Tabs (disputes, transaction details)
page.getByRole('tab', { name: 'Ongoing & closed' });

// Alerts (error banners, download errors)
page.getByRole('alert');

// Links
page.getByRole('link', { name: 'External link' });

// Headings
page.getByRole('heading', { name: 'Reports', level: 2 });

// Slider (capital offer amount)
page.getByRole('slider');
```

## Text & Label Locators

```typescript
// Text (partial match is default)
page.getByText('Welcome');
page.getByText('Welcome to our site', { exact: true });
page.getByText(/welcome/i);

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
page.getByRole('listitem').filter({ hasText: 'Payout' });
page.getByRole('listitem').filter({ hasNotText: 'Expired' });

// Filter by child locator
page.getByRole('listitem').filter({
    has: page.getByRole('button', { name: 'Download' }),
});

// Combine filters
page.getByRole('row')
    .filter({ hasText: 'Active' })
    .filter({ has: page.getByRole('button', { name: 'Details' }) });

// Navigate down the DOM
page.getByRole('article').getByRole('heading');

// Parent/ancestor traversal
page.getByText('Child').locator('..');
page.getByText('Child').locator('xpath=ancestor::article');

// nth, first, last
page.getByRole('listitem').first();
page.getByRole('listitem').last();
page.getByRole('listitem').nth(2); // 0-indexed
```

## Project-Specific CSS Class Locators

Only use these when no semantic selector exists:

```typescript
// Status tags
page.locator('.adyen-pe-tag', { hasText: 'Chargeback' });
page.locator('.adyen-pe-tag--default', { hasText: 'Undefended' });

// Download buttons
page.locator('.adyen-pe-download').first();

// Alert icons
page.locator('.adyen-pe-alert__icon');

// Download error state
page.locator('div')
    .filter({ hasText: /^Failed, retry$/ })
    .locator('svg');
```

## Dynamic Content

Locators auto-wait for actionability by default. For explicit state waiting:

```typescript
await page.getByRole('button').waitFor({ state: 'visible' });
await page.getByText('Loading').waitFor({ state: 'hidden' });
await page.getByTestId('modal').waitFor({ state: 'detached' }); // Removed from DOM
```

## Anti-Patterns

| Anti-Pattern                                      | Problem                           | Solution                                       |
| ------------------------------------------------- | --------------------------------- | ---------------------------------------------- |
| `page.locator('.btn-primary')`                    | Brittle, implementation-dependent | `page.getByRole('button', { name: 'Submit' })` |
| `page.locator('#dynamic-id-123')`                 | Breaks when IDs change            | Use role, text, label, or test-id              |
| `page.locator('div > div:nth-child(2) > button')` | Fragile CSS chain                 | Use semantic selectors                         |
| Testing implementation details                    | Breaks on refactoring             | Test user-visible behavior                     |
| `{ force: true }` on clicks                       | Hides real visibility/a11y issues | Fix the element state instead                  |
