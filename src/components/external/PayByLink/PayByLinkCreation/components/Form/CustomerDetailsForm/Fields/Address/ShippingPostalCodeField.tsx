import { PBLFormValues } from '../../../../types';
import useCoreContext from '../../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useCallback } from 'preact/hooks';
import { TargetedEvent } from 'preact/compat';
import { FormTextInput } from '../../../../../../../../internal/FormWrappers/FormTextInput';
import { PBL_CREATION_FIELD_LENGTHS } from '../../../../../constants';
import type { AddressFieldRequiredChecker } from '../../useAddressChecker';

export const ShippingPostalCodeField = ({
    isSeparateAddress,
    isAddressFieldRequired,
}: {
    isSeparateAddress: boolean;
    isAddressFieldRequired: AddressFieldRequiredChecker;
}) => {
    const { i18n } = useCoreContext();
    const { setValue, fieldsConfig } = useWizardFormContext<PBLFormValues>();

    const onInput = useCallback(
        (e: TargetedEvent<HTMLInputElement, Event>) => {
            !isSeparateAddress && setValue('billingAddress.postalCode', e.currentTarget.value);
        },
        [isSeparateAddress, setValue]
    );

    const isRequired = fieldsConfig['deliveryAddress.postalCode']?.required || isAddressFieldRequired('deliveryAddress.postalCode');

    return (
        <FormTextInput<PBLFormValues>
            maxLength={PBL_CREATION_FIELD_LENGTHS.deliveryAddress.postalCode.max}
            fieldName="deliveryAddress.postalCode"
            label={i18n.get('payByLink.linkCreation.fields.deliveryAddress.postalCode.label')}
            onInput={onInput}
            className="adyen-pe-pay-by-link-creation-form__shipping-address-field--small"
            hideOptionalLabel
            isRequired={isRequired}
        />
    );
};
