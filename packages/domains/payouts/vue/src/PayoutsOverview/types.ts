import type { UIElementProps } from '@integration-components/core/vue';
import type { GlobalAppearance, WithDataGridAppearance } from '@integration-components/types';
import type { PayoutsOverviewProps } from '@integration-components/payouts/domain';

export type { IBalanceAccountBase } from '@integration-components/types';
export type PayoutsOverviewAppearance = GlobalAppearance & WithDataGridAppearance;

// ── Component prop types ──

export type PayoutsOverviewExternalProps = UIElementProps<PayoutsOverviewAppearance> & PayoutsOverviewProps;
export type PayoutsOverviewComponentProps = Omit<PayoutsOverviewExternalProps, 'core' | 'appearance'>;
