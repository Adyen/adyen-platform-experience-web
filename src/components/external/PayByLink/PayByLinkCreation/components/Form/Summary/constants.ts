import { PBLFormValues } from '../../types';
import { FieldValues } from '../../../../../../../hooks/form/types';

export const SUMMARY_COPYABLE_FIELDS = new Set([
    'shopperReference',
    'shopperName.firstName',
    'shopperName.lastName',
    'emailAddress',
    'phoneNumber',
    'deliveryAddress.street',
    'billingAddress.street',
]);

export const invisibleFields: FieldValues<PBLFormValues>[] = [
    'currencyCode',
    'deliverAt',
    'shopperLocale',
    'sendSuccessEmailToShopper',
    'sendLinkToShopper',
];
