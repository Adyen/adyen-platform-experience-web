import { useMemo } from 'preact/hooks';
import { Controller } from '../../../hooks/form';
import { FieldValues } from '../../../hooks/form/types';
import { useWizardFormContext } from '../../../hooks/form/wizard/WizardFormContext';
import FormField from './FormField';
import { CalendarInput } from '../FormFields/CalendarInput/CalendarInput';
import { VisibleField } from './VisibleField';

interface FormCalendarInputProps<TFieldValues> {
    fieldName: FieldValues<TFieldValues>;
    label: string;
    timezone?: string;
}

export function FormCalendarInput<TFieldValues>({ fieldName, label, timezone }: FormCalendarInputProps<TFieldValues>) {
    const { control, fieldsConfig } = useWizardFormContext<TFieldValues>();

    const isRequired = useMemo(() => fieldsConfig[fieldName]?.required, [fieldsConfig]);

    return (
        <VisibleField name={fieldName}>
            <FormField label={label} optional={!isRequired}>
                <Controller<TFieldValues>
                    name={fieldName}
                    control={control}
                    rules={{
                        required: isRequired,
                    }}
                    render={({ field, fieldState }) => {
                        return (
                            <div>
                                <CalendarInput
                                    value={field.value as string}
                                    onInput={field.onInput}
                                    isInvalid={!!fieldState.error && fieldState.isTouched}
                                    timezone={timezone}
                                />
                                <span className="adyen-pe-input__invalid-value">{fieldState.error?.message}</span>
                            </div>
                        );
                    }}
                />
            </FormField>
        </VisibleField>
    );
}
