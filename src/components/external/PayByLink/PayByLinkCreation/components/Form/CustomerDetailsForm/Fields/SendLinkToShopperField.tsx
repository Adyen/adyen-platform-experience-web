import { FormValues } from '../../../types';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useWatch } from '../../../../../../../../hooks/form';
import Icon from '../../../../../../../internal/Icon';
import Typography from '../../../../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../../../../internal/Typography/types';
import { uuid } from '../../../../../../../../utils';
import { useEffect, useState } from 'preact/hooks';
import cx from 'classnames';

export const SendLinkToShopperField = () => {
    const { i18n } = useCoreContext();
    const { setValue, control } = useWizardFormContext<FormValues>();
    const isSeparateAddressInputId = uuid();

    const [sendLinkToShopper, setSendLinkToShopper] = useState(false);
    const email = useWatch(control, 'emailAddress');
    const isEmailEmpty = !(email && String(email).trim());

    const toggleSendLinkToShopper = () => {
        if (!isEmailEmpty) {
            setSendLinkToShopper(prev => {
                setValue('sendLinkToShopper', !prev);
                return !prev;
            });
        }
    };

    useEffect(() => {
        if (isEmailEmpty && sendLinkToShopper) {
            setSendLinkToShopper(false);
            setValue('sendLinkToShopper', false, { shouldDirty: false, shouldValidate: false });
        }
    }, [isEmailEmpty, sendLinkToShopper, setValue]);

    return (
        <div>
            <input
                type="checkbox"
                className="adyen-pe-visually-hidden"
                id={isSeparateAddressInputId}
                onInput={toggleSendLinkToShopper}
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
                ) : sendLinkToShopper ? (
                    <Icon name="checkmark-square-fill" />
                ) : (
                    <Icon name="square" />
                )}
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                    {i18n.get('payByLink.linkCreation.fields.sendLinkToShopper.label')}
                </Typography>
            </label>
        </div>
    );
};
