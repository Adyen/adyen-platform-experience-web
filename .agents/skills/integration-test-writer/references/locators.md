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

Two principles for role-based locators:

1. **Use `exact: true`** on every `getByRole` `name` and `getByText` call unless you intentionally need substring/regex matching. This prevents accidental partial matches (e.g., `'Sub'` matching both "Submit" and "Subscribe").
2. **Use the most constrained options** that match the element's expected state (`disabled`, `expanded`, `selected`, `checked`, `pressed`). A constrained locator doubles as a partial assertion — the test fails immediately if the element is in the wrong state.

```typescript
// Buttons — use exact + disabled when the button will be clicked
page.getByRole('button', { name: 'Balance account', exact: true, disabled: false });
page.getByRole('button', { name: 'Date range', exact: true, disabled: false });

// Buttons — expanded state for popover/dropdown triggers
page.getByRole('button', { name: 'Options', exact: true, expanded: true });
page.getByRole('button', { name: 'Options', exact: true, expanded: false });

// Buttons — disabled state assertion
page.getByRole('button', { name: 'Submit', exact: true, disabled: true });

// Tables
page.getByRole('table');
page.getByRole('columnheader');
page.getByRole('row');
page.getByRole('cell', { name: 'Report', exact: true });

// Dialogs (balance account selector, date picker)
page.getByRole('dialog');

// Options (balance account list items)
page.getByRole('option', { selected: true });
page.getByRole('option', { selected: false, disabled: false });

// Tabs — use selected to target the active/inactive tab
page.getByRole('tab', { name: 'Ongoing & closed', exact: true, selected: true });
page.getByRole('tab', { name: 'Details', exact: true, selected: false });

// Checkboxes / radio buttons — use checked
page.getByRole('checkbox', { name: 'Agree to terms', exact: true, checked: false });
page.getByRole('radio', { name: 'Option A', exact: true, checked: true });

// Alerts (error banners, download errors)
page.getByRole('alert');

// Links / headings when rendered semantically
page.getByRole('link', { name: 'Summary', exact: true });
page.getByRole('heading', { name: 'Reports', exact: true });

// Textbox / combobox — use disabled when filling
page.getByRole('textbox', { name: 'Reference', exact: true, disabled: false });
page.getByRole('combobox', { name: 'Currency', exact: true, expanded: true });
```

## Locator Constraints Quick Reference

Available `getByRole` constraint options per role. Always include `exact: true` when providing a `name`.

| Role       | Useful Options                    | Example                                             |
| ---------- | --------------------------------- | --------------------------------------------------- |
| `button`   | `disabled`, `expanded`, `pressed` | `{ name: 'Submit', exact: true, disabled: false }`  |
| `option`   | `selected`, `disabled`            | `{ selected: false, disabled: false }`              |
| `tab`      | `selected`                        | `{ name: 'Details', exact: true, selected: true }`  |
| `checkbox` | `checked`, `disabled`             | `{ name: 'Agree', exact: true, checked: false }`    |
| `radio`    | `checked`, `disabled`             | `{ name: 'Option A', exact: true, checked: true }`  |
| `link`     | `disabled`                        | `{ name: 'Docs', exact: true }`                     |
| `textbox`  | `disabled`                        | `{ name: 'Email', exact: true, disabled: false }`   |
| `combobox` | `disabled`, `expanded`            | `{ name: 'Currency', exact: true, expanded: true }` |
| `heading`  | `level`                           | `{ name: 'Title', exact: true, level: 2 }`          |

## Text & Label Locators

Use `exact: true` with `getByText` and `getByLabel` to prevent partial substring matches:

```typescript
// Use translated keys for i18n strings
import { getTranslatedKey } from '../../../utils/utils';
page.getByText(getTranslatedKey('reports.overview.title'), { exact: true });
page.getByLabel(getTranslatedKey('common.actions.apply.labels.default'), { exact: true });
```

## Scoped Locators

**Prefer locating elements from a scoped ancestor** derived from `page`, rather than querying `page` directly. Scoping narrows the search to a meaningful subtree, reducing false matches and making tests more resilient to surrounding UI changes.

### When to scope

- **Always** scope to `getComponentRoot(page)` when text might match Storybook chrome.
- **Prefer** scoping to a semantic ancestor (dialog, table, section, form, paragraph) when it meaningfully narrows the query — especially when the page contains multiple instances of similar elements.
- **Skip** scoping when the element is unique on the page and scoping adds no value or harms readability.

### Scoping to the component root

```typescript
import { getComponentRoot } from '../../../utils/utils';

// Avoid matching text in Storybook chrome
await expect(getComponentRoot(page).getByText('Description', { exact: true })).toBeVisible();
```

### Scoping to a dialog

```typescript
// Locate options inside the balance account dialog, not anywhere on the page
const dialog = page.getByRole('dialog');
await expect(dialog).toBeVisible();
const options = dialog.getByRole('option');
await expect(options).toHaveCount(3);
await dialog.getByRole('option', { selected: false, disabled: false }).first().click();
```

### Scoping to a table

```typescript
// Locate rows within a specific table, not any table on the page
const table = page.getByRole('table');
const rows = table.getByRole('rowgroup').nth(1).getByRole('row');
await expect(rows).toHaveCount(10);
```

### Scoping to a semantic container

```typescript
// Locate a link inside a specific paragraph
const legalParagraph = page.locator('p', {
    hasText: 'If your application for business credit is denied',
});
await expect(legalParagraph).toBeVisible();

const emailLink = legalParagraph.getByRole('link', {
    name: 'capital-support@adyen.com',
    exact: true,
});
await expect(emailLink).toBeVisible();
await expect(emailLink).toHaveAttribute('href', 'mailto:capital-support@adyen.com');
```

## Filtering & Chaining

```typescript
// Filter by text
page.getByRole('row').filter({ hasText: 'Payout' });
page.getByRole('option').filter({ hasText: 'S. Hopper - Main Account' });

// Filter by child locator
page.getByRole('row').filter({
    has: page.getByRole('button', { name: 'Download', exact: true }),
});

// Combine filters
page.getByRole('row')
    .filter({ hasText: 'Payout' })
    .filter({ has: page.getByRole('button', { name: 'Details', exact: true }) });

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

| Anti-Pattern                                                                       | Problem                                                 | Solution                                                             |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------- |
| `page.locator('.adyen-pe-button')`                                                 | Brittle, implementation-dependent                       | `page.getByRole('button', { name: 'Balance account', exact: true })` |
| `page.locator('[id="generated-id-123"]')`                                          | Breaks when IDs change                                  | Use role, text, label, or test-id                                    |
| `page.locator('div > div:nth-child(2) > button')`                                  | Fragile CSS chain                                       | Use semantic selectors                                               |
| Testing implementation details                                                     | Breaks on refactoring                                   | Test user-visible behavior                                           |
| `{ force: true }` on clicks                                                        | Hides real visibility/a11y issues                       | Fix the element state instead                                        |
| `page.getByRole('option', ...)` without scoping to dialog                          | Matches options anywhere on page                        | Scope: `dialog.getByRole('option', ...)`                             |
| `page.getByRole('button', { name: 'Submit' })` without `disabled: false`           | Matches even when disabled                              | Add `{ disabled: false }` if the test clicks it                      |
| `getByRole('button', { name: 'Sub' })` or `getByText('Sub')` without `exact: true` | Partial match — could match "Submit", "Subscribe", etc. | Always add `exact: true` to prevent substring matches                |
