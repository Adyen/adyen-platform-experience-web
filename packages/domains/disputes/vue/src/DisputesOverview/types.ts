import type { IBalanceAccountBase } from '@integration-components/types';
import type { DisputesListCustomization } from '@integration-components/disputes/domain';
import type { DisputesOverviewDomainProps } from '../integration/types';

export type DisputeStatusGroup = 'CHARGEBACKS' | 'FRAUD_ALERTS' | 'ONGOING_AND_CLOSED';

export type { DisputesListCustomization };

export type DisputesOverviewProps = DisputesOverviewDomainProps;

export type { IBalanceAccountBase };
