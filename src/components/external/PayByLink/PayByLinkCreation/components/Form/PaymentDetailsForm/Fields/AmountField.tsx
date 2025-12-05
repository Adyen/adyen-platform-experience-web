import { PBLFormValues } from '../../../types';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useCallback, useMemo } from 'preact/hooks';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { CurrencyInput } from '../../../../../../../internal/FormFields/CurrencyInput/CurrencyInput';
import { VisibleField } from '../../../../../../../internal/FormWrappers/VisibleField';
import FormField from '../../../../../../../internal/FormWrappers/FormField';
import { Controller } from '../../../../../../../../hooks/form';

export const AmountField = () => {
    const { i18n } = useCoreContext();
    const { control, setValue, getValues, fieldsConfig, trigger } = useWizardFormContext<PBLFormValues>();

    const currencyCodeFieldVisible = useMemo(() => fieldsConfig?.['amount.currency']?.visible ?? false, [fieldsConfig]);

    const validate = useCallback(
        (value: string) => {
            if (Number(value) < 0) {
                return { valid: false, message: i18n.get('payByLink.linkCreation.fields.amountValue.error.negativeNumber') };
            }
            if (currencyCodeFieldVisible && !getValues('amount.currency')) {
                return { valid: false, message: i18n.get('payByLink.linkCreation.fields.amountValue.error.currency') };
            }
            if (!value || Number(value) === 0) {
                return { valid: false, message: i18n.get('common.errors.fieldRequired') };
            }
            return { valid: true };
        },
        [i18n, getValues, currencyCodeFieldVisible]
    );

    const handleCurrencyChange = useCallback(
        (value: string) => {
            setValue('amount.currency', value);
            if (getValues('amount.value')) {
                trigger('amount.value');
            }
        },
        [setValue, trigger, getValues]
    );

    const isRequired = useMemo(() => fieldsConfig?.amount?.required, [fieldsConfig]);
    return (
        <VisibleField<PBLFormValues> name="amount.value">
            <FormField label={i18n.get('payByLink.linkCreation.fields.amount.label')} optional={false} supportText={undefined} className={undefined}>
                <Controller<PBLFormValues>
                    name="amount.value"
                    control={control}
                    rules={{
                        validate,
                        required: isRequired,
                    }}
                    render={({ field, fieldState }) => {
                        const isInvalid = !!fieldState.error && fieldState.isTouched;
                        return (
                            <>
                                <CurrencyInput
                                    {...field}
                                    selectedCurrencyCode={getValues('amount.currency')}
                                    onCurrencyChange={handleCurrencyChange}
                                    currency={getValues('amount.currency')}
                                    isInvalid={isInvalid}
                                    amount={field.value ? Number(field.value) : undefined}
                                    onAmountChange={field.onInput}
                                />
                                {isInvalid && <span className="adyen-pe-input__invalid-value">{fieldState.error?.message}</span>}
                            </>
                        );
                    }}
                />
            </FormField>
        </VisibleField>
    );
};
