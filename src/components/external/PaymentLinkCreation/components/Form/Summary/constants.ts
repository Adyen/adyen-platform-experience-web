import { PaymentLinkCreationFormValues } from '../../types';
import { FieldValues } from '../../../../../../hooks/form/types';

export const invisibleFields: FieldValues<PaymentLinkCreationFormValues>[] = [
    'amount.currency',
    'linkValidity.durationUnit',
    'deliverAt',
    'shopperLocale',
    'sendSuccessEmailToShopper',
    'sendLinkToShopper',
];
