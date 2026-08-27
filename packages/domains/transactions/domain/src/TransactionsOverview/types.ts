import type { CustomDataRetrieved, DataCustomizationObject, DataGridCustomColumnConfig, ITransaction } from '@integration-components/types';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import type { TransactionsTableCols } from './fields';

export type TransactionsTableFields = StringWithAutocompleteOptions<TransactionsTableCols>;
export type TransactionsCustomColumn = DataGridCustomColumnConfig<TransactionsTableFields>;
export type TransactionsListCustomization = DataCustomizationObject<TransactionsTableFields, ITransaction[], CustomDataRetrieved[]>;
