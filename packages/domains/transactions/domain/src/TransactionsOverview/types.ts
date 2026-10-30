import type { CustomDataRetrieved, DataCustomizationObject, DataGridCustomColumnConfig, ITransaction } from '@integration-components/types';
import type { TransactionDetailsCustomization } from '../TransactionDetails/types';
import type { PaginationProps } from '@integration-components/utils';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import type { TransactionsTableCols } from './fields';

export type TransactionsTableFields = StringWithAutocompleteOptions<TransactionsTableCols>;
export type TransactionsCustomColumn = DataGridCustomColumnConfig<TransactionsTableFields>;
export type TransactionsDataGridCustomization = DataCustomizationObject<TransactionsTableFields, ITransaction[], CustomDataRetrieved[]>;

export interface TransactionsOverviewProps extends PaginationProps {
    onRecordSelection?: (selection: { id: string; showDetails: () => void }) => void;
    dataCustomization?: {
        dataGrid?: TransactionsDataGridCustomization;
        details?: TransactionDetailsCustomization;
    };
}
