export const TRANSACTION_FIELDS = ['createdAt', 'paymentMethod', 'transactionType', 'currency', 'netAmount', 'grossAmount'] as const;
export type TransactionsTableCols = (typeof TRANSACTION_FIELDS)[number];

export const TRANSACTION_FIELDS_REMAPS: Readonly<Record<string, TransactionsTableCols>> = {
    amount: 'netAmount',
} as const;
