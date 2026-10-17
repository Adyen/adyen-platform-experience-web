import type { CustomDataRetrieved, DataCustomizationObject, IPayout, WithBalanceAccountId } from '@integration-components/types';
import type { PaginationProps } from '@integration-components/utils';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import type { PayoutDetailsCustomization } from '../PayoutDetails/types';

type PayoutsTableCols = 'createdAt' | 'payoutType' | 'netPayoutAmount' | 'fundingSource' | 'summary';

export type PayoutsTableFields = StringWithAutocompleteOptions<PayoutsTableCols>;

export type PayoutsDataGridCustomization = DataCustomizationObject<PayoutsTableFields, IPayout[], CustomDataRetrieved[]>;

export interface PayoutsOverviewProps extends PaginationProps, WithBalanceAccountId {
    onRecordSelection?: (selection: { id: string; date: string; showDetails: () => void }) => void;
    dataCustomization?: {
        dataGrid?: PayoutsDataGridCustomization;
        details?: PayoutDetailsCustomization;
    };
}
