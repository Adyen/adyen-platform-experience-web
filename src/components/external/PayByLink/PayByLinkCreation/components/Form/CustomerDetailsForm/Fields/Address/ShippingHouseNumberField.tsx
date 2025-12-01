import { PBLFormValues } from '../../../../types';
import useCoreContext from '../../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useCallback } from 'preact/hooks';
import { TargetedEvent } from 'preact/compat';
import { FormTextInput } from '../../../../../../../../internal/FormWrappers/FormTextInput';
import { PBL_CREATION_FIELD_LENGTHS } from '../../../../../constants';

export const ShippingHouseNumberField = ({ isSeparateAddress }: { isSeparateAddress: boolean }) => {
    const { i18n } = useCoreContext();
    const { setValue } = useWizardFormContext<PBLFormValues>();

    const onInput = useCallback(
        (e: TargetedEvent<HTMLInputElement, Event>) => {
            !isSeparateAddress && setValue('billingAddress.houseNumberOrName', e.currentTarget.value);
        },
        [isSeparateAddress, setValue]
    );

    return (
        <FormTextInput<PBLFormValues>
            maxLength={PBL_CREATION_FIELD_LENGTHS.deliveryAddress.houseNumberOrName.max}
            fieldName="deliveryAddress.houseNumberOrName"
            label={i18n.get('payByLink.linkCreation.fields.deliveryAddress.houseNumberOrName.label')}
            onInput={onInput}
            className="adyen-pe-pay-by-link-creation-form__shipping-address-field--small"
        />
    );
};
