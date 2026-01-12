import { PaymentLinkCreationFormValues } from '../../../types';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { StateUpdater, useCallback } from 'preact/hooks';
import { Dispatch } from 'preact/compat';
import Icon from '../../../../../../../internal/Icon';
import Typography from '../../../../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../../../../internal/Typography/types';
import { uuid } from '../../../../../../../../utils';

interface BillingAndShippingCheckboxFieldProps {
    isSeparateAddress: boolean;
    setIsSeparateAddress: Dispatch<StateUpdater<boolean>>;
}

export const BillingAndShippingCheckboxField = ({ isSeparateAddress, setIsSeparateAddress }: BillingAndShippingCheckboxFieldProps) => {
    const { i18n } = useCoreContext();
    const { setValue, getValues } = useWizardFormContext<PaymentLinkCreationFormValues>();
    const isSeparateAddressInputId = uuid();

    const toggleBillingAndDeliveryAddress = useCallback(() => {
        setIsSeparateAddress(prev => {
            setValue('billingAddress.street', !prev ? undefined : getValues('deliveryAddress.street'));
            setValue('billingAddress.houseNumberOrName', !prev ? undefined : getValues('deliveryAddress.houseNumberOrName'));
            setValue('billingAddress.postalCode', !prev ? undefined : getValues('deliveryAddress.postalCode'));
            setValue('billingAddress.city', !prev ? undefined : getValues('deliveryAddress.city'));
            setValue('billingAddress.country', !prev ? undefined : getValues('deliveryAddress.country'));
            return !prev;
        });
    }, [getValues, setIsSeparateAddress, setValue]);

    return (
        <div>
            <input type="checkbox" className="adyen-pe-visually-hidden" id={isSeparateAddressInputId} onInput={toggleBillingAndDeliveryAddress} />
            <label className="adyen-pe-payment-link-creation-form__field-checkbox" htmlFor={isSeparateAddressInputId}>
                {isSeparateAddress ? <Icon name="checkmark-square-fill" /> : <Icon name="square" />}
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                    {i18n.get('payByLink.creation.fields.billingAndDeliverySeparateAddress.label')}
                </Typography>
            </label>
        </div>
    );
};
