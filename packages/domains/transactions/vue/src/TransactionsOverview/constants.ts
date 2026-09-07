import { ITransaction, ITransactionCategory, ITransactionStatus } from '@integration-components/types';

export const DEFAULT_PAGE_LIMIT = 10;
export const LIMIT_OPTIONS = [10, 20, 50];

export const TRANSACTION_STATUSES: readonly ITransactionStatus[] = ['Booked', 'Pending', 'Reversed'] as const;

export const TRANSACTION_CATEGORIES: readonly ITransactionCategory[] = [
    'ATM',
    'Capital',
    'Chargeback',
    'Correction',
    'Payment',
    'Refund',
    'Transfer',
    'Other',
] as const;

export const EXPORT_COLUMNS = [
    'id',
    'balanceAccountId',
    'createdAt',
    'status',
    'paymentMethod',
    'category',
    'paymentPspReference',
    'currency',
    'netAmount',
    'amountBeforeDeductions',
] as const satisfies (keyof ITransaction | 'currency')[];

export const DEFAULT_EXPORT_COLUMNS: readonly (typeof EXPORT_COLUMNS)[number][] = [
    'createdAt',
    'paymentMethod',
    'category',
    'currency',
    'netAmount',
    'amountBeforeDeductions',
] as const;
