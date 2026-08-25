import type { CoreInstance } from '@integration-components/core/vue';
import type { IBalanceAccountBase } from '@integration-components/types';
import type { DisputeDetailsCustomization, DisputesListCustomization, DisputesOverviewFilters } from '@integration-components/disputes/domain';

export type DisputeStatusGroup = 'CHARGEBACKS' | 'FRAUD_ALERTS' | 'ONGOING_AND_CLOSED';

export type { DisputesListCustomization };

export interface DisputesOverviewExternalProps {
    core: CoreInstance;
    allowLimitSelection?: boolean;
    balanceAccountId?: string;
    preferredLimit?: 10 | 20;
    hideTitle?: boolean;
    showDetails?: boolean;
    onContactSupport?: () => void;
    onFiltersChanged?: (filters: DisputesOverviewFilters) => any;
    onRecordSelection?: (selection: { id: string; showModal: () => void }) => any;
    dataCustomization?: {
        list?: DisputesListCustomization;
        details?: DisputeDetailsCustomization;
    };
}

export type DisputesOverviewProps = Omit<DisputesOverviewExternalProps, 'core'>;

export type { IBalanceAccountBase };
