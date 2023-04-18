import { CurrencyCode } from '../../utils/constants/currency-codes';
import { PageNeighbours } from '../../hooks/usePartialRecordSet';
import UIElement from '../UIElement';

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
            [K in PageNeighbours]?: { href: string };
        };
    };
    elementRef: UIElement | null;
    onFilterChange?: (filters: { filters: { [p: string]: string } }, ref: UIElement | null) => void;
    onTransactionSelected?: OnSelection;
    onBalanceAccountSelected?: OnSelection;
    onAccountSelected?: OnSelection;
}
export interface TransactionListProps {
    transactions: {
        data: Transaction[];
    };
    onTransactionSelected?: OnSelection;
    onBalanceAccountSelected?: OnSelection;
    onAccountSelected?: OnSelection;
    showPagination: boolean;
    page: number;
    hasNextPage: boolean;
    onPageChange: (dir: PageNeighbours) => void;
    loading: boolean;
}
