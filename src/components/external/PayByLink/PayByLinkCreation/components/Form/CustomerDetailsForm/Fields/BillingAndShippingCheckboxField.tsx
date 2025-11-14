import { FormValues } from '../../../types';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { StateUpdater, useCallback } from 'preact/hooks';
import { Dispatch } from 'preact/compat';
import Icon from '../../../../../../../internal/Icon';
import Typography from '../../../../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../../../../internal/Typography/types';
import { uuid } from '../../../../../../../../utils';

export const BillingAndShippingCheckboxField = ({
    isSeparateAddress,
    setIsSeparateAddress,
}: {
    isSeparateAddress: boolean;
    setIsSeparateAddress: Dispatch<StateUpdater<boolean>>;
}) => {
    const { i18n } = useCoreContext();
    const { setValue, getValues } = useWizardFormContext<FormValues>();
    const isSeparateAddressInputId = uuid();

    const toggleBillingAndShippingAddress = useCallback(() => {
        setIsSeparateAddress(prev => {
            setValue('billingAddress', !prev ? undefined : getValues('shippingAddress'));
            return !prev;
        });
    }, [getValues, setIsSeparateAddress, setValue]);

    return (
        <div>
            <input type="checkbox" className="adyen-pe-visually-hidden" id={isSeparateAddressInputId} onInput={toggleBillingAndShippingAddress} />
            <label className="adyen-pe-pay-by-link-creation-form__form-field-checkbox" htmlFor={isSeparateAddressInputId}>
                {isSeparateAddress ? <Icon name="checkmark-square-fill" /> : <Icon name="square" />}
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                    {i18n.get('payByLink.linkCreation.fields.billingAndShippingSeparateAddress.label')}
                </Typography>
            </label>
        </div>
    );
};
