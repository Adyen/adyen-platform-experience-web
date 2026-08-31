import type { DomainComponentInstance } from '@integration-components/domain-integration';
import PaymentLinkSettingsRoot from '../PaymentLinkSettings/PaymentLinkSettingsRoot.vue';
import { createPayByLinkInstance } from './createPayByLinkInstance';
import type { PayByLinkDependencies, PaymentLinkSettingsDomainProps } from './types';

export const createPaymentLinkSettings = (
    props: PaymentLinkSettingsDomainProps,
    dependencies: PayByLinkDependencies
): DomainComponentInstance<Partial<PaymentLinkSettingsDomainProps>, Element | string> =>
    createPayByLinkInstance('Payment Link settings', PaymentLinkSettingsRoot, props, dependencies);
