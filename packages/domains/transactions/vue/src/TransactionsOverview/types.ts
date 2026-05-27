import type { CoreInstance } from '@integration-components/core/vue';
import type { IAmount, IBalanceAccountBase, ITransaction, ITransactionCategory, ITransactionStatus } from '@integration-components/types';
import type { CustomDataRetrieved, DataCustomizationObject, DataGridCustomColumnConfig } from '@integration-components/types';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import type { TransactionsTableCols } from '@integration-components/transactions/domain';
import type { TransactionDetailsCustomization } from '@integration-components/transactions/domain';

export type TransactionsTableFields = StringWithAutocompleteOptions<TransactionsTableCols>;
export type TransactionsCustomColumn = DataGridCustomColumnConfig<TransactionsTableFields>;
export type TransactionsListCustomization = DataCustomizationObject<TransactionsTableFields, ITransaction[], CustomDataRetrieved[]>;

export interface TransactionsFilters {
    balanceAccountId?: string;
    categories: readonly ITransactionCategory[];
    statuses: readonly ITransactionStatus[];
    currencies: readonly IAmount['currency'][];
    createdSince: string;
    createdUntil: string;
    paymentPspReference?: string;
}

export interface TransactionsOverviewExternalProps {
    core: CoreInstance;
    balanceAccountId?: string;
    allowLimitSelection?: boolean;
    preferredLimit?: number;
    hideTitle?: boolean;
    showDetails?: boolean;
    onContactSupport?: () => void;
    onFiltersChanged?: (filters: Record<string, string | undefined>) => any;
    onRecordSelection?: (selection: { id: string; showModal: () => void }) => any;
    dataCustomization?: {
        list?: TransactionsListCustomization;
        details?: TransactionDetailsCustomization;
    };
}

export interface TransactionsListResponse {
    data?: ITransaction[];
    _links?: {
        next?: { cursor: string };
        prev?: { cursor: string };
    };
}

export type { IBalanceAccountBase };
