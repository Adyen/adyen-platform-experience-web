# ReportsOverview Integration Tests Plan

## Context

ReportsOverview is the only external component with **zero integration test coverage**. Contract tests exist (`tests/contract/v1/reports/reports.spec.ts`) but no Storybook-driven integration tests.

This plan covers 5 verified User Stories from the PIE Product backlog:

| Story   | Summary                    | Acceptance Criteria                                                       |
| ------- | -------------------------- | ------------------------------------------------------------------------- |
| IEX-656 | View all balance accounts  | On load, show BA dropdown listing all accounts (description + number)     |
| IEX-655 | Select one balance account | User can select exactly one BA from the dropdown                          |
| IEX-654 | Select time period         | User can select a start date; reports available from 16 April 2024 onward |
| IEX-657 | See reports list           | Table with Date, Report name, Download button for selected filters        |
| IEX-658 | Download a report          | Press download on a row; CSV downloads; error message on failure          |

## Component Features

From `src/components/external/ReportsOverview/`:

- **Title & subtitle** via i18n keys
- **Balance account filter** — `BalanceAccountSelector` in FilterBar
- **Date range filter** — `DateFilter` with presets, custom selection, reset
- **Data table** — Columns: `createdAt`, `reportType`, `reportFile` (download button)
- **Responsive columns** — `dateAndReportType` on mobile; separate columns on desktop
- **Download** — `DownloadButton` per row, calls `/reports/download`. Error alerts for 429/500.
- **Pagination** — Cursor-based, configurable limit (10 or 20)
- **Empty state** — `reports.overview.errors.listEmpty`
- **Error state** — `reports.overview.errors.listUnavailable`
- **Data customization** — Custom columns via `dataCustomization.list.fields`
- **Callbacks** — `onFiltersChanged`, `onRecordSelection`
- **No analytics events** — analytics testing not needed

## Phase 1 — Mock Handler Variants

**File**: `mocks/mock-server/reports.ts`

Add `REPORTS_OVERVIEW_HANDLERS` export after the existing `reportsMock` array:

```typescript
import { BALANCE_ACCOUNTS_SINGLE } from '../mock-data';

const mockEndpoints = endpoints();

export const REPORTS_OVERVIEW_HANDLERS = {
    singleBalanceAccount: {
        handlers: [
            http.get(mockEndpoints.balanceAccounts, () => {
                return HttpResponse.json({ data: BALANCE_ACCOUNTS_SINGLE });
            }),
        ],
    },
    emptyList: {
        handlers: [
            http.get(REPORTS, () => {
                return HttpResponse.json({ data: [], _links: {} });
            }),
        ],
    },
    errorList: {
        handlers: [
            http.get(REPORTS, () => {
                return HttpResponse.error();
            }),
        ],
    },
    downloadError: {
        handlers: [
            http.get(DOWNLOAD, () => {
                return new HttpResponse(
                    JSON.stringify({
                        type: 'https://docs.adyen.com/errors/forbidden',
                        errorCode: '999_429_001',
                        title: 'Forbidden',
                        detail: 'Too many download requests',
                        status: 429,
                    }),
                    { status: 429, headers: { 'Content-Type': 'application/json' } }
                );
            }),
        ],
    },
};
```

## Phase 2 — New Mocked Stories

**File**: `stories/mocked/reportsOverview.stories.tsx`

Add 4 story exports (existing: `Default`, `DataCustomization`):

| Story Export           | MSW Override                                     | Computed Story ID                                         |
| ---------------------- | ------------------------------------------------ | --------------------------------------------------------- |
| `SingleBalanceAccount` | `REPORTS_OVERVIEW_HANDLERS.singleBalanceAccount` | `mocked-reports-reports-overview--single-balance-account` |
| `EmptyList`            | `REPORTS_OVERVIEW_HANDLERS.emptyList`            | `mocked-reports-reports-overview--empty-list`             |
| `ErrorList`            | `REPORTS_OVERVIEW_HANDLERS.errorList`            | `mocked-reports-reports-overview--error-list`             |
| `DownloadError`        | `REPORTS_OVERVIEW_HANDLERS.downloadError`        | `mocked-reports-reports-overview--download-error`         |

```typescript
import { REPORTS_OVERVIEW_HANDLERS } from '../../mocks/mock-server/reports';

export const SingleBalanceAccount: ElementStory<typeof ReportsOverview> = {
    name: 'Single balance account',
    args: { mockedApi: true },
    parameters: { msw: { ...REPORTS_OVERVIEW_HANDLERS.singleBalanceAccount } },
};

export const EmptyList: ElementStory<typeof ReportsOverview> = {
    name: 'Empty list',
    args: { mockedApi: true },
    parameters: { msw: { ...REPORTS_OVERVIEW_HANDLERS.emptyList } },
};

export const ErrorList: ElementStory<typeof ReportsOverview> = {
    name: 'Error - List',
    args: { mockedApi: true },
    parameters: { msw: { ...REPORTS_OVERVIEW_HANDLERS.errorList } },
};

export const DownloadError: ElementStory<typeof ReportsOverview> = {
    name: 'Download error',
    args: { mockedApi: true },
    parameters: { msw: { ...REPORTS_OVERVIEW_HANDLERS.downloadError } },
};
```

