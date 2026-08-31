import type { DomainComponentInstance } from '@integration-components/domain-integration';
import DisputeManagement from '../DisputeManagement/components/DisputeDetailsContainer.vue';
import { createDisputesInstance } from './createDisputesInstance';
import type { DisputeManagementDomainProps, DisputeManagementRenderMode, DisputesDependencies } from './types';

export const createDisputeManagement = (
    props: DisputeManagementDomainProps,
    dependencies: DisputesDependencies,
    renderMode: DisputeManagementRenderMode
): DomainComponentInstance<Partial<DisputeManagementDomainProps>, Element | string> =>
    createDisputesInstance('Dispute management', DisputeManagement, props, dependencies, { renderMode });
