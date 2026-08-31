import { defineDomainComponent } from '@integration-components/domain-integration';
import { createPaymentLinkDetails } from './createPaymentLinkDetails';
import type { PayByLinkDependencies, PaymentLinkDetailsDomainProps } from './types';

export const PaymentLinkDetailsDefinition = defineDomainComponent<
    PaymentLinkDetailsDomainProps,
    PayByLinkDependencies,
    Partial<PaymentLinkDetailsDomainProps>,
    Element | string
>()({
    create: ({ dependencies, props }) => createPaymentLinkDetails(props, dependencies),
});
