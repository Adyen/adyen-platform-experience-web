import { PaymentLinkCreationFormValues } from '../../types';
import { FieldValues } from '@integration-components/hooks-preact/form/types';

export const invisibleFields: FieldValues<PaymentLinkCreationFormValues>[] = [
    'amount.currency',
    'linkValidity.durationUnit',
    'deliverAt',
    'shopperLocale',
    'sendSuccessEmailToShopper',
    'sendLinkToShopper',
];
