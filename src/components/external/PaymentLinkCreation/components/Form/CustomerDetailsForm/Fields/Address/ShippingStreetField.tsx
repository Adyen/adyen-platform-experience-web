import { PaymentLinkCreationFormValues } from '../../../../types';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useCallback } from 'preact/hooks';
import { TargetedEvent } from 'preact/compat';
import { FormTextInput } from '../../../../../../../internal/FormWrappers/FormTextInput';
import { PAYMENT_LINK_CREATION_FIELD_LENGTHS } from '../../../../../constants';
import type { AddressFieldRequiredChecker } from '../../useAddressChecker';

interface ShippingStreetFieldProps {
    isSameAddress: boolean;
    isAddressFieldRequired: AddressFieldRequiredChecker;
    isSameAddressCheckboxShown?: boolean;
}

export const ShippingStreetField = ({ isSameAddress, isAddressFieldRequired, isSameAddressCheckboxShown = false }: ShippingStreetFieldProps) => {
    const { i18n } = useCoreContext();
    const { setValue, fieldsConfig } = useWizardFormContext<PaymentLinkCreationFormValues>();

    const onInput = useCallback(
        (e: TargetedEvent<HTMLInputElement, Event>) => {
            if (isSameAddressCheckboxShown && isSameAddress) {
                setValue('billingAddress.street', e.currentTarget.value);
            }
        },
        [isSameAddress, setValue, isSameAddressCheckboxShown]
    );

    const isRequired = fieldsConfig['deliveryAddress.street']?.required || isAddressFieldRequired('deliveryAddress.street');

    return (
        <FormTextInput<PaymentLinkCreationFormValues>
            maxLength={PAYMENT_LINK_CREATION_FIELD_LENGTHS.deliveryAddress.street.max}
            fieldName="deliveryAddress.street"
            label={i18n.get('payByLink.creation.fields.deliveryAddress.street.label')}
            onInput={onInput}
            className="adyen-pe-payment-link-creation-form__shipping-address-field--large"
            hideOptionalLabel
            isRequired={isRequired}
        />
    );
};
