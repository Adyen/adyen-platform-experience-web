import { FormValues } from '../../types';

export const invisibleFields: (keyof FormValues)[] = [
    'currency',
    'deliveryDate',
    'emailSender',
    'shopperLocale',
    'sendPaymentSuccessToShopper',
    'sendLinkToShopper',
];
