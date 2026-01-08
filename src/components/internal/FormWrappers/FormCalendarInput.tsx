import { useMemo } from 'preact/hooks';
import { Controller } from '../../../hooks/form';
import { FieldValues } from '../../../hooks/form/types';
import { useWizardFormContext } from '../../../hooks/form/wizard/WizardFormContext';
import FormField from './FormField';
import { CalendarInput } from '../FormFields/CalendarInput/CalendarInput';
import { VisibleField } from './VisibleField';
import { FieldError } from '../FormFields/FieldError/FieldError';

interface FormCalendarInputProps<TFieldValues> {
    clearable?: boolean;
    fieldName: FieldValues<TFieldValues>;
    label: string;
}

export function FormCalendarInput<TFieldValues>({ clearable, fieldName, label }: FormCalendarInputProps<TFieldValues>) {
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
                                    clearable={clearable}
                                />
                                {fieldState.error?.message && <FieldError errorMessage={fieldState.error?.message} withTopMargin />}
                            </div>
                        );
                    }}
                />
            </FormField>
        </VisibleField>
    );
}
