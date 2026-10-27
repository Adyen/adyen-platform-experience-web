import type { DataCustomizationObject, CustomDataRetrieved, WithBalanceAccountId } from '@integration-components/types';
import type { PaginationProps } from '@integration-components/utils';
import type { IDisputeListItem, IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';
import type { DisputeDetailsCustomization } from '../DisputeManagement';
import { DISPUTES_PAGE_LIMITS, FIELD_KEYS } from './constants';

export type DisputeStatusGroup = IDisputeStatusGroup;
export type DisputesPageLimit = (typeof DISPUTES_PAGE_LIMITS)[number];
export type DisputesTableFields = keyof typeof FIELD_KEYS;
export type DisputesDataGridCustomization = DataCustomizationObject<DisputesTableFields, IDisputeListItem[], CustomDataRetrieved[]>;

export interface DisputesOverviewTabsConfig {
    /** Tabs to hide. If every tab is hidden, the setting is ignored. */
    hidden?: DisputeStatusGroup[];
}

export interface DisputesOverviewProps extends PaginationProps<DisputesPageLimit>, WithBalanceAccountId {
    onRecordSelection?: (selection: { id: string; showDetails: () => void }) => void;
    tabs?: DisputesOverviewTabsConfig;
    dataCustomization?: {
        dataGrid?: DisputesDataGridCustomization;
        details?: DisputeDetailsCustomization;
    };
}
