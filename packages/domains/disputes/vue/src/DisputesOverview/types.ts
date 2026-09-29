import type { UIElementProps } from '@integration-components/core/vue';
import type { IBalanceAccountBase, PaginationProps } from '@integration-components/types';
import type { DisputeDetailsCustomization, DisputesListCustomization, DisputesOverviewFilters } from '@integration-components/disputes/domain';

export type DisputeStatusGroup = 'CHARGEBACKS' | 'FRAUD_ALERTS' | 'ONGOING_AND_CLOSED';

export type { DisputesListCustomization };

export interface DisputesOverviewExternalProps extends UIElementProps, PaginationProps {
    balanceAccountId?: string;
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
