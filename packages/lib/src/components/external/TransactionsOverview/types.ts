import { TransactionDetailData } from '@src/components';
import { Core } from '../../../core';
import UIElement from '../UIElement';

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
    preferredLimit?: 10 | 20;
    allowLimitSelection?: boolean;
    showDetails?: boolean;
    core: Core;
    balanceAccountId?: string;
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
