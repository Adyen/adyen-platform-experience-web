import type { DomainComponentInstance } from '@integration-components/domain-integration';
import PaymentLinkDetailsRoot from '../PaymentLinkDetails/PaymentLinkDetailsRoot.vue';
import { createPayByLinkInstance } from './createPayByLinkInstance';
import type { PayByLinkDependencies, PaymentLinkDetailsDomainProps } from './types';

export const createPaymentLinkDetails = (
    props: PaymentLinkDetailsDomainProps,
    dependencies: PayByLinkDependencies
): DomainComponentInstance<Partial<PaymentLinkDetailsDomainProps>, Element | string> =>
    createPayByLinkInstance('Payment Link details', PaymentLinkDetailsRoot, props, dependencies);
