import { PaginationProps, WithPaginationLimit, WithPaginationLimitSelection } from '../../internal/Pagination/types';
import UIElement from '../UIElement';
import { ITransaction } from '@src/types';
import { TranslationKey } from '@src/core/Localization/types';
import { ModalSize } from '@src/components/internal/Modal/types';

export const enum TransactionFilterParam {
    ACCOUNT_HOLDER = 'accountHolderId',
    BALANCE_ACCOUNT = 'balanceAccountId',
    CREATED_SINCE = 'createdSince',
    CREATED_UNTIL = 'createdUntil',
    BALANCE_PLATFORM_ID = 'balancePlatform',
}

export type OnSelection = (selection: { id: string; showModal: () => void }) => void;
export interface TransactionsComponentProps {
    elementRef?: UIElement<TransactionsComponentProps> | null;
    onFilterChange?: (
        filters: { [P in TransactionFilterParam]?: string } & Required<WithPaginationLimit<{}>>,
        ref?: UIElement<TransactionsComponentProps> | null
    ) => void;
    onTransactionSelected?: OnSelection;
    onBalanceAccountSelected?: OnSelection;
    onAccountSelected?: OnSelection;
    showDetails?: DetailsOptions;
    onUpdateTransactions?: (pageRequestParams: any, ref?: UIElement<TransactionsComponentProps> | null) => void;
    name?: string;
    balancePlatformId?: string;
    initialListLimit?: number;
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
