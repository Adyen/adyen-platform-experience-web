import { PaginationProps } from '../../internal/Pagination/types';
import UIElement from '../UIElement';
import { UIElementProps } from '../../types';
import { ITransaction } from '../../../types/models/api/transactions';

export const enum TransactionFilterParam {
    ACCOUNT_HOLDER = 'accountHolderId',
    BALANCE_ACCOUNT = 'balanceAccountId',
    CREATED_SINCE = 'createdSince',
    CREATED_UNTIL = 'createdUntil',
    BALANCE_PLATFORM_ID = 'balancePlatform',
    LIMIT = 'limit',
}

export type OnSelection = (selection: { id: string; showModal: () => void }) => void;
export interface TransactionsComponentProps extends UIElementProps {
    elementRef?: UIElement | null;
    onFilterChange?: (filters: { [p: string]: string | undefined }, ref?: UIElement | null) => void;
    onTransactionSelected?: OnSelection;
    onBalanceAccountSelected?: OnSelection;
    onAccountSelected?: OnSelection;
    showDetails?: DetailsOptions;
    onUpdateTransactions?: (pageRequestParams: any, ref?: UIElement | null) => void;
    name?: string;
    balancePlatformId?: string;
}
export interface TransactionListProps extends PaginationProps {
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
