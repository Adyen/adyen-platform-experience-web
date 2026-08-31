import { defineDomainComponent } from '@integration-components/domain-integration';
import { createDisputesOverview } from './createDisputesOverview';
import type { DisputesDependencies, DisputesOverviewDomainProps } from './types';

export const DisputesOverviewDefinition = defineDomainComponent<
    DisputesOverviewDomainProps,
    DisputesDependencies,
    Partial<DisputesOverviewDomainProps>,
    Element | string
>()({
    create: ({ dependencies, props }) => createDisputesOverview(props, dependencies),
});
