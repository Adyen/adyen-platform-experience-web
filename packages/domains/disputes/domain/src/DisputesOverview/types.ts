import type { UIElementProps, DataCustomizationObject, CustomDataRetrieved } from '@integration-components/types';
import type { PaginationProps } from '@integration-components/utils';
import type { IDisputeListItem, IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';
import type { DisputeDetailsCustomization } from '../DisputeManagement';
import { DISPUTES_PAGE_LIMITS, FIELD_KEYS } from './constants';

export type DisputeStatusGroup = IDisputeStatusGroup;
export type DisputesPageLimit = (typeof DISPUTES_PAGE_LIMITS)[number];
export type DisputesTableFields = keyof typeof FIELD_KEYS;
export type DisputesListCustomization = DataCustomizationObject<DisputesTableFields, IDisputeListItem[], CustomDataRetrieved[]>;

export interface DisputesOverviewProps extends UIElementProps, PaginationProps<DisputesPageLimit> {
    balanceAccountId?: string;
    onRecordSelection?: (selection: { id: string; showModal: () => void }) => any;
    dataCustomization?: {
        list?: DisputesListCustomization;
        details?: DisputeDetailsCustomization;
    };
}

export type DisputeOverviewComponentProps = DisputesOverviewProps;
