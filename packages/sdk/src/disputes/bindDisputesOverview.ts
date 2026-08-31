import type { CoreInstance } from '@integration-components/core/vue';
import { bindDomainComponent } from '@integration-components/domain-integration';
import { DisputeManagementDefinition, DisputesOverviewDefinition } from '@integration-components/disputes/vue/definitions';
import { createDisputesDependencies } from './createDisputesDependencies';

export const bindDisputesOverview = (core: CoreInstance) =>
    bindDomainComponent(DisputesOverviewDefinition, ({ signal }) => createDisputesDependencies(core, 'disputes', signal));

export const bindDisputeManagement = (core: CoreInstance) =>
    bindDomainComponent(DisputeManagementDefinition, ({ signal }) => createDisputesDependencies(core, 'disputesManagement', signal));
