import { defineDomainComponent } from '@integration-components/domain-integration';
import { createPaymentLinkCreation } from './createPaymentLinkCreation';
import type { PayByLinkDependencies, PaymentLinkCreationDomainProps } from './types';

export const PaymentLinkCreationDefinition = defineDomainComponent<
    PaymentLinkCreationDomainProps,
    PayByLinkDependencies,
    Partial<PaymentLinkCreationDomainProps>,
    Element | string
>()({
    create: ({ dependencies, props }) => createPaymentLinkCreation(props, dependencies),
});
