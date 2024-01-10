import { PaginationProps, WithPaginationLimitSelection } from '../../internal/Pagination/types';
import UIElement from '../UIElement';
import { ITransaction } from '@src/types';
import { TranslationKey } from '@src/core/Localization/types';
import { ModalSize } from '@src/components/internal/Modal/types';

export const enum TransactionFilterParam {
    ACCOUNT_HOLDER = 'accountHolderId',
    BALANCE_ACCOUNT = 'balanceAccountId',
    BALANCE_PLATFORM_ID = 'balancePlatform',
    CREATED_SINCE = 'createdSince',
    CREATED_UNTIL = 'createdUntil',
}

export type OnSelection = (selection: { id: string; showModal: () => void }) => any;

export interface TransactionsComponentProps {
    name?: string;
    balancePlatformId?: string;
    elementRef?: UIElement<TransactionsComponentProps> | null;
    onAccountSelected?: OnSelection;
    onBalanceAccountSelected?: OnSelection;
    onTransactionSelected?: OnSelection;
    onFiltersChanged?: (filters: { [P in TransactionFilterParam]?: string }) => any;
    onLimitChanged?: (limit: number) => any;
    preferredLimit?: number;
    allowLimitSelection?: boolean;
    showDetails?: DetailsOptions;
}
export interface TransactionListProps extends WithPaginationLimitSelection<PaginationProps> {
    transactions: ITransaction[];
    onTransactionSelected?: OnSelection;
    onBalanceAccountSelected?: OnSelection;
    onAccountSelected?: OnSelection;
    showPagination: boolean;
    loading: boolean;
    showDetails?: DetailsOptions;
}

export type DetailsOptions = {
    transaction?: boolean;
    balanceAccount?: boolean;
    accountHolder?: boolean;
};
export type SelectedDetail = {
    title: TranslationKey;
    selection: { type: 'accountHolder' | 'transaction' | 'balanceAccount'; detail: string };
    modalSize?: ModalSize;
};
