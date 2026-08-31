import type { DomainComponentInstance } from '@integration-components/domain-integration';
import DisputesOverview from '../DisputesOverview/components/DisputesOverview.vue';
import { createDisputesInstance } from './createDisputesInstance';
import type { DisputesDependencies, DisputesOverviewDomainProps } from './types';

export const createDisputesOverview = (
    props: DisputesOverviewDomainProps,
    dependencies: DisputesDependencies
): DomainComponentInstance<Partial<DisputesOverviewDomainProps>, Element | string> =>
    createDisputesInstance('Disputes overview', DisputesOverview, props, dependencies);
