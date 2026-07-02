import type { CoreInstance } from '@integration-components/core/vue';
import type { CustomColumn, CustomDataRetrieved, IBalanceAccountBase, OnDataRetrievedCallback } from '@integration-components/types';
import type { IDisputeListItem } from '@integration-components/types/api/models/disputes';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import type { DisputeDetailsCustomization } from '@integration-components/disputes/domain';
import type { DisputesTableFields } from './constants';

export type DisputeStatusGroup = 'CHARGEBACKS' | 'FRAUD_ALERTS' | 'ONGOING_AND_CLOSED';

export interface DisputesListCustomization {
    fields?: CustomColumn<StringWithAutocompleteOptions<DisputesTableFields>>[];
    onDataRetrieve?: OnDataRetrievedCallback<IDisputeListItem[], CustomDataRetrieved[]>;
}

export interface DisputesOverviewExternalProps {
    core: CoreInstance;
    allowLimitSelection?: boolean;
    balanceAccountId?: string;
    preferredLimit?: 10 | 20;
    hideTitle?: boolean;
    showDetails?: boolean;
    onContactSupport?: () => void;
    onFiltersChanged?: (filters: {
        balanceAccountId?: string;
        disputeType?: string;
        statuses?: string;
        createdSince?: string;
        createdUntil?: string;
    }) => any;
    onRecordSelection?: (selection: { id: string; showModal: () => void }) => any;
    dataCustomization?: {
        list?: DisputesListCustomization;
        details?: DisputeDetailsCustomization;
    };
}

export type DisputesOverviewProps = Omit<DisputesOverviewExternalProps, 'core'>;

export type { IBalanceAccountBase };
