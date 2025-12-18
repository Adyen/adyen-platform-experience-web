import { PBLFormValues } from '../../../types';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useWatch } from '../../../../../../../../hooks/form';
import Icon from '../../../../../../../internal/Icon';
import Typography from '../../../../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../../../../internal/Typography/types';
import { uuid } from '../../../../../../../../utils';
import { useCallback, useEffect } from 'preact/hooks';
import cx from 'classnames';
import { VisibleField } from '../../../../../../../internal/FormWrappers/VisibleField';
import { Tooltip } from '../../../../../../../internal/Tooltip/Tooltip';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';

interface EmailDependentCheckboxFieldProps {
    name: 'sendLinkToShopper' | 'sendSuccessEmailToShopper';
    label: string;
}

export const EmailDependentCheckboxField = ({ name, label }: EmailDependentCheckboxFieldProps) => {
    const { setValue, control, getValues } = useWizardFormContext<PBLFormValues>();
    const { i18n } = useCoreContext();

    const inputId = uuid();

    const email = useWatch(control, 'shopperEmail');
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

    const renderField = useCallback(() => {
        return (
            <div>
                <input type="checkbox" className="adyen-pe-visually-hidden" id={inputId} onInput={toggle} disabled={isEmailEmpty} />
                <label
                    className={cx('adyen-pe-pay-by-link-creation-form__field-checkbox', {
                        ['adyen-pe-pay-by-link-creation-form__field-checkbox--disabled']: isEmailEmpty,
                    })}
                    htmlFor={inputId}
                >
                    {isEmailEmpty ? (
                        <Icon className="adyen-pe-pay-by-link-creation-form__field-checkbox--disabled" name="checkbox-disabled" />
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
    }, []);

    return (
        <VisibleField<PBLFormValues> name={name}>
            {isEmailEmpty ? (
                renderField()
            ) : (
                <Tooltip content={i18n.get('capital.common.fields.repaymentThreshold.description')}>{renderField()}</Tooltip>
            )}
        </VisibleField>
    );
};
