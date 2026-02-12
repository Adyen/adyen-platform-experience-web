import { IPaymentLinkCreateRequest } from '../../../../types/api/models/payByLink';
export type LinkCreationFormStep = 'store' | 'payment' | 'customer' | 'summary';

export type PaymentLinkCreationFormValues = IPaymentLinkCreateRequest & {
    store: string;
};
