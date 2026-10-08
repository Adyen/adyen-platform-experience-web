import type { UIElementProps } from '@integration-components/core/vue';
import type { GlobalAppearance, IBalanceAccountBase, WithDataGridAppearance } from '@integration-components/types';
import type { PaginationProps } from '@integration-components/utils';
import type { DisputeDetailsCustomization, DisputesListCustomization, DisputesPageLimit } from '@integration-components/disputes/domain';

export type DisputeStatusGroup = 'CHARGEBACKS' | 'FRAUD_ALERTS' | 'ONGOING_AND_CLOSED';

export type { DisputesListCustomization };

export type DisputesOverviewAppearance = GlobalAppearance & WithDataGridAppearance;

export interface DisputesOverviewExternalProps extends UIElementProps, PaginationProps<DisputesPageLimit> {
    appearance?: DisputesOverviewAppearance;
    balanceAccountId?: string;
    onContactSupport?: () => void;
    onRecordSelection?: (selection: { id: string; showModal: () => void }) => any;
    dataCustomization?: {
        list?: DisputesListCustomization;
        details?: DisputeDetailsCustomization;
    };
}

export type DisputesOverviewProps = Omit<DisputesOverviewExternalProps, 'core'>;

export type { IBalanceAccountBase };