## Phase 3 — Integration Test Specs

### File structure

```
tests/integration/components/reportsOverview/
├── default.spec.ts              # IEX-656, IEX-655, IEX-657, IEX-654
├── downloadError.spec.ts        # IEX-658 (fail state)
├── emptyList.spec.ts
├── errorList.spec.ts
├── singleBalanceAccount.spec.ts
└── dataCustomization.spec.ts
```

---

### `default.spec.ts`

**Story**: `mocked-reports-reports-overview--default`

Uses `setTime(page)` in `beforeEach` (component renders dates).

#### `test.describe('Render')` — IEX-657

| Test                                     | Assertion                                                        |
| ---------------------------------------- | ---------------------------------------------------------------- |
| should render the component title        | Title text visible (`reports.overview.title`)                    |
| should render table with correct columns | Column headers: Date, Report type, Download (check count + text) |
| should render report rows                | `toHaveCount` on rows (mock data has 20 items per page)          |
| should render download button per row    | Each row has a `.adyen-pe-download` button                       |
| should render pagination controls        | Next/prev buttons visible                                        |

#### `test.describe('Filter: Balance account')` — IEX-656 + IEX-655

| Test                                                         | Assertion                                                                   |
| ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| should show balance account selector on load                 | Filter button visible with BA name                                          |
| should open selector dialog                                  | Click filter → dialog visible with `getByRole('option')`                    |
| should list all balance accounts with description and number | Options count matches mock data (2 BAs); each option shows description text |
| should select a balance account and reload table             | `selectFirstUnselectedBalanceAccount` → dialog closes → table reloads       |
| should close selector by clicking outside                    | `clickOutsideDialog` → dialog hidden                                        |

#### `test.describe('Filter: Date range')` — IEX-654

| Test                             | Assertion                                     |
| -------------------------------- | --------------------------------------------- |
| should show date filter          | Date filter button visible                    |
| should open date picker dialog   | Click → dialog visible                        |
| should apply a preset date range | Select preset → dialog closes → table reloads |
| should reset date filter         | Reset button → filter returns to default      |

---

### `downloadError.spec.ts`

**Story**: `mocked-reports-reports-overview--download-error`

#### `test.describe('Download error')` — IEX-658

| Test                                        | Assertion                                                      |
| ------------------------------------------- | -------------------------------------------------------------- |
| should show error alert on download failure | Click `.adyen-pe-download` → `getByRole('alert')` visible      |
| should show correct error title             | Alert contains `reports.overview.errors.download` text         |
| should show correct error description       | Alert contains `reports.overview.errors.tooManyDownloads` text |

---

### `emptyList.spec.ts`

**Story**: `mocked-reports-reports-overview--empty-list`

#### `test.describe('Empty state')`

| Test                               | Assertion                                        |
| ---------------------------------- | ------------------------------------------------ |
| should show empty state message    | `reports.overview.errors.listEmpty` text visible |
| should show update filters hint    | `common.errors.updateFilters` text visible       |
| should still render column headers | Column headers present (Date, Report type)       |

---

### `errorList.spec.ts`

**Story**: `mocked-reports-reports-overview--error-list`

#### `test.describe('Error state')`

| Test                      | Assertion                                                                              |
| ------------------------- | -------------------------------------------------------------------------------------- |
| should show error message | `reports.overview.errors.listUnavailable` text visible or `getByRole('alert')` visible |

---

### `singleBalanceAccount.spec.ts`

**Story**: `mocked-reports-reports-overview--single-balance-account`

#### `test.describe('Single balance account')`

| Test                                 | Assertion                    |
| ------------------------------------ | ---------------------------- |
| should hide balance account selector | BA filter button NOT visible |
| should render table with data        | Table visible with rows      |

---

### `dataCustomization.spec.ts`

**Story**: `mocked-reports-reports-overview--data-customization`

#### `test.describe('Data customization')`

| Test                                             | Assertion                                          |
| ------------------------------------------------ | -------------------------------------------------- |
| should render custom columns                     | `_summary` and `_sendEmail` column headers visible |
| should hide reportType column                    | `reportType` column header NOT visible             |
| should still render reportFile (download) column | Download column present                            |
| should render 5 rows (custom mock data)          | `toHaveCount(5)` on data rows                      |

## Phase 4 — Verification

1. Build Storybook with new stories: `pnpm run build-storybook`
2. Run all new tests: `pnpm run test:integration -- --grep "reportsOverview"`
3. Burn-in for flakiness: `pnpm run test:integration -- --grep "reportsOverview" --repeat-each=5`
4. If flaky, debug with trace: `pnpm run test:integration -- --grep "{testName}" --trace on`

## User Story Coverage Matrix

| User Story                   | Spec File               | Test Describe           |
| ---------------------------- | ----------------------- | ----------------------- |
| IEX-656 (view all BAs)       | `default.spec.ts`       | Filter: Balance account |
| IEX-655 (select one BA)      | `default.spec.ts`       | Filter: Balance account |
| IEX-654 (select time period) | `default.spec.ts`       | Filter: Date range      |
| IEX-657 (see reports list)   | `default.spec.ts`       | Render                  |
| IEX-658 (download / error)   | `downloadError.spec.ts` | Download error          |
