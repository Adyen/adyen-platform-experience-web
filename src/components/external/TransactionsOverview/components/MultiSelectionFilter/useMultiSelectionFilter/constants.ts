import { FilterParam } from '../../../../../types';
import type { ITransactionCategory, ITransactionStatus } from '../../../../../../types';
import type { TransactionsOverviewMultiSelectionFilterParam } from './types';

export const TRANSACTIONS_OVERVIEW_MULTI_SELECTION_FILTERS = [FilterParam.CURRENCIES, FilterParam.CATEGORIES, FilterParam.STATUSES] as const;

export const DEFAULT_TRANSACTIONS_OVERVIEW_MULTI_SELECTION_FILTER_PARAMS = Object.freeze(
    Object.fromEntries(TRANSACTIONS_OVERVIEW_MULTI_SELECTION_FILTERS.map(param => [param, '']))
) as Readonly<{ [P in TransactionsOverviewMultiSelectionFilterParam]: string }>;

export const TRANSACTION_CATEGORIES: readonly ITransactionCategory[] = [
    'ATM',
    'Capital',
    'Chargeback',
    'Correction',
    // 'Fee',
    'Payment',
    'Refund',
    'Transfer',
    'Other',
] as const;

export const TRANSACTION_STATUSES: readonly ITransactionStatus[] = ['Booked', 'Pending', 'Reversed'] as const;
