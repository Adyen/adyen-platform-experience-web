import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import type { PaginationProps, WithPaginationLimitSelection } from '../../../../internal/Pagination/types';
import type { IBalanceAccountBase, ITransaction } from '../../../../../types';
import type { OnTransactionSelection } from '../../../../types';

export interface TransactionTableProps extends WithPaginationLimitSelection<PaginationProps> {
    availableCurrencies: ITransaction['amount']['currency'][] | undefined;
    balanceAccounts: IBalanceAccountBase[] | undefined;
    loading: boolean;
    error: AdyenPlatformExperienceError | undefined;
    hasMultipleCurrencies: boolean;
    onContactSupport?: () => void;
    onRowClick: (value: ITransaction) => void;
    onTransactionSelected?: OnTransactionSelection;
    showDetails?: boolean;
    showPagination: boolean;
    transactions: ITransaction[] | undefined;
}
