import { TransactionDetailData } from '@src/components';
import { Schema } from '@src/types/models/api/utils';
import { components } from '@src/types/models/openapi/TransactionsResource';
import { Core } from '../../../core';
import { PaginationProps, WithPaginationLimitSelection } from '../../internal/Pagination/types';
import UIElement from '../UIElement';
import { IBalanceAccountBase, ITransaction } from '../../../types';
import AdyenFPError from '@src/core/Errors/AdyenFPError';

export const enum TransactionFilterParam {
    CATEGORIES = 'categories',
    CURRENCIES = 'currencies',
    STATUSES = 'statuses',
    CREATED_SINCE = 'createdSince',
    CREATED_UNTIL = 'createdUntil',
    MIN_AMOUNT = 'minAmount',
    MAX_AMOUNT = 'maxAmount',
}

export type OnSelection = (selection: { id: string; showModal: () => void }) => any;

export interface TransactionsComponentProps {
    name?: string;
    elementRef?: UIElement<TransactionsComponentProps> | null;
    onTransactionSelected?: OnSelection;
    onFiltersChanged?: (filters: { [P in TransactionFilterParam]?: string }) => any;
    onLimitChanged?: (limit: number) => any;
    preferredLimit?: number;
    allowLimitSelection?: boolean;
    showDetails?: boolean;
    core: Core;
}
export interface TransactionListProps extends WithPaginationLimitSelection<PaginationProps> {
    transactions: ITransaction[] | undefined;
    onTransactionSelected?: OnSelection;
    showPagination: boolean;
    loading: boolean;
    showDetails?: boolean;
    error: AdyenFPError | undefined;
    onContactSupport?: () => void;
    balanceAccounts: IBalanceAccountBase[] | undefined;
    availableCurrencies: ITransaction['amount']['currency'][] | undefined;
}

export interface BalanceAccountProps {
    balanceAccountDescription?: string;
}

export type DetailsOptions = {
    transaction?: boolean;
};
export type SelectedDetail = {
    data: string | TransactionDetailData;
};

export type CategoryProp = {
    value: Schema<components, 'SingleTransaction'>['category'];
};
