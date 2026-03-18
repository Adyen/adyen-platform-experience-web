import { PaymentLinkCreationFormValues } from '../../../../types';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useCallback } from 'preact/hooks';
import { TargetedEvent } from 'preact';
import { FormTextInput } from '../../../../../../../internal/FormWrappers/FormTextInput';
import { PAYMENT_LINK_CREATION_FIELD_LENGTHS } from '../../../../../constants';
import type { AddressFieldRequiredChecker } from '../../useAddressChecker';

interface BillingStreetFieldProps {
    isSameAddress: boolean;
    isAddressFieldRequired: AddressFieldRequiredChecker;
    showBillingFirst?: boolean;
    isSameAddressCopyEnabled?: boolean;
}

export const BillingStreetField = ({
    isSameAddress,
    isAddressFieldRequired,
    showBillingFirst = false,
    isSameAddressCopyEnabled = false,
}: BillingStreetFieldProps) => {
    const { i18n } = useCoreContext();
    const { setValue, fieldsConfig } = useWizardFormContext<PaymentLinkCreationFormValues>();

    const onInput = useCallback(
        (e: TargetedEvent<HTMLInputElement, Event>) => {
            // Only copy when the same-address checkbox is enabled.
            // Prevents unintended copying when no address is prefilled and target fields are readOnly
            if (showBillingFirst && isSameAddressCopyEnabled && isSameAddress) {
                setValue('deliveryAddress.street', e.currentTarget.value);
            }
        },
        [isSameAddress, setValue, showBillingFirst, isSameAddressCopyEnabled]
    );

    const isRequired = fieldsConfig['billingAddress.street']?.required || isAddressFieldRequired('billingAddress.street');

    return (
        <FormTextInput<PaymentLinkCreationFormValues>
            maxLength={PAYMENT_LINK_CREATION_FIELD_LENGTHS.billingAddress.street.max}
            fieldName="billingAddress.street"
            label={i18n.get('payByLink.creation.fields.billingAddress.street.label')}
            onInput={onInput}
            className="adyen-pe-payment-link-creation-form__billing-address-field--large"
            hideOptionalLabel
            isRequired={isRequired}
        />
    );
};
