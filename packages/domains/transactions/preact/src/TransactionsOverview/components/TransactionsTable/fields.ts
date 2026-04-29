// Remove status column temporarily
export const TRANSACTION_FIELDS = ['createdAt', 'paymentMethod', 'transactionType', 'currency', 'netAmount', 'grossAmount'] as const;
export type TransactionsTableCols = (typeof TRANSACTION_FIELDS)[number];

// Mapping used to remap custom column (field) configurations to a different field name
// For example: `amount` field (V1) is remapped to `netAmount` field (V2).
export const TRANSACTION_FIELDS_REMAPS: Readonly<Record<string, TransactionsTableCols>> = {
    amount: 'netAmount',
} as const;
