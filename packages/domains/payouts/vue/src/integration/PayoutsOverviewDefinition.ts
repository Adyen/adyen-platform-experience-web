import { defineDomainComponent } from '@integration-components/domain-integration';
import { createPayoutsOverview } from './createPayoutsOverview';
import type { PayoutsDependencies, PayoutsOverviewDomainProps } from './types';

export const PayoutsOverviewDefinition = defineDomainComponent<
    PayoutsOverviewDomainProps,
    PayoutsDependencies,
    Partial<PayoutsOverviewDomainProps>,
    Element | string
>()({
    create: ({ dependencies, props }) => createPayoutsOverview(props, dependencies),
});
