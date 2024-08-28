import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import type { PaginationProps, WithPaginationLimitSelection } from '../../../../internal/Pagination/types';
import type { IBalanceAccountBase, ITransaction } from '../../../../../types';

export type TransactionsTableFields = 'dateAndPaymentMethod' | 'createdAt' | 'paymentMethod' | 'transactionType' | 'amount' | (string & {});

export interface TransactionTableProps extends WithPaginationLimitSelection<PaginationProps> {
    activeBalanceAccount?: IBalanceAccountBase;
    availableCurrencies: ITransaction['amount']['currency'][] | undefined;
    loading: boolean;
    error: AdyenPlatformExperienceError | undefined;
    hasMultipleCurrencies: boolean;
    onContactSupport?: () => void;
    onRowClick: (value: ITransaction) => void;
    showDetails?: boolean;
    showPagination: boolean;
    transactions: ITransaction[] | undefined;
    customColumns?: TransactionsTableFields[];
}
