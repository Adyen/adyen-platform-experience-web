import { defineDomainComponent } from '@integration-components/domain-integration';
import { createPaymentLinkSettings } from './createPaymentLinkSettings';
import type { PayByLinkDependencies, PaymentLinkSettingsDomainProps } from './types';

export const PaymentLinkSettingsDefinition = defineDomainComponent<
    PaymentLinkSettingsDomainProps,
    PayByLinkDependencies,
    Partial<PaymentLinkSettingsDomainProps>,
    Element | string
>()({
    create: ({ dependencies, props }) => createPaymentLinkSettings(props, dependencies),
});
