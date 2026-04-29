// Framework-agnostic constants shared by every ReportsOverview render layer
// (preact today, vue once feature/add-reports-vue-component lands). Each
// layer's local `constants.ts` re-exports from here, optionally aliasing to
// the historical short name (`BASE_CLASS`) to avoid touching call sites.
//
// Pagination defaults (DEFAULT_PAGE_LIMIT / LIMIT_OPTIONS) are intentionally
// not hoisted: preact pulls them from the shared internal Pagination
// constants while vue uses a wider set ([5, 10, 20, 50]) — confirm the
// intended product behaviour before unifying.

export const REPORTS_OVERVIEW_CLASS = 'adyen-pe-reports-overview';
export const REPORTS_OVERVIEW_CONTAINER_CLASS = 'adyen-pe-reports-overview-container';
export const REPORTS_TABLE_CLASS = 'adyen-pe-reports-table';

export const EARLIEST_PAYOUT_SINCE_DATE = new Date('2024-04-16T00:00:00.000Z').toString();

export const REPORTS_DOWNLOAD_DISABLED_TIMEOUT = 1000;
