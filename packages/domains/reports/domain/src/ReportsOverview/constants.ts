// Framework-agnostic constants shared by every ReportsOverview render layer
// Each layer's local `constants.ts` re-exports from here.
//
// Pagination defaults (DEFAULT_PAGE_LIMIT / LIMIT_OPTIONS) are intentionally
// not hoisted: preact pulls them from the shared internal Pagination
// constants while vue uses a wider set ([5, 10, 20, 50]) — confirm the
// intended product behaviour before unifying.

export const EARLIEST_REPORT_SINCE_DATE = '2024-04-16T00:00:00.000Z';
export const REPORTS_DOWNLOAD_DISABLED_TIMEOUT = 1000;
export const DEFAULT_PAGE_LIMIT = 10;
export const LIMIT_OPTIONS = [10, 20, 50];
export const REPORTS_TABLE_FIELDS = ['createdAt', 'dateAndReportType', 'reportType', 'reportFile'] as const;
