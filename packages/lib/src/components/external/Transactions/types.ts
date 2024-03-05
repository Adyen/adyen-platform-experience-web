import { Core } from '../../../core';
import { PaginationProps, WithPaginationLimitSelection } from '../../internal/Pagination/types';
import UIElement from '../UIElement';
import { ITransaction } from '../../../types';
import { TranslationKey } from '../../../core/Localization/types';
import { ModalSize } from '../../internal/Modal/types';
import AdyenFPError from '@src/core/Errors/AdyenFPError';

export const enum TransactionFilterParam {
    CATEGORIES = 'categories',
    CURRENCIES = 'currencies',
    STATUSES = 'statuses',
    CREATED_SINCE = 'createdSince',
    CREATED_UNTIL = 'createdUntil',
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
    showDetails?: DetailsOptions;
    core: Core;
}
export interface TransactionListProps extends WithPaginationLimitSelection<PaginationProps> {
    transactions: ITransaction[] | undefined;
    onTransactionSelected?: OnSelection;
    showPagination: boolean;
    loading: boolean;
    showDetails?: DetailsOptions;
    error: AdyenFPError | undefined;
    onContactSupport?: () => void;
}

export interface BalanceAccountProps {
    balanceAccountDescription?: string;
}

export type DetailsOptions = {
    transaction?: boolean;
};
export type SelectedDetail<T = string> = {
    title?: TranslationKey;
    selection: T;
    modalSize?: ModalSize;
};
