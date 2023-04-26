import { CurrencyCode } from '../../utils/constants/currency-codes';
import { PageNeighbour, PaginationProps } from '../internal/Pagination/types';
import UIElement from '../UIElement';

export const enum TransactionFilterParam {
    ACCOUNT_HOLDER = 'accountHolderId',
    BALANCE_ACCOUNT = 'balanceAccountId',
    CREATED_SINCE = 'createdSince',
    CREATED_UNTIL = 'createdUntil',
}

export interface Transaction {
    accountHolderId: string;
    amount: {
        currency: CurrencyCode;
        value: number;
    };
    balanceAccountId: string;
    balancePlatform: string;
    bookingDate: string;
    category: string;
    counterparty: {
        balanceAccountId: string;
    };
    createdAt: string;
    description: string;
    id: string;
    instructedAmount: {
        currency: CurrencyCode;
        value: number;
    };
    reference: string;
    referenceForBeneficiary: string;
    status: string;
    transferId: string;
    type: string;
    valueDate: string;
}
type OnSelection = (selection: { id: string }) => void;
export interface TransactionsPageProps {
    transactions: {
        data: Transaction[];
        _links?: {
            [K in PageNeighbour]?: { href: string };
        };
    };
    elementRef: UIElement | null;
    onFilterChange?: (filters: { [p: string]: string }, ref: UIElement | null) => void;
    onTransactionSelected?: OnSelection;
    onBalanceAccountSelected?: OnSelection;
    onAccountSelected?: OnSelection;
}
export interface TransactionListProps extends PaginationProps {
    transactions: Transaction[];
    onTransactionSelected?: OnSelection;
    onBalanceAccountSelected?: OnSelection;
    onAccountSelected?: OnSelection;
    showPagination: boolean;
    loading: boolean;
}
