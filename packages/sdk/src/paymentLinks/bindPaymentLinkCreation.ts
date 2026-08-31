import type { CoreInstance } from '@integration-components/core/vue';
import { bindDomainComponent } from '@integration-components/domain-integration';
import { PaymentLinkCreationDefinition } from '@integration-components/payByLink/vue/definitions';
import { createPayByLinkDependencies } from './createPayByLinkDependencies';

export const bindPaymentLinkCreation = (core: CoreInstance) =>
    bindDomainComponent(PaymentLinkCreationDefinition, ({ signal }) => createPayByLinkDependencies(core, 'paymentLinkCreation', signal));
