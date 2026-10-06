import type { UIElementProps, DataCustomizationObject, CustomDataRetrieved } from '@integration-components/types';
import type { PaginationProps } from '@integration-components/utils';
import type { IDisputeListItem, IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';
import type { DisputeDetailsCustomization } from '../DisputeManagement';
import { DISPUTES_PAGE_LIMITS, FIELD_KEYS } from './constants';

export type DisputeStatusGroup = IDisputeStatusGroup;
export type DisputesPageLimit = (typeof DISPUTES_PAGE_LIMITS)[number];
export type DisputesTableFields = keyof typeof FIELD_KEYS;
export type DisputesListCustomization = DataCustomizationObject<DisputesTableFields, IDisputeListItem[], CustomDataRetrieved[]>;

export type DisputesOverviewFilters = {
    balanceAccountId?: string;
    statusGroup: DisputeStatusGroup;
    schemeCodes?: string;
    createdSince?: string;
    createdUntil?: string;
    /** @deprecated This field is not emitted. Use statusGroup instead. */
    disputeType?: string;
    /** @deprecated This field is not emitted. Use statusGroup instead. */
    statuses?: string;
};

export interface DisputesOverviewProps extends UIElementProps, PaginationProps<DisputesPageLimit> {
    balanceAccountId?: string;
    onFiltersChanged?: (filters: DisputesOverviewFilters) => any;
    onRecordSelection?: (selection: { id: string; showModal: () => void }) => any;
    dataCustomization?: {
        list?: DisputesListCustomization;
        details?: DisputeDetailsCustomization;
    };
    showDetails?: boolean;
}

export type DisputeOverviewComponentProps = DisputesOverviewProps;
