import { PaymentLinkCreationFormValues } from '../../../../types';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useCallback } from 'preact/hooks';
import { TargetedEvent } from 'preact/compat';
import { FormTextInput } from '../../../../../../../internal/FormWrappers/FormTextInput';
import { PAYMENT_LINK_CREATION_FIELD_LENGTHS } from '../../../../../constants';
import type { AddressFieldRequiredChecker } from '../../useAddressChecker';

interface BillingHouseNumberFieldProps {
    isSameAddress: boolean;
    isAddressFieldRequired: AddressFieldRequiredChecker;
    showBillingFirst?: boolean;
    isSameAddressCheckboxShown?: boolean;
}

export const BillingHouseNumberField = ({
    isSameAddress,
    isAddressFieldRequired,
    showBillingFirst = false,
    isSameAddressCheckboxShown = false,
}: BillingHouseNumberFieldProps) => {
    const { i18n } = useCoreContext();
    const { setValue, fieldsConfig } = useWizardFormContext<PaymentLinkCreationFormValues>();

    const onInput = useCallback(
        (e: TargetedEvent<HTMLInputElement, Event>) => {
            if (showBillingFirst && isSameAddressCheckboxShown && isSameAddress) {
                setValue('deliveryAddress.houseNumberOrName', e.currentTarget.value);
            }
        },
        [isSameAddress, setValue, showBillingFirst, isSameAddressCheckboxShown]
    );

    const isRequired = fieldsConfig['billingAddress.houseNumberOrName']?.required || isAddressFieldRequired('billingAddress.houseNumberOrName');

    return (
        <FormTextInput<PaymentLinkCreationFormValues>
            maxLength={PAYMENT_LINK_CREATION_FIELD_LENGTHS.billingAddress.houseNumberOrName.max}
            fieldName="billingAddress.houseNumberOrName"
            label={i18n.get('payByLink.creation.fields.billingAddress.houseNumberOrName.label')}
            onInput={onInput}
            className="adyen-pe-payment-link-creation-form__billing-address-field--small"
            hideOptionalLabel
            isRequired={isRequired}
        />
    );
};
