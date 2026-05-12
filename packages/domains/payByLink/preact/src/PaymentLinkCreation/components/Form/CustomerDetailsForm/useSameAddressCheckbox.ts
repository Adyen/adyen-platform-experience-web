import { useMemo } from 'preact/hooks';
import { useWizardFormContext } from '../../../../../../hooks/form/wizard/WizardFormContext';
import { PaymentLinkCreationFormValues } from '../../types';

const BILLING_ADDRESS_FIELDS = [
    'billingAddress.street',
    'billingAddress.houseNumberOrName',
    'billingAddress.postalCode',
    'billingAddress.city',
    'billingAddress.country',
] as const;

const DELIVERY_ADDRESS_FIELDS = [
    'deliveryAddress.street',
    'deliveryAddress.houseNumberOrName',
    'deliveryAddress.postalCode',
    'deliveryAddress.city',
    'deliveryAddress.country',
] as const;

interface AddressSectionState {
    isVisible: boolean;
    isRequired: boolean;
    allFieldsReadOnly: boolean;
    hasAnyReadOnlyField: boolean;
}

interface UseSameAddressCheckboxResult {
    isSameAddressCopyEnabled: boolean;
    showBillingFirst: boolean;
}

/**
 * Hook to determine if the "same address" checkbox should be displayed.
 *
 * The checkbox allows users to copy address data between billing and delivery sections.
 * It should be hidden when:
 * - Only one address section is visible (no need to copy)
 * - Both sections have all fields locked/readOnly (user can't modify anything)
 * - The "target" section has any readOnly field (copying would partially fail)
 *
 * Display order logic:
 * - Default: Delivery (shipping) shows first, billing receives the copy
 * - When billing is required AND delivery is optional: Billing shows first, delivery receives the copy
 */
export const useSameAddressCheckbox = (): UseSameAddressCheckboxResult => {
    const { fieldsConfig } = useWizardFormContext<PaymentLinkCreationFormValues>();

    return useMemo(() => {
        const getAddressSectionState = (fields: readonly string[]): AddressSectionState => {
            const fieldConfigs = fields.map(field => fieldsConfig[field as keyof typeof fieldsConfig]);
            const visibleFields = fieldConfigs.filter(config => config?.visible);
            const readOnlyFields = fieldConfigs.filter(config => config?.readOnly);

            return {
                isVisible: visibleFields.length > 0,
                isRequired: fieldConfigs.some(config => config?.required),
                allFieldsReadOnly: visibleFields.length > 0 && visibleFields.every(config => config?.readOnly),
                hasAnyReadOnlyField: readOnlyFields.length > 0,
            };
        };

        const billingState = getAddressSectionState(BILLING_ADDRESS_FIELDS);
        const deliveryState = getAddressSectionState(DELIVERY_ADDRESS_FIELDS);

        // Checkbox requires both sections to be visible
        if (!billingState.isVisible || !deliveryState.isVisible) {
            return { isSameAddressCopyEnabled: false, showBillingFirst: false };
        }

        // Determine display order: billing first when billing is required and delivery is optional
        const showBillingFirst = billingState.isRequired && !deliveryState.isRequired;

        // Determine which section is the "target" (receives copied values)
        // - When showBillingFirst is false (default): billing is the target
        // - When showBillingFirst is true: delivery is the target
        const targetState = showBillingFirst ? deliveryState : billingState;
        const sourceState = showBillingFirst ? billingState : deliveryState;

        // Hide checkbox if:
        // 1. Both sections have all fields locked - no interaction possible
        // 2. Target section has any readOnly field - copying would partially fail
        if (targetState.allFieldsReadOnly && sourceState.allFieldsReadOnly) {
            return { isSameAddressCopyEnabled: false, showBillingFirst };
        }

        if (targetState.hasAnyReadOnlyField) {
            return { isSameAddressCopyEnabled: false, showBillingFirst };
        }

        // Show checkbox: both visible and target has no readOnly fields
        return { isSameAddressCopyEnabled: true, showBillingFirst };
    }, [fieldsConfig]);
};
