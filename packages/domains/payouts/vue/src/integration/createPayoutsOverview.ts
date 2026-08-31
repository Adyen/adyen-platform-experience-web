import type { DomainComponentInstance } from '@integration-components/domain-integration';
import PayoutsOverview from '../PayoutsOverview/components/PayoutsOverview.vue';
import { createPayoutsInstance } from './createPayoutsInstance';
import type { PayoutsDependencies, PayoutsOverviewDomainProps } from './types';

export const createPayoutsOverview = (
    props: PayoutsOverviewDomainProps,
    dependencies: PayoutsDependencies
): DomainComponentInstance<Partial<PayoutsOverviewDomainProps>, Element | string> =>
    createPayoutsInstance('Payouts overview', PayoutsOverview, props, dependencies);
