import { ITransaction, ITransactionCategory, ITransactionStatus } from '@integration-components/types';

export const BASE_CLASS = 'adyen-pe-transactions-overview';
export const CONTAINER_CLASS = `${BASE_CLASS}-container`;
export const TABLE_CLASS = 'adyen-pe-transactions-table';
export const AMOUNT_CLASS = `${TABLE_CLASS}__amount`;
export const PAYMENT_METHOD_CLASS = `${TABLE_CLASS}__payment-method`;
export const PAYMENT_METHOD_LOGO_CONTAINER_CLASS = `${TABLE_CLASS}__payment-method-logo-container`;
export const PAYMENT_METHOD_LOGO_CLASS = `${TABLE_CLASS}__payment-method-logo`;
export const DATE_AND_PAYMENT_METHOD_CLASS = `${TABLE_CLASS}__date-and-payment-method`;
export const DATE_METHOD_CLASS = `${TABLE_CLASS}__date-and-payment-method--date`;

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
