# Page Object Model (POM)

Adapted from [currents-dev/playwright-best-practices-skill](https://github.com/currents-dev/playwright-best-practices-skill). Tailored for this project's Storybook + MSW integration tests.

## When to Use POMs in This Project

- **Use POMs** when 3+ spec files share the same interaction helpers for a complex component
- **Use inline helpers** (scoped `const` functions inside `test.describe`) for simpler cases
- **Keep tests self-contained** when a component has few scenarios

Existing POMs live in `tests/models/`:

- `tests/models/external-components/` — external component POMs
- `tests/models/internal-components/` — reusable POMs for DataGrid, FilterBar, etc.

## Basic Structure

```typescript
// tests/models/external-components/reportsOverview.page.ts
import { type Locator, type Page } from '@playwright/test';

export class ReportsOverviewPage {
    readonly page: Page;
    readonly table: Locator;
    readonly title: Locator;
    readonly filterBar: Locator;

    constructor(page: Page) {
        this.page = page;
        this.table = page.getByRole('table');
        this.title = page.getByRole('heading');
        this.filterBar = page.locator('.adyen-pe-filter-bar');
    }

    async getRowCount() {
        return this.table.getByRole('row').count();
    }

    async getColumnHeaders() {
        return this.table.getByRole('columnheader');
    }
}
```

## Composition with Internal Component POMs

POMs can compose internal component POMs as properties:

```typescript
import { DataGridPage } from '../internal-components/dataGrid';
import { FilterBarPage } from '../internal-components/filterBar';
import { applyDateFilter } from '../../utils/utils';

export class TransactionsOverviewPage {
    readonly page: Page;
    readonly dataGrid: DataGridPage;
    readonly filterBar: FilterBarPage;
    readonly applyDate: ReturnType<typeof applyDateFilter>;

    constructor(page: Page) {
        this.page = page;
        this.dataGrid = new DataGridPage(page);
        this.filterBar = new FilterBarPage(page);
        this.applyDate = applyDateFilter(page);
    }
}
```

## Inline Helpers (Preferred for Simple Cases)

For repeated assertion blocks within a single spec, define scoped async functions:

```typescript
test.describe('Component - Default', () => {
    const expectDefaultRendering = async (page: Page) => {
        await Promise.all([expect(page.getByText('Title')).toBeVisible(), expect(page.getByRole('table')).toBeVisible()]);
    };

    test('should render default view', async ({ page }) => {
        await expectDefaultRendering(page);
    });

    test('should return to default view after action', async ({ page }) => {
        // ... perform action ...
        await expectDefaultRendering(page);
    });
});
```

## Best Practices

### Do

- Keep locators in the POM — single source of truth for selectors
- Expose `Locator` properties for custom assertions in tests
- Use descriptive method names — `openBalanceAccountSelector()` not `clickButton()`
- Keep methods focused — one action per method

### Don't

- Don't put assertions in POM methods (usually) — keep in tests
- Don't make POMs too large — split into composition of smaller component POMs
- Don't share state between POM instances
- Don't create a POM for a component with only 1-2 spec files — use inline helpers instead
