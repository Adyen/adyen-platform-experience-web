import { computed } from 'vue';
import type { PaymentLinkFieldName } from '../../../../../../domain/src';
import { useWizard } from '../../../composables/wizardContext';

const BILLING_ADDRESS_FIELDS: PaymentLinkFieldName[] = [
    'billingAddress.street',
    'billingAddress.houseNumberOrName',
    'billingAddress.postalCode',
    'billingAddress.city',
    'billingAddress.country',
];

const DELIVERY_ADDRESS_FIELDS: PaymentLinkFieldName[] = [
    'deliveryAddress.street',
    'deliveryAddress.houseNumberOrName',
    'deliveryAddress.postalCode',
    'deliveryAddress.city',
    'deliveryAddress.country',
];

interface AddressSectionState {
    isVisible: boolean;
    isRequired: boolean;
    allFieldsReadOnly: boolean;
    hasAnyReadOnlyField: boolean;
}

export function useAddressSections() {
    const wizard = useWizard();

    const getSectionState = (fields: PaymentLinkFieldName[]): AddressSectionState => {
        const configs = fields.map(field => wizard.getFieldConfig(field));
        const visibleFields = configs.filter(config => config.visible);
        const readOnlyFields = configs.filter(config => config.readOnly);
        return {
            isVisible: visibleFields.length > 0,
            isRequired: configs.some(config => config.required),
            allFieldsReadOnly: visibleFields.length > 0 && visibleFields.every(config => config.readOnly),
            hasAnyReadOnlyField: readOnlyFields.length > 0,
        };
    };

    const billingState = computed(() => getSectionState(BILLING_ADDRESS_FIELDS));
    const deliveryState = computed(() => getSectionState(DELIVERY_ADDRESS_FIELDS));

    const showBillingFirst = computed(() => billingState.value.isRequired && !deliveryState.value.isRequired);

    const isSameAddressCopyEnabled = computed(() => {
        if (!billingState.value.isVisible || !deliveryState.value.isVisible) return false;
        const target = showBillingFirst.value ? deliveryState.value : billingState.value;
        const source = showBillingFirst.value ? billingState.value : deliveryState.value;
        if (target.allFieldsReadOnly && source.allFieldsReadOnly) return false;
        if (target.hasAnyReadOnlyField) return false;
        return true;
    });

    return {
        billingState,
        deliveryState,
        showBillingFirst,
        isSameAddressCopyEnabled,
        BILLING_ADDRESS_FIELDS,
        DELIVERY_ADDRESS_FIELDS,
    };
}
