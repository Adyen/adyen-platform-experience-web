import { UIElementProps, DataCustomizationObject, CustomDataRetrieved } from '../../types';
import { IDisputeListItem } from '../../../types/api/models/disputes';
import { StringWithAutocompleteOptions } from '../../../utils/types';

type DisputesTableCols = 'createdAt' | 'disputeType' | 'status' | 'paymentMethod' | 'transactionId';

export type DisputesTableFields = StringWithAutocompleteOptions<DisputesTableCols>;

export type DisputeStatusGroup = 'CHARGEBACKS' | 'FRAUD_ALERTS' | 'ONGOING_AND_CLOSED';

export type DisputesListCustomization = DataCustomizationObject<DisputesTableFields, IDisputeListItem[], CustomDataRetrieved[]>;

export interface DisputesOverviewProps extends UIElementProps {
    allowLimitSelection?: boolean;
    balanceAccountId?: string;
    onFiltersChanged?: (filters: {
        balanceAccountId?: string;
        disputeType?: string;
        statuses?: string;
        createdSince?: string;
        createdUntil?: string;
    }) => any;
    preferredLimit?: 10 | 20;
    onRecordSelection?: (selection: { id: string; showModal: () => void }) => any;
    dataCustomization?: {
        list?: DisputesListCustomization;
        details?: never;
    };
    showDetails?: boolean;
}

export type DisputeOverviewComponentProps = DisputesOverviewProps;
