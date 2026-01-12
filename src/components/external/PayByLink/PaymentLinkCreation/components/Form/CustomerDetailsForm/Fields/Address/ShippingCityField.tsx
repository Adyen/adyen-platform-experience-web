import { PaymentLinkCreationFormValues } from '../../../../types';
import useCoreContext from '../../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useCallback } from 'preact/hooks';
import { TargetedEvent } from 'preact/compat';
import { FormTextInput } from '../../../../../../../../internal/FormWrappers/FormTextInput';
import { PAYMENT_LINK_CREATION_FIELD_LENGTHS } from '../../../../../constants';
import type { AddressFieldRequiredChecker } from '../../useAddressChecker';

export const ShippingCityField = ({
    isSeparateAddress,
    isAddressFieldRequired,
}: {
    isSeparateAddress: boolean;
    isAddressFieldRequired: AddressFieldRequiredChecker;
}) => {
    const { i18n } = useCoreContext();
    const { setValue, fieldsConfig } = useWizardFormContext<PaymentLinkCreationFormValues>();

    const onInput = useCallback(
        (e: TargetedEvent<HTMLInputElement, Event>) => {
            !isSeparateAddress && setValue('billingAddress.city', e.currentTarget.value);
        },
        [isSeparateAddress, setValue]
    );

    const isRequired = fieldsConfig['deliveryAddress.city']?.required || isAddressFieldRequired('deliveryAddress.city');

    return (
        <FormTextInput<PaymentLinkCreationFormValues>
            maxLength={PAYMENT_LINK_CREATION_FIELD_LENGTHS.deliveryAddress.city.max}
            fieldName="deliveryAddress.city"
            label={i18n.get('payByLink.creation.fields.deliveryAddress.city.label')}
            onInput={onInput}
            className="adyen-pe-payment-link-creation-form__shipping-address-field--medium"
            hideOptionalLabel
            isRequired={isRequired}
        />
    );
};
