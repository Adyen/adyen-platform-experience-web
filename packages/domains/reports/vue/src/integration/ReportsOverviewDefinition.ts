import { defineDomainComponent } from '@integration-components/domain-integration';
import { createReportsOverview } from './createReportsOverview';
import type { ReportsOverviewDependencies, ReportsOverviewDomainProps } from './types';

export const ReportsOverviewDefinition = defineDomainComponent<
    ReportsOverviewDomainProps,
    ReportsOverviewDependencies,
    Partial<ReportsOverviewDomainProps>,
    Element | string
>()({
    create: ({ dependencies, props }) => createReportsOverview(props, dependencies),
});
