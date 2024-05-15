import { PaginationProps, WithPaginationLimitSelection } from '../../../../internal/Pagination/types';
import { IBalanceAccountBase, ITransaction, OnSelection } from '../../../../../types';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';

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
