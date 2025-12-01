import { CreatePaymentLinkRequestDTO } from '../../../../../types/api/models/payByLink';
export type LinkCreationFormStep = 'store' | 'payment' | 'customer' | 'summary';

export type PBLFormValues = CreatePaymentLinkRequestDTO & {
    store?: string;
};
