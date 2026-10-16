import type { UIElementProps } from '@integration-components/core/vue';
import type { GlobalAppearance, WithDataGridAppearance } from '@integration-components/types';
import type { PaginationProps } from '@integration-components/utils';
import type {
    DisputeDetailsCustomization,
    DisputeStatusGroup,
    DisputesListCustomization,
    DisputesOverviewTabsConfig,
    DisputesPageLimit,
} from '@integration-components/disputes/domain';

export type { DisputeStatusGroup, DisputesListCustomization, DisputesOverviewTabsConfig };
export type { IBalanceAccountBase } from '@integration-components/types';

export type DisputesOverviewAppearance = GlobalAppearance & WithDataGridAppearance;

export interface DisputesOverviewExternalProps extends UIElementProps<DisputesOverviewAppearance>, PaginationProps<DisputesPageLimit> {
    balanceAccountId?: string;
    onContactSupport?: () => void;
    onRecordSelection?: (selection: { id: string; showDetails: () => void }) => any;
    tabs?: DisputesOverviewTabsConfig;
    dataCustomization?: {
        list?: DisputesListCustomization;
        details?: DisputeDetailsCustomization;
    };
}

export type DisputesOverviewProps = Omit<DisputesOverviewExternalProps, 'core'>;
