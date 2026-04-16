import { UIElementProps, DataCustomizationObject, CustomDataRetrieved } from '../../types';
import { IDisputeListItem } from '../../../types/api/models/disputes';
import { StringWithAutocompleteOptions } from '../../../utils/types';
import { DisputeDetailsCustomization } from '../DisputeManagement/types';
import { DisputesTableFields as TableFields } from './components/DisputesTable/DisputesTable';

export type DisputesTableFields = StringWithAutocompleteOptions<TableFields>;

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
        details?: DisputeDetailsCustomization;
    };
    showDetails?: boolean;
}

export type DisputeOverviewComponentProps = DisputesOverviewProps;
