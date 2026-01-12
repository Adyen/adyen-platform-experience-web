import AdyenPlatformExperienceError from '../../../../../../core/Errors/AdyenPlatformExperienceError';
import type { PaginationProps, WithPaginationLimitSelection } from '../../../../../internal/Pagination/types';
import type { IAmount, IBalanceAccountBase, ITransaction } from '../../../../../../types';
import { StringWithAutocompleteOptions } from '../../../../../../utils/types';
import { TransactionsTableCols } from './TransactionsTable';
import { CustomColumn } from '../../../../../types';

export type TransactionsTableFields = StringWithAutocompleteOptions<TransactionsTableCols>;

export interface TransactionTableProps extends WithPaginationLimitSelection<PaginationProps> {
    activeBalanceAccount?: IBalanceAccountBase;
    availableCurrencies: IAmount['currency'][] | undefined;
    loading: boolean;
    error: AdyenPlatformExperienceError | undefined;
    hasMultipleCurrencies: boolean;
    onContactSupport?: () => void;
    onRowClick: (value: ITransaction) => void;
    showDetails?: boolean;
    showPagination: boolean;
    transactions: ITransaction[] | undefined;
    customColumns?: CustomColumn<TransactionsTableFields>[];
}
