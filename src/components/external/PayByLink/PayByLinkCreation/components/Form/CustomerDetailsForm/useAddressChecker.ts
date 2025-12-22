import { useCallback } from 'preact/hooks';
import { useWizardFormContext } from '../../../../../../../hooks/form/wizard/WizardFormContext';
import { useWatch } from '../../../../../../../hooks/form';
import { PBLFormValues } from '../../types';
import { FieldValues } from '../../../../../../../hooks/form/types';

const DELIVERY_ADDRESS_FIELDS = [
    'deliveryAddress.street',
    'deliveryAddress.houseNumberOrName',
    'deliveryAddress.country',
    'deliveryAddress.city',
    'deliveryAddress.postalCode',
] as const;

const BILLING_ADDRESS_FIELDS = [
    'billingAddress.street',
    'billingAddress.houseNumberOrName',
    'billingAddress.country',
    'billingAddress.city',
    'billingAddress.postalCode',
] as const;

export type AddressFieldRequiredChecker = (fieldName: FieldValues<PBLFormValues>) => boolean;

export const useAddressChecker = () => {
    const { control } = useWizardFormContext<PBLFormValues>();

    const deliveryStreet = useWatch(control, 'deliveryAddress.street' as FieldValues<PBLFormValues>);
    const deliveryHouseNumber = useWatch(control, 'deliveryAddress.houseNumberOrName' as FieldValues<PBLFormValues>);
    const deliveryCountry = useWatch(control, 'deliveryAddress.country' as FieldValues<PBLFormValues>);
    const deliveryCity = useWatch(control, 'deliveryAddress.city' as FieldValues<PBLFormValues>);
    const deliveryPostalCode = useWatch(control, 'deliveryAddress.postalCode' as FieldValues<PBLFormValues>);

    const billingStreet = useWatch(control, 'billingAddress.street' as FieldValues<PBLFormValues>);
    const billingHouseNumber = useWatch(control, 'billingAddress.houseNumberOrName' as FieldValues<PBLFormValues>);
    const billingCountry = useWatch(control, 'billingAddress.country' as FieldValues<PBLFormValues>);
    const billingCity = useWatch(control, 'billingAddress.city' as FieldValues<PBLFormValues>);
    const billingPostalCode = useWatch(control, 'billingAddress.postalCode' as FieldValues<PBLFormValues>);

    const deliveryValues = {
        'deliveryAddress.street': deliveryStreet,
        'deliveryAddress.houseNumberOrName': deliveryHouseNumber,
        'deliveryAddress.country': deliveryCountry,
        'deliveryAddress.city': deliveryCity,
        'deliveryAddress.postalCode': deliveryPostalCode,
    };

    const billingValues = {
        'billingAddress.street': billingStreet,
        'billingAddress.houseNumberOrName': billingHouseNumber,
        'billingAddress.country': billingCountry,
        'billingAddress.city': billingCity,
        'billingAddress.postalCode': billingPostalCode,
    };

    const isAddressFieldRequired = useCallback(
        (fieldName: FieldValues<PBLFormValues>) => {
            const isDeliveryField = DELIVERY_ADDRESS_FIELDS.includes(fieldName as (typeof DELIVERY_ADDRESS_FIELDS)[number]);
            if (isDeliveryField) {
                return DELIVERY_ADDRESS_FIELDS.some(field => {
                    const value = deliveryValues[field];
                    return value !== undefined && value !== '';
                });
            }

            const isBillingField = BILLING_ADDRESS_FIELDS.includes(fieldName as (typeof BILLING_ADDRESS_FIELDS)[number]);
            if (isBillingField) {
                return BILLING_ADDRESS_FIELDS.some(field => {
                    const value = billingValues[field];
                    return value !== undefined && value !== '';
                });
            }

            return false;
        },
        [deliveryValues, billingValues]
    );

    return { isAddressFieldRequired };
};
