import { ITransaction } from '../../../../../types';
import { TranslationKey } from '../../../../../translations';
import * as RangePreset from '../../../../internal/Calendar/calendar/timerange/presets';

export type TransactionDateRange = keyof typeof TRANSACTION_DATE_RANGES | typeof TRANSACTION_DATE_RANGE_CUSTOM;

export const TRANSACTION_DATE_RANGE_CUSTOM = 'common.filters.types.date.rangeSelect.options.custom' satisfies TranslationKey;
export const TRANSACTION_DATE_RANGE_DEFAULT = 'common.filters.types.date.rangeSelect.options.last30Days' satisfies TransactionDateRange;
export const TRANSACTION_DATE_RANGE_MAX_MONTHS = 24;

export const TRANSACTION_DATE_RANGES = Object.freeze({
    ['common.filters.types.date.rangeSelect.options.last7Days' satisfies TranslationKey]: RangePreset.lastNDays(7),
    ['common.filters.types.date.rangeSelect.options.last30Days' satisfies TranslationKey]: RangePreset.lastNDays(30),
    ['common.filters.types.date.rangeSelect.options.thisWeek' satisfies TranslationKey]: RangePreset.thisWeek(),
    ['common.filters.types.date.rangeSelect.options.lastWeek' satisfies TranslationKey]: RangePreset.lastWeek(),
    ['common.filters.types.date.rangeSelect.options.thisMonth' satisfies TranslationKey]: RangePreset.thisMonth(),
    ['common.filters.types.date.rangeSelect.options.lastMonth' satisfies TranslationKey]: RangePreset.lastMonth(),
    ['common.filters.types.date.rangeSelect.options.yearToDate' satisfies TranslationKey]: RangePreset.yearToDate(),
} as const);

export const TRANSACTION_CATEGORIES: readonly ITransaction['category'][] = [
    'ATM',
    'Capital',
    'Chargeback',
    'Correction',
    // 'Fee', /* removed in V2 */
    'Payment',
    'Refund',
    'Transfer',
    'Other',
] as const;

export const TRANSACTION_STATUSES: readonly ITransaction['status'][] = ['Booked', 'Pending', 'Reversed'] as const;
