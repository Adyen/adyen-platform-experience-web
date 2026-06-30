import type { UIElementProps, DataCustomizationObject, CustomDataRetrieved } from '@integration-components/types';
import type { IDisputeListItem, IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';
import type { DisputeDetailsCustomization } from '../DisputeManagement';
import { FIELD_KEYS } from './constants';

export type DisputeStatusGroup = IDisputeStatusGroup;
export type DisputesTableFields = keyof typeof FIELD_KEYS;
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
