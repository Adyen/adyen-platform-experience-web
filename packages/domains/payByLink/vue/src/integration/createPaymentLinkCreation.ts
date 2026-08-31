import type { DomainComponentInstance } from '@integration-components/domain-integration';
import PaymentLinkCreationRoot from '../PaymentLinkCreation/PaymentLinkCreationRoot.vue';
import { createPayByLinkInstance } from './createPayByLinkInstance';
import type { PayByLinkDependencies, PaymentLinkCreationDomainProps } from './types';

export const createPaymentLinkCreation = (
    props: PaymentLinkCreationDomainProps,
    dependencies: PayByLinkDependencies
): DomainComponentInstance<Partial<PaymentLinkCreationDomainProps>, Element | string> =>
    createPayByLinkInstance('Payment Link creation', PaymentLinkCreationRoot, props, dependencies);
