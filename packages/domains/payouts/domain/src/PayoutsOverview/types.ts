import type { CustomDataRetrieved, DataCustomizationObject, IPayout, UIElementProps } from '@integration-components/types';
import type { PaginationProps } from '@integration-components/utils';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import type { PayoutDetailsCustomization } from '../PayoutDetails/types';

type PayoutsTableCols = 'createdAt' | 'payoutType' | 'netPayoutAmount' | 'fundingSource' | 'summary';

export type PayoutsTableFields = StringWithAutocompleteOptions<PayoutsTableCols>;

export type PayoutsDataGridCustomization = DataCustomizationObject<PayoutsTableFields, IPayout[], CustomDataRetrieved[]>;

export interface PayoutsOverviewProps extends UIElementProps, PaginationProps {
    balanceAccountId?: string;
    onRecordSelection?: (selection: { balanceAccountId: string; date: string; showDetails: () => void }) => any;
    dataCustomization?: {
        dataGrid?: PayoutsDataGridCustomization;
        details?: PayoutDetailsCustomization;
    };
}

export type PayoutsOverviewComponentProps = PayoutsOverviewProps;
