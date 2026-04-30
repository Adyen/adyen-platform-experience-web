import { AdyenPlatformExperienceError } from '@integration-components/core';
import type { PaginationProps, WithPaginationLimitSelection } from '@integration-components/ui-primitives-preact/Pagination/types';
import type { IAmount, IBalanceAccountBase, ITransaction } from '@integration-components/types';
import { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import { TransactionsTableCols } from './fields';
import { CustomColumn } from '@integration-components/types';

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
