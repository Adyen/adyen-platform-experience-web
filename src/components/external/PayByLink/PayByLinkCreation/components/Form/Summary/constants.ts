import { PBLFormValues } from '../../types';
import { FieldValues } from '../../../../../../../hooks/form/types';

export const invisibleFields: FieldValues<PBLFormValues>[] = [
    'amount.currency',
    'linkValidity.durationUnit',
    'deliverAt',
    'shopperLocale',
    'sendSuccessEmailToShopper',
    'sendLinkToShopper',
];
