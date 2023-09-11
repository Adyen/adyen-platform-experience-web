import { PaginatedResponseDataWithLinks, PaginationProps } from '../../internal/Pagination/types';
import UIElement from '../../internal/UIElement/UIElement';
import { UIElementProps } from '../../types';
import { ITransaction } from '../../../types/models/api/transactions';

export const enum TransactionFilterParam {
    ACCOUNT_HOLDER = 'accountHolderId',
    BALANCE_ACCOUNT = 'balanceAccountId',
    CREATED_SINCE = 'createdSince',
    CREATED_UNTIL = 'createdUntil',
}

type OnSelection = (selection: { id: string }) => void;
export interface TransactionsComponentProps extends UIElementProps {
    transactions: PaginatedResponseDataWithLinks<ITransaction, 'data'>;
    elementRef?: UIElement | null;
    onFilterChange?: (filters: { [p: string]: string | undefined }, ref?: UIElement | null) => void;
    onTransactionSelected?: OnSelection;
    onBalanceAccountSelected?: OnSelection;
    onAccountSelected?: OnSelection;
    onUpdateTransactions?: (pageRequestParams: any, ref?: UIElement | null) => void;
    name?: string;
}
export interface TransactionListProps extends PaginationProps {
    transactions: ITransaction[];
    onTransactionSelected?: OnSelection;
    onBalanceAccountSelected?: OnSelection;
    onAccountSelected?: OnSelection;
    showPagination: boolean;
    loading: boolean;
}
