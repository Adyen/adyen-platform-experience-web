import type { UIElementProps } from '@integration-components/core/vue';
import type { GlobalAppearance, WithDataGridAppearance } from '@integration-components/types';
import type { PaginationProps } from '@integration-components/utils';
import type { DisputeDetailsCustomization, DisputesDataGridCustomization, DisputesPageLimit } from '@integration-components/disputes/domain';

export type DisputeStatusGroup = 'CHARGEBACKS' | 'FRAUD_ALERTS' | 'ONGOING_AND_CLOSED';

export type { DisputesDataGridCustomization };
export type { IBalanceAccountBase } from '@integration-components/types';

export type DisputesOverviewAppearance = GlobalAppearance & WithDataGridAppearance;

export interface DisputesOverviewExternalProps extends UIElementProps<DisputesOverviewAppearance>, PaginationProps<DisputesPageLimit> {
    balanceAccountId?: string;
    onContactSupport?: () => void;
    onRecordSelection?: (selection: { id: string; showDetails: () => void }) => any;
    dataCustomization?: {
        dataGrid?: DisputesDataGridCustomization;
        details?: DisputeDetailsCustomization;
    };
}

export type DisputesOverviewProps = Omit<DisputesOverviewExternalProps, 'core'>;
