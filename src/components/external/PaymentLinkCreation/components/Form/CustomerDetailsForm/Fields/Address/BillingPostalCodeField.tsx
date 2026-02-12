import { PaymentLinkCreationFormValues } from '../../../../types';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useCallback } from 'preact/hooks';
import { TargetedEvent } from 'preact/compat';
import { FormTextInput } from '../../../../../../../internal/FormWrappers/FormTextInput';
import { PAYMENT_LINK_CREATION_FIELD_LENGTHS } from '../../../../../constants';
import type { AddressFieldRequiredChecker } from '../../useAddressChecker';

interface BillingPostalCodeFieldProps {
    isSeparateAddress: boolean;
    isAddressFieldRequired: AddressFieldRequiredChecker;
    showBillingFirst?: boolean;
}

export const BillingPostalCodeField = ({ isSeparateAddress, isAddressFieldRequired, showBillingFirst = false }: BillingPostalCodeFieldProps) => {
    const { i18n } = useCoreContext();
    const { setValue, fieldsConfig } = useWizardFormContext<PaymentLinkCreationFormValues>();

    const onInput = useCallback(
        (e: TargetedEvent<HTMLInputElement, Event>) => {
            if (showBillingFirst && !isSeparateAddress) {
                setValue('deliveryAddress.postalCode', e.currentTarget.value);
            }
        },
        [isSeparateAddress, setValue, showBillingFirst]
    );

    const isRequired = fieldsConfig['billingAddress.postalCode']?.required || isAddressFieldRequired('billingAddress.postalCode');

    return (
        <FormTextInput<PaymentLinkCreationFormValues>
            maxLength={PAYMENT_LINK_CREATION_FIELD_LENGTHS.billingAddress.postalCode.max}
            fieldName="billingAddress.postalCode"
            label={i18n.get('payByLink.creation.fields.billingAddress.postalCode.label')}
            onInput={onInput}
            className="adyen-pe-payment-link-creation-form__billing-address-field--small"
            hideOptionalLabel
            isRequired={isRequired}
        />
    );
};
