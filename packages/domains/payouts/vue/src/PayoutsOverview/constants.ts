// ── Domain constants ──
export const EARLIEST_PAYOUT_SINCE_DATE = '2024-04-16T00:00:00.000Z';
export const DEFAULT_PAGE_LIMIT = 10;
export const LIMIT_OPTIONS = [10, 20, 50];

// Standard table fields used to filter custom-column keys to the unknown set.
const AMOUNT_FIELDS = ['fundsCapturedAmount', 'adjustmentAmount', 'payoutAmount'] as const;
export const PAYOUT_TABLE_FIELDS = ['createdAt', ...AMOUNT_FIELDS] as const;
export type PayoutsTableFields = (typeof PAYOUT_TABLE_FIELDS)[number];
