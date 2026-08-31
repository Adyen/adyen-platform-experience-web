import { defineDomainComponent } from '@integration-components/domain-integration';
import { createPaymentLinksOverview } from './createPaymentLinksOverview';
import type { PayByLinkDependencies, PaymentLinksOverviewDomainProps } from './types';

export const PaymentLinksOverviewDefinition = defineDomainComponent<
    PaymentLinksOverviewDomainProps,
    PayByLinkDependencies,
    Partial<PaymentLinksOverviewDomainProps>,
    Element | string
>()({
    create: ({ dependencies, props }) => createPaymentLinksOverview(props, dependencies),
});
