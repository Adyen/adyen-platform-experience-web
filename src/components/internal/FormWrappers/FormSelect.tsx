import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { Controller } from '../../../hooks/form';
import Select from '../FormFields/Select';
import { useWizardFormContext } from '../../../hooks/form/wizard/WizardFormContext';
import { FieldValues, ValidationRules } from '../../../hooks/form/types';
import FormField from './FormField';
import { VisibleField } from './VisibleField';
import { TargetedEvent } from 'preact/compat';

interface FormSelectProps<TFieldValues> {
    fieldName: FieldValues<TFieldValues>;
    label: string;
    items: { id: string; name: string }[];
    readonly?: boolean;
    filterable?: boolean;
    hideOptionalLabel?: boolean;
    className?: string;
    validate?: ValidationRules['validate'];
    onChange?: (e: TargetedEvent<HTMLSelectElement>) => void;
    preventInvalidState?: boolean;
}

export function FormSelect<TFieldValues>({
    className,
    fieldName,
    filterable,
    hideOptionalLabel,
    items,
    label,
    onChange,
    preventInvalidState,
    readonly,
    validate,
}: FormSelectProps<TFieldValues>) {
    const { control, fieldsConfig, getValues, setValue } = useWizardFormContext<TFieldValues>();
    const isRequired = useMemo(() => fieldsConfig[fieldName]?.required, [fieldsConfig]);

    useEffect(() => {
        if (!items.length) return;
        const currentValue = getValues(fieldName);

        if (currentValue && !items.some(item => item.id === currentValue)) {
            setValue(fieldName, '');
        }
    }, [getValues, setValue, items]);

    return (
        <VisibleField name={fieldName}>
            <FormField label={label} optional={!isRequired && !hideOptionalLabel} className={className}>
                <Controller<TFieldValues>
                    name={fieldName}
                    control={control}
                    rules={{
                        required: isRequired,
                        validate,
                    }}
                    render={({ field, fieldState }) => {
                        const handleChange = (e: TargetedEvent<HTMLSelectElement>) => {
                            const value = (e.target as HTMLSelectElement).value;
                            field.onInput(value);
                            onChange?.(e);
                        };
                        const isInvalid = !!fieldState.error && fieldState.isTouched;
                        return (
                            <div>
                                <Select
                                    {...field}
                                    selected={field.value as string}
                                    onChange={handleChange}
                                    items={items}
                                    readonly={readonly}
                                    isValid={!fieldState.error}
                                    isInvalid={preventInvalidState ? false : isInvalid}
                                    filterable={filterable}
                                />
                                {isInvalid && <span className="adyen-pe-input__invalid-value">{fieldState.error?.message}</span>}
                            </div>
                        );
                    }}
                />
            </FormField>
        </VisibleField>
    );
}
