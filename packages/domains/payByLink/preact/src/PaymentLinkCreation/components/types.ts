import { IPaymentLinkCreateRequest } from '@integration-components/types';
export type LinkCreationFormStep = 'store' | 'payment' | 'customer' | 'summary';

export type PaymentLinkCreationFormValues = IPaymentLinkCreateRequest & {
    store: string;
};
