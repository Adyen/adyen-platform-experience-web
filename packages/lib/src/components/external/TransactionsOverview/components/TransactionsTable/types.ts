import { PaginationProps, WithPaginationLimitSelection } from '@src/components/internal/Pagination/types';
import { IBalanceAccountBase, ITransaction, OnSelection } from '@src/types';
import AdyenPlatformExperienceError from '@src/core/Errors/AdyenPlatformExperienceError';

export interface TransactionTableProps extends WithPaginationLimitSelection<PaginationProps> {
    availableCurrencies: ITransaction['amount']['currency'][] | undefined;
    balanceAccounts: IBalanceAccountBase[] | undefined;
    loading: boolean;
    error: AdyenPlatformExperienceError | undefined;
    hasMultipleCurrencies: boolean;
    onContactSupport?: () => void;
    onRowClick: (value: ITransaction) => void;
    onTransactionSelected?: OnSelection;
    showDetails?: boolean;
    showPagination: boolean;
    transactions: ITransaction[] | undefined;
}
