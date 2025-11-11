import { Controller } from '../../../../../../../../hooks/form';
import { FormValues } from '../../../types';
import FormField from '../../FormField';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useCallback, useMemo } from 'preact/hooks';
import InputBase from '../../../../../../../internal/FormFields/InputBase';
import { CurrencyDTO } from '../../../../../../../../types/api/models/currencies';

const CURRENCIES: CurrencyDTO[] = ['EUR', 'USD'];

export const AmountField = () => {
    const { i18n } = useCoreContext();
    const { control, setValue, fieldsConfig } = useWizardFormContext<FormValues>();

    const isRequired = useMemo(() => fieldsConfig['amountValue']?.required, [fieldsConfig]);

    const currencyDropdown = useMemo(() => {
        return CURRENCIES.map(currency => {
            return {
                id: currency,
                name: currency,
            };
        });
    }, []);

    const onCurrencySelect = useCallback(
        (value: string) => {
            setValue('currency', value);
        },
        [setValue]
    );

    const defaultCurrency = useMemo(() => 'EUR', []);

    return (
        <FormField label={i18n.get('payByLink.linkCreation.fields.amount.label')} optional={!isRequired}>
            <Controller<FormValues>
                name="amountValue"
                control={control}
                rules={{
                    required: isRequired,
                    validate: (value: string) => {
                        if (Number(value) < 0)
                            return { valid: false, message: i18n.get('payByLink.linkCreation.fields.amountValue.error.negativeNumber') };
                        return { valid: true };
                    },
                }}
                render={({ field, fieldState }) => {
                    return (
                        <InputBase
                            type="number"
                            min={0}
                            {...field}
                            dropdown={{ items: currencyDropdown, value: defaultCurrency }}
                            onDropdownInput={onCurrencySelect}
                            isValid={false}
                            isInvalid={!!fieldState.error}
                            errorMessage={fieldState.error?.message}
                        />
                    );
                }}
            />
        </FormField>
    );
};
