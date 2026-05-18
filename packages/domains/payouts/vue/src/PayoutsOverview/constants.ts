// ── CSS class names ──

export const BASE_CLASS = 'adyen-pe-payouts-overview';
export const CONTAINER_CLASS = `${BASE_CLASS}-container`;
export const TABLE_CLASS = 'adyen-pe-payouts-table';
export const NET_PAYOUT_CLASS = `${TABLE_CLASS}__net-payout`;

// ── Domain constants ──

export const EARLIEST_PAYOUT_SINCE_DATE = new Date('2024-04-16T00:00:00.000Z').toString();

export const DEFAULT_PAGE_LIMIT = 10;
export const LIMIT_OPTIONS = [5, 10, 20, 50];

// Standard table fields used to filter custom-column keys to the unknown set.
const AMOUNT_FIELDS = ['fundsCapturedAmount', 'adjustmentAmount', 'payoutAmount'] as const;
export const PAYOUT_TABLE_FIELDS = ['createdAt', ...AMOUNT_FIELDS] as const;
export type PayoutsTableFields = (typeof PAYOUT_TABLE_FIELDS)[number];
