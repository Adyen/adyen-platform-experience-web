import { ITransactionCategory, ITransactionStatus } from '../../../types';
import { TransactionsDateRange, TransactionsFilters } from './types';
import * as RangePreset from '../../internal/Calendar/calendar/timerange/presets';

const ROOT_CLASS = 'adyen-pe-transactions';
export const BASE_CLASS = ROOT_CLASS + '-overview';
export const DETAILS_CLASS = ROOT_CLASS + '-details';

export const classes = {
    root: BASE_CLASS,
    rootSmall: BASE_CLASS + '--xs',
    summary: BASE_CLASS + '__summary',
    summaryItem: BASE_CLASS + '__summary-item',
    details: DETAILS_CLASS,
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

export const INITIAL_FILTERS: Readonly<TransactionsFilters> = {
    balanceAccount: undefined,
    categories: [] as const,
    createdDate: TRANSACTION_DATE_RANGE_DEFAULT_TIMESTAMPS,
    currencies: [] as const,
    pspReference: undefined,
    statuses: ['Booked'] as const,
} as const;
