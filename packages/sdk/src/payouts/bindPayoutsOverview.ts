import type { CoreInstance } from '@integration-components/core/vue';
import { bindDomainComponent } from '@integration-components/domain-integration';
import { PayoutDetailsDefinition, PayoutsOverviewDefinition } from '@integration-components/payouts/vue/definitions';
import { createPayoutsDependencies } from './createPayoutsDependencies';

export const bindPayoutsOverview = (core: CoreInstance) =>
    bindDomainComponent(PayoutsOverviewDefinition, ({ signal }) => createPayoutsDependencies(core, 'payouts', signal));

export const bindPayoutDetails = (core: CoreInstance) =>
    bindDomainComponent(PayoutDetailsDefinition, ({ signal }) => createPayoutsDependencies(core, 'payoutDetails', signal));
