import type { CoreInstance } from '@integration-components/core/vue';
import { bindDomainComponent } from '@integration-components/domain-integration';
import { PaymentLinkDetailsDefinition } from '@integration-components/payByLink/vue/definitions';
import { createPayByLinkDependencies } from './createPayByLinkDependencies';

export const bindPaymentLinkDetails = (core: CoreInstance) =>
    bindDomainComponent(PaymentLinkDetailsDefinition, ({ signal }) => createPayByLinkDependencies(core, 'paymentLinkDetails', signal));
