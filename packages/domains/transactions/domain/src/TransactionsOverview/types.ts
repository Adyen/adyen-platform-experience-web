import type {
    CustomDataRetrieved,
    DataCustomizationObject,
    DataGridCustomColumnConfig,
    IAmount,
    ITransaction,
    ITransactionCategory,
    ITransactionStatus,
} from '@integration-components/types';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import type { TransactionsTableCols } from './fields';

export interface TransactionsFilters {
    balanceAccountId?: string;
    categories: readonly ITransactionCategory[];
    statuses: readonly ITransactionStatus[];
    currencies: readonly IAmount['currency'][];
    createdSince: string;
    createdUntil: string;
    paymentPspReference?: string;
}

export type TransactionsTableFields = StringWithAutocompleteOptions<TransactionsTableCols>;
export type TransactionsCustomColumn = DataGridCustomColumnConfig<TransactionsTableFields>;
export type TransactionsListCustomization = DataCustomizationObject<TransactionsTableFields, ITransaction[], CustomDataRetrieved[]>;
