import { PBLFormValues } from '../../../types';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useCallback, useMemo } from 'preact/hooks';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { CurrencyInput } from '../../../../../../../internal/FormFields/CurrencyInput/CurrencyInput';
import { VisibleField } from '../../../../../../../internal/FormWrappers/VisibleField';
import FormField from '../../../../../../../internal/FormWrappers/FormField';
import { Controller } from '../../../../../../../../hooks/form';
import { FieldError } from '../../../../../../../internal/FormFields/FieldError/FieldError';

const VALUE_FIELD_NAME = 'amount.value';
const CURRENCY_FIELD_NAME = 'amount.currency';
const MAX_AMOUNT = 10_000_000_000_000; // 10 billion

export const AmountField = () => {
    const { i18n } = useCoreContext();
    const { control, setValue, getValues, fieldsConfig, trigger } = useWizardFormContext<PBLFormValues>();

    const currencyCodeFieldVisible = useMemo(() => fieldsConfig?.[CURRENCY_FIELD_NAME]?.visible ?? false, [fieldsConfig]);

    const validate = useCallback(
        (value: string) => {
            if (Number(value) < 0) {
                return { valid: false, message: i18n.get('payByLink.linkCreation.fields.amountValue.error.negativeNumber') };
            }
            if (currencyCodeFieldVisible && !getValues(CURRENCY_FIELD_NAME)) {
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
        (value: string, isInvalid: boolean) => {
            setValue(CURRENCY_FIELD_NAME, value);
            if (isInvalid) {
                trigger(VALUE_FIELD_NAME);
            }
        },
        [setValue, trigger, getValues]
    );

    const isRequired = useMemo(() => fieldsConfig?.amount?.required, [fieldsConfig]);

    const currencyItems = useMemo(() => {
        const options = fieldsConfig?.[CURRENCY_FIELD_NAME]?.options as string[] | undefined;
        return options?.map(option => ({ id: option, name: option }));
    }, [fieldsConfig]);

    return (
        <VisibleField<PBLFormValues> name={VALUE_FIELD_NAME}>
            <FormField label={i18n.get('payByLink.linkCreation.fields.amount.label')} optional={false} supportText={undefined} className={undefined}>
                <Controller<PBLFormValues>
                    name={VALUE_FIELD_NAME}
                    control={control}
                    rules={{
                        validate,
                        required: isRequired,
                    }}
                    render={({ field, fieldState }) => {
                        const isInvalid = !!fieldState.error && fieldState.isTouched;
                        const errorMessage = fieldState.error?.message;
                        return (
                            <>
                                <CurrencyInput
                                    {...field}
                                    selectedCurrencyCode={getValues(CURRENCY_FIELD_NAME)}
                                    onCurrencyChange={value => handleCurrencyChange(value, isInvalid)}
                                    currency={getValues(CURRENCY_FIELD_NAME)}
                                    currencyItems={currencyItems}
                                    isInvalid={isInvalid}
                                    name={VALUE_FIELD_NAME}
                                    amount={field.value ? Number(field.value) : undefined}
                                    onAmountChange={field.onInput}
                                    maxValue={MAX_AMOUNT}
                                />
                                {isInvalid && errorMessage && <FieldError errorMessage={errorMessage} />}
                            </>
                        );
                    }}
                />
            </FormField>
        </VisibleField>
    );
};
