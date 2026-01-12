import { TranslationKey } from '../../../../translations';
import { ITransaction, ITransactionCategory, ITransactionStatus } from '../../../../types';
import { TransactionsDateRange, TransactionsFilters, TransactionsView } from './types';
import * as RangePreset from '../../../internal/Calendar/calendar/timerange/presets';

const ROOT_CLASS = 'adyen-pe-transactions';
export const BASE_CLASS = ROOT_CLASS + '-overview';
export const DETAILS_CLASS = ROOT_CLASS + '-details';

export const classes = {
    root: BASE_CLASS,
    rootSmall: BASE_CLASS + '--xs',
    summary: BASE_CLASS + '__summary',
    summaryItem: BASE_CLASS + '__summary-item',
    toolbar: BASE_CLASS + '__toolbar',
    details: DETAILS_CLASS,
    filterBarSmall: BASE_CLASS + '__filter-bar-small',
    totalsError: BASE_CLASS + '__totals-error',
} as const;

export const TRANSACTION_DATE_RANGES = Object.freeze({
    ['common.filters.types.date.rangeSelect.options.last7Days' satisfies TransactionsDateRange]: RangePreset.lastNDays(7),
    ['common.filters.types.date.rangeSelect.options.last30Days' satisfies TransactionsDateRange]: RangePreset.lastNDays(30),
    ['common.filters.types.date.rangeSelect.options.thisWeek' satisfies TransactionsDateRange]: RangePreset.thisWeek(),
    ['common.filters.types.date.rangeSelect.options.lastWeek' satisfies TransactionsDateRange]: RangePreset.lastWeek(),
    ['common.filters.types.date.rangeSelect.options.thisMonth' satisfies TransactionsDateRange]: RangePreset.thisMonth(),
    ['common.filters.types.date.rangeSelect.options.lastMonth' satisfies TransactionsDateRange]: RangePreset.lastMonth(),
    ['common.filters.types.date.rangeSelect.options.yearToDate' satisfies TransactionsDateRange]: RangePreset.yearToDate(),
} as const);

export const TRANSACTION_DATE_RANGE_CUSTOM = 'common.filters.types.date.rangeSelect.options.custom' satisfies TransactionsDateRange;
export const TRANSACTION_DATE_RANGE_DEFAULT = 'common.filters.types.date.rangeSelect.options.last30Days' satisfies TransactionsDateRange;
export const TRANSACTION_DATE_RANGE_DEFAULT_TIMESTAMPS = TRANSACTION_DATE_RANGES[TRANSACTION_DATE_RANGE_DEFAULT];
export const TRANSACTION_DATE_RANGE_MAX_YEARS = 2;

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

export const TRANSACTIONS_VIEW_TABS: readonly Readonly<{ id: TransactionsView; label: TranslationKey; content: null }>[] = [
    { id: TransactionsView.TRANSACTIONS, label: 'transactions.overview.views.transactions', content: null } as const,
    { id: TransactionsView.INSIGHTS, label: 'transactions.overview.views.insights', content: null } as const,
] as const;

export const INITIAL_FILTERS: Readonly<TransactionsFilters> = {
    balanceAccount: undefined,
    categories: [] as const,
    createdDate: TRANSACTION_DATE_RANGE_DEFAULT_TIMESTAMPS,
    currencies: [] as const,
    paymentPspReference: undefined,
    statuses: ['Booked'] as const,
} as const;

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

export const TRANSACTION_ANALYTICS_CATEGORY = 'Transaction component' as const;
export const TRANSACTION_ANALYTICS_SUBCATEGORY_DETAILS = 'Transaction details' as const;
export const TRANSACTION_ANALYTICS_SUBCATEGORY_INSIGHTS = 'Transactions insights' as const;
export const TRANSACTION_ANALYTICS_SUBCATEGORY_LIST = 'Transactions list' as const;
