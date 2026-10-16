import type { UIElementProps } from '@integration-components/core/vue';
import type { GlobalAppearance, WithDataGridAppearance } from '@integration-components/types';
import type {
    DisputeStatusGroup,
    DisputesDataGridCustomization,
    DisputesOverviewProps,
    DisputesOverviewTabsConfig,
} from '@integration-components/disputes/domain';

export type { DisputeStatusGroup, DisputesDataGridCustomization, DisputesOverviewTabsConfig };
export type { IBalanceAccountBase } from '@integration-components/types';

export type DisputesOverviewAppearance = GlobalAppearance & WithDataGridAppearance;

export type DisputesOverviewExternalProps = UIElementProps<DisputesOverviewAppearance> & DisputesOverviewProps;
export type DisputesOverviewComponentProps = Omit<DisputesOverviewExternalProps, 'core' | 'appearance'>;
