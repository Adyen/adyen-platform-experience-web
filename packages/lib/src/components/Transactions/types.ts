import { CurrencyCode } from '../../utils/constants/currency-codes';
import { PaginatedResponseDataWithLinks, PaginationProps } from '../internal/Pagination/types';
import UIElement from '../UIElement';
import { UIElementProps } from '../types';
import { StatusType } from '@src/components/internal/Status/types';

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
    status: StatusType;
    transferId: string;
    type: 'fee' | 'capture' | 'leftover' | 'manualCorrection' | 'internalTransfer' | 'balanceAdjustment';
    valueDate: string;
}

type OnSelection = (selection: { id: string }) => void;
export interface TransactionsProps extends UIElementProps {
    transactions: PaginatedResponseDataWithLinks<Transaction, 'data'>;
    elementRef?: UIElement | null;
    onFilterChange?: (filters: { [p: string]: string | undefined }, ref?: UIElement | null) => void;
    onTransactionSelected?: OnSelection;
    onBalanceAccountSelected?: OnSelection;
    onAccountSelected?: OnSelection;
    onUpdateTransactions?: (pageRequestParams: any, ref?: UIElement | null) => void;
    name?: string;
}
export interface TransactionListProps extends PaginationProps {
    transactions: Transaction[];
    onTransactionSelected?: OnSelection;
    onBalanceAccountSelected?: OnSelection;
    onAccountSelected?: OnSelection;
    showPagination: boolean;
    loading: boolean;
}
