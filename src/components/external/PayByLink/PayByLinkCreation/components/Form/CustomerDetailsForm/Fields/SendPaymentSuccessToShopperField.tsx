import { FormValues } from '../../../types';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useWatch } from '../../../../../../../../hooks/form';
import { useEffect, useState } from 'preact/hooks';
import Icon from '../../../../../../../internal/Icon';
import Typography from '../../../../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../../../../internal/Typography/types';
import { uuid } from '../../../../../../../../utils';
import cx from 'classnames';

export const SendPaymentSuccessToShopperField = () => {
    const { i18n } = useCoreContext();
    const { setValue, control } = useWizardFormContext<FormValues>();
    const isSeparateAddressInputId = uuid();

    const [sendPaymentSuccessToShopper, setSendPaymentSuccessToShopper] = useState(false);

    const email = useWatch(control, 'emailAddress');
    const isEmailEmpty = !(email && String(email).trim());

    const toggleSendPaymentSuccessToShopper = () => {
        if (!isEmailEmpty) {
            setSendPaymentSuccessToShopper(prev => {
                setValue('sendPaymentSuccessToShopper', !prev);
                return !prev;
            });
        }
    };

    useEffect(() => {
        if (isEmailEmpty && sendPaymentSuccessToShopper) {
            setSendPaymentSuccessToShopper(false);
            setValue('sendPaymentSuccessToShopper', false, { shouldDirty: false, shouldValidate: false });
        }
    }, [isEmailEmpty, sendPaymentSuccessToShopper, setValue]);

    return (
        <div>
            <input
                type="checkbox"
                className="adyen-pe-visually-hidden"
                id={isSeparateAddressInputId}
                onInput={toggleSendPaymentSuccessToShopper}
                disabled={isEmailEmpty}
            />
            <label
                className={cx('adyen-pe-pay-by-link-creation__form-field-checkbox', {
                    ['adyen-pe-pay-by-link-creation__form-field-checkbox--disabled']: isEmailEmpty,
                })}
                htmlFor={isSeparateAddressInputId}
            >
                {isEmailEmpty ? (
                    <Icon className="adyen-pe-pay-by-link-creation__form-field-checkbox--disabled" name="checkbox-disabled" />
                ) : sendPaymentSuccessToShopper ? (
                    <Icon name="checkmark-square-fill" />
                ) : (
                    <Icon name="square" />
                )}
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                    {i18n.get('payByLink.linkCreation.fields.sendPaymentSuccessToShopper.label')}
                </Typography>
            </label>
        </div>
    );
};
