import { ITransaction } from '../../../../../../types';
import { TransactionsOverviewMultiSelectionFilterParam } from './types';
import { TransactionFilterParam } from '../../../types';

export const TRANSACTIONS_OVERVIEW_MULTI_SELECTION_FILTERS = [
    TransactionFilterParam.CURRENCIES,
    TransactionFilterParam.CATEGORIES,
    TransactionFilterParam.STATUSES,
] as const;

export const DEFAULT_TRANSACTIONS_OVERVIEW_MULTI_SELECTION_FILTER_PARAMS = Object.freeze(
    Object.fromEntries(TRANSACTIONS_OVERVIEW_MULTI_SELECTION_FILTERS.map(param => [param, '']))
) as Readonly<{ [P in TransactionsOverviewMultiSelectionFilterParam]: string }>;

export const TRANSACTION_CATEGORIES: readonly ITransaction['category'][] = [
    'ATM',
    'Capital',
    'Chargeback',
    'Correction',
    'Fee',
    'Payment',
    'Refund',
    'Transfer',
    'Other',
] as const;

export const TRANSACTION_STATUSES: readonly ITransaction['status'][] = ['Booked', 'Pending', 'Reversed'] as const;
