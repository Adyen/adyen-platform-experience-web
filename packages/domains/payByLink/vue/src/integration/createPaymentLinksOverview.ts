import type { DomainComponentInstance } from '@integration-components/domain-integration';
import PaymentLinksOverviewRoot from '../PaymentLinksOverview/PaymentLinksOverviewRoot.vue';
import { createPayByLinkInstance } from './createPayByLinkInstance';
import type { PayByLinkDependencies, PaymentLinksOverviewDomainProps } from './types';

export const createPaymentLinksOverview = (
    props: PaymentLinksOverviewDomainProps,
    dependencies: PayByLinkDependencies
): DomainComponentInstance<Partial<PaymentLinksOverviewDomainProps>, Element | string> =>
    createPayByLinkInstance('Payment Links overview', PaymentLinksOverviewRoot, props, dependencies);
