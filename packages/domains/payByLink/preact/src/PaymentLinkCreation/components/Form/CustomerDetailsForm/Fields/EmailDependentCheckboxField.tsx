import { PaymentLinkCreationFormValues } from '../../../types';
import { useWizardFormContext } from '@integration-components/hooks-preact/form/wizard/WizardFormContext';
import { useWatch } from '@integration-components/hooks-preact/form';
import Icon from '@integration-components/ui-components-preact/Icon';
import Typography from '@integration-components/ui-components-preact/Typography/Typography';
import { TypographyElement, TypographyVariant } from '@integration-components/ui-components-preact/Typography/types';
import { uuid } from '@integration-components/utils';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
import cx from 'classnames';
import { VisibleField } from '@integration-components/ui-components-preact/FormWrappers/VisibleField';
import { Tooltip } from '@integration-components/ui-components-preact/Tooltip/Tooltip';

// TODO: CURRENTLY NOT USED - Enable this feature if we decide to implement the email-dependent checkboxes
interface EmailDependentCheckboxFieldProps {
    name: 'sendLinkToShopper' | 'sendSuccessEmailToShopper';
    label: string;
}

export const EmailDependentCheckboxField = ({ name, label }: EmailDependentCheckboxFieldProps) => {
    const { setValue, control, getValues } = useWizardFormContext<PaymentLinkCreationFormValues>();

    const inputId = useMemo(() => uuid(), []);
    const email = useWatch(control, 'shopperEmail');
    const isEmailEmpty = !(email && String(email).trim());

    const checkedValue = useWatch(control, name);
    const isChecked = !!checkedValue;

    const toggle = useCallback(() => {
        if (!isEmailEmpty) {
            setValue(name, !isChecked);
        }
    }, [isEmailEmpty, setValue, name, isChecked]);

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
                    className={cx('adyen-pe-payment-link-creation-form__field-checkbox', {
                        ['adyen-pe-payment-link-creation-form__field-checkbox--disabled']: isEmailEmpty,
                    })}
                    htmlFor={inputId}
                >
                    {isEmailEmpty ? (
                        <Icon className="adyen-pe-payment-link-creation-form__field-checkbox--disabled" name="checkbox-disabled" />
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
    }, [inputId, isChecked, isEmailEmpty, label, toggle]);

    return (
        <VisibleField<PaymentLinkCreationFormValues> name={name}>
            {isEmailEmpty ? renderField() : <Tooltip content={''}>{renderField()}</Tooltip>}
        </VisibleField>
    );
};
