import type { CoreInstance } from '@integration-components/core/vue';
import { bindDomainComponent } from '@integration-components/domain-integration';
import { PaymentLinksOverviewDefinition } from '@integration-components/payByLink/vue/definitions';
import { createPayByLinkDependencies } from './createPayByLinkDependencies';

export const bindPaymentLinksOverview = (core: CoreInstance) =>
    bindDomainComponent(PaymentLinksOverviewDefinition, ({ signal }) => createPayByLinkDependencies(core, 'paymentLinksOverview', signal));
