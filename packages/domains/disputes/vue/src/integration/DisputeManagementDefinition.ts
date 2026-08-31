import { defineDomainComponent } from '@integration-components/domain-integration';
import { createDisputeManagement } from './createDisputeManagement';
import type { DisputeManagementDomainProps, DisputesDependencies } from './types';

export const DisputeManagementDefinition = defineDomainComponent<
    DisputeManagementDomainProps,
    DisputesDependencies,
    Partial<DisputeManagementDomainProps>,
    Element | string
>()({
    create: ({ dependencies, props }) => createDisputeManagement(props, dependencies, 'standalone'),
});
