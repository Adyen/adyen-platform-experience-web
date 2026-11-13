export const PAYOUT_TABLE_FIELDS = ['createdAt', 'fundsCapturedAmount', 'adjustmentAmount', 'payoutAmount'] as const;
export type PayoutsTableCols = (typeof PAYOUT_TABLE_FIELDS)[number];
