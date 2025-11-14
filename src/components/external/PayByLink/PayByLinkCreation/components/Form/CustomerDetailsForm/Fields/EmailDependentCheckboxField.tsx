import { FormValues } from '../../../types';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useWatch } from '../../../../../../../../hooks/form';
import Icon from '../../../../../../../internal/Icon';
import Typography from '../../../../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../../../../internal/Typography/types';
import { uuid } from '../../../../../../../../utils';
import { useEffect } from 'preact/hooks';
import cx from 'classnames';

export const EmailDependentCheckboxField = ({ name, label }: { name: 'sendLinkToShopper' | 'sendPaymentSuccessToShopper'; label: string }) => {
    const { setValue, control, getValues } = useWizardFormContext<FormValues>();

    const inputId = uuid();

    const email = useWatch(control, 'emailAddress');
    const isEmailEmpty = !(email && String(email).trim());

    const checkedValue = useWatch(control, name);
    const isChecked = !!checkedValue;

    const toggle = () => {
        if (!isEmailEmpty) {
            setValue(name, !isChecked);
        }
    };

    useEffect(() => {
        if (isEmailEmpty && isChecked) {
            setValue(name, false, { shouldDirty: false, shouldValidate: false });
        }
    }, [isEmailEmpty, isChecked, name, setValue]);

    useEffect(() => {
        if (getValues(name) === undefined) setValue(name, false);
    }, [getValues, name, setValue]);

    return (
        <div>
            <input type="checkbox" className="adyen-pe-visually-hidden" id={inputId} onInput={toggle} disabled={isEmailEmpty} />
            <label
                className={cx('adyen-pe-pay-by-link-creation-form__form-field-checkbox', {
                    ['adyen-pe-pay-by-link-creation-form__form-field-checkbox--disabled']: isEmailEmpty,
                })}
                htmlFor={inputId}
            >
                {isEmailEmpty ? (
                    <Icon className="adyen-pe-pay-by-link-creation-form__form-field-checkbox--disabled" name="checkbox-disabled" />
                ) : isChecked ? (
                    <Icon name="checkmark-square-fill" />
                ) : (
                    <Icon name="square" />
                )}
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                    {label}
                </Typography>
            </label>
        </div>
    );
};
