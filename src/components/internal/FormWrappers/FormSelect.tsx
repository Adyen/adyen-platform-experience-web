import { useEffect, useMemo } from 'preact/hooks';
import { Controller } from '../../../hooks/form';
import Select from '../FormFields/Select';
import { useWizardFormContext } from '../../../hooks/form/wizard/WizardFormContext';
import { FieldValues, ValidationRules } from '../../../hooks/form/types';
import FormField from './FormField';
import { VisibleField } from './VisibleField';
import { SelectChangeEvent } from '../FormFields/Select/types';
import { FieldError } from '../FormFields/FieldError/FieldError';

interface FormSelectProps<TFieldValues> {
    fieldName: FieldValues<TFieldValues>;
    label: string;
    items: { id: string; name: string }[];
    readonly?: boolean;
    filterable?: boolean;
    hideOptionalLabel?: boolean;
    className?: string;
    isRequired?: boolean;
    validate?: ValidationRules['validate'];
    onChange?: (e: SelectChangeEvent) => void;
    clearable?: boolean;
    preventInvalidState?: boolean;
}

export function FormSelect<TFieldValues>({
    className,
    clearable,
    fieldName,
    filterable,
    hideOptionalLabel,
    isRequired: isRequiredProp,
    items,
    label,
    onChange,
    preventInvalidState,
    readonly,
    validate,
}: FormSelectProps<TFieldValues>) {
    const { control, fieldsConfig, getValues, setValue } = useWizardFormContext<TFieldValues>();
    const isRequired = useMemo(() => isRequiredProp ?? fieldsConfig[fieldName]?.required, [fieldsConfig, isRequiredProp]);

    useEffect(() => {
        if (!items.length) return;
        const currentValue = getValues(fieldName);

        if (currentValue && !items.some(item => item.id === currentValue)) {
            setValue(fieldName, '');
        }
    }, [getValues, setValue, items]);

    useEffect(() => {
        if (items && items.length === 1) {
            setValue(fieldName, items[0]?.id);
        }
    }, [items, setValue, fieldName]);

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
                        const handleChange = (e: SelectChangeEvent) => {
                            const value = (e.target as HTMLSelectElement).value;
                            field.onInput(value);
                            onChange?.(e);
                        };
                        const isInvalid = !!fieldState.error && fieldState.isTouched;

                        return (
                            <div>
                                <Select
                                    {...field}
                                    isInvalid={preventInvalidState ? false : isInvalid}
                                    isValid={!fieldState.error}
                                    items={items}
                                    filterable={filterable}
                                    clearable={clearable}
                                    name={fieldName}
                                    onChange={handleChange}
                                    readonly={readonly}
                                    selected={field.value as string}
                                    setToTargetWidth
                                />
                                {isInvalid && fieldState.error?.message && <FieldError errorMessage={fieldState.error?.message} withTopMargin />}
                            </div>
                        );
                    }}
                />
            </FormField>
        </VisibleField>
    );
}
