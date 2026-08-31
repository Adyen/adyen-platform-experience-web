import type { CoreInstance } from '@integration-components/core/vue';
import { bindDomainComponent } from '@integration-components/domain-integration';
import { PaymentLinkSettingsDefinition } from '@integration-components/payByLink/vue/definitions';
import { createPayByLinkDependencies } from './createPayByLinkDependencies';

export const bindPaymentLinkSettings = (core: CoreInstance) =>
    bindDomainComponent(PaymentLinkSettingsDefinition, ({ signal }) => createPayByLinkDependencies(core, 'paymentLinkSettings', signal));
