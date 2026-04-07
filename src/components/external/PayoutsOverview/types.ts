import { UIElementProps, DataCustomizationObject, CustomDataRetrieved } from '../../types';
import { IPayout, IPayoutDetails } from '../../../types';
import { StringWithAutocompleteOptions } from '../../../utils/types';

type PayoutsTableCols = 'createdAt' | 'payoutType' | 'netPayoutAmount' | 'fundingSource' | 'summary';

export type PayoutsTableFields = StringWithAutocompleteOptions<PayoutsTableCols>;

export type PayoutsListCustomization = DataCustomizationObject<PayoutsTableFields, IPayout[], CustomDataRetrieved[]>;

export interface PayoutsOverviewProps extends UIElementProps {
    allowLimitSelection?: boolean;
    balanceAccountId?: string;
    onFiltersChanged?: (filters: { balanceAccountId?: string; createdSince?: string; createdUntil?: string }) => any;
    preferredLimit?: 10 | 20;
    showDetails?: boolean;
    onRecordSelection?: (selection: { balanceAccountId: string; date: string; showModal: () => void }) => any;
    dataCustomization?: {
        list?: PayoutsListCustomization;
        details?: never;
    };
}

export type PayoutsOverviewComponentProps = PayoutsOverviewProps;

export interface PayoutsOverviewConfig {}
