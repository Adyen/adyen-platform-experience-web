import { PaymentLinkCreationFormValues } from '../../../../types';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useCallback } from 'preact/hooks';
import { TargetedEvent } from 'preact';
import { FormTextInput } from '../../../../../../../internal/FormWrappers/FormTextInput';
import { PAYMENT_LINK_CREATION_FIELD_LENGTHS } from '../../../../../constants';
import type { AddressFieldRequiredChecker } from '../../useAddressChecker';

interface ShippingPostalCodeFieldProps {
    isSameAddress: boolean;
    isAddressFieldRequired: AddressFieldRequiredChecker;
    isSameAddressCopyEnabled?: boolean;
}

export const ShippingPostalCodeField = ({
    isSameAddress,
    isAddressFieldRequired,
    isSameAddressCopyEnabled = false,
}: ShippingPostalCodeFieldProps) => {
    const { i18n } = useCoreContext();
    const { setValue, fieldsConfig } = useWizardFormContext<PaymentLinkCreationFormValues>();

    const onInput = useCallback(
        (e: TargetedEvent<HTMLInputElement, Event>) => {
            // Only copy when the same-address checkbox is enabled.
            // Prevents unintended copying when no address is prefilled and target fields are readOnly
            if (isSameAddressCopyEnabled && isSameAddress) {
                setValue('billingAddress.postalCode', e.currentTarget.value);
            }
        },
        [isSameAddress, setValue, isSameAddressCopyEnabled]
    );

    const isRequired = fieldsConfig['deliveryAddress.postalCode']?.required || isAddressFieldRequired('deliveryAddress.postalCode');

    return (
        <FormTextInput<PaymentLinkCreationFormValues>
            maxLength={PAYMENT_LINK_CREATION_FIELD_LENGTHS.deliveryAddress.postalCode.max}
            fieldName="deliveryAddress.postalCode"
            label={i18n.get('payByLink.creation.fields.deliveryAddress.postalCode.label')}
            onInput={onInput}
            className="adyen-pe-payment-link-creation-form__shipping-address-field--small"
            hideOptionalLabel
            isRequired={isRequired}
        />
    );
};
