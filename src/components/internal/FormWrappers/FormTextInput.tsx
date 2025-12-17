import { h } from 'preact';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { useWizardFormContext } from '../../../hooks/form/wizard/WizardFormContext';
import FormField from './FormField';
import { Controller } from '../../../hooks/form';
import InputBase from '../FormFields/InputBase';
import { FieldValues, ValidationRules } from '../../../hooks/form/types';
import { InputFieldDropdownProps } from '../FormFields/types';
import { VisibleField } from './VisibleField';
import { TargetedEvent } from 'preact/compat';
import useCoreContext from '../../../core/Context/useCoreContext';

interface FormTextInputProps<TFieldValues> {
    fieldName: FieldValues<TFieldValues>;
    label: string;
    dropdown?: InputFieldDropdownProps;
    className?: string;
    isRequired?: boolean;
    min?: number;
    onInput?: (e: TargetedEvent<HTMLInputElement, Event>) => void;
    onDropdownInput?: (value: string) => void;
    supportText?: string;
    type?: string;
    validate?: ValidationRules['validate'];
    maxLength?: number;
    minLength?: number;
    dropdownPosition?: 'start' | 'end';
    hideOptionalLabel?: boolean;
}

export function FormTextInput<TFieldValues>({
    className,
    dropdown,
    fieldName,
    isRequired: isRequiredProp,
    label,
    onDropdownInput,
    onInput,
    supportText,
    type,
    validate,
    min,
    maxLength,
    minLength,
    dropdownPosition,
    hideOptionalLabel,
}: FormTextInputProps<TFieldValues>) {
    const { control, fieldsConfig } = useWizardFormContext<TFieldValues>();
    const { i18n } = useCoreContext();

    const isRequired = useMemo(() => isRequiredProp ?? fieldsConfig[fieldName]?.required, [fieldsConfig, isRequiredProp]);

    const handleInput = useCallback(
        (e: TargetedEvent<HTMLInputElement, Event>, onInputHandler: (value: string) => void) => {
            onInput?.(e);
            onInputHandler(e.currentTarget.value);
        },
        [onInput]
    );
    const handleValidate: ValidationRules['validate'] = useCallback(
        (value: string) => {
            const isBelowMinLength = minLength && value?.length < minLength;

            if (!value && !isRequired) {
                return { valid: true };
            }
            if (isBelowMinLength) {
                return { valid: false, message: i18n.get('common.errors.minLength', { values: { minLength } }) };
            }
            return validate?.(value) ?? { valid: true };
        },
        [i18n, minLength, validate]
    );

    return (
        <VisibleField name={fieldName}>
            <FormField label={label} optional={!isRequired && !hideOptionalLabel} supportText={supportText} className={className}>
                <Controller<TFieldValues>
                    name={fieldName}
                    control={control}
                    rules={{
                        validate: handleValidate,
                        required: isRequired,
                    }}
                    render={({ field, fieldState }) => {
                        const isInvalid = !!fieldState.error && fieldState.isTouched;

                        useEffect(() => {
                            if (isInvalid) {
                                control.trigger(fieldName);
                            }
                        }, [isRequired]);

                        return (
                            <InputBase
                                {...field}
                                value={field.value}
                                maxLength={maxLength}
                                minLength={minLength}
                                isValid={!fieldState.error}
                                isInvalid={isInvalid}
                                errorMessage={fieldState.error?.message}
                                onDropdownInput={(...params) => {
                                    onDropdownInput?.(...params);
                                    if (isInvalid) {
                                        field.triggerValidation();
                                    }
                                }}
                                onInput={e => handleInput(e, field.onInput)}
                                type={type}
                                min={min}
                                dropdown={dropdown}
                                dropdownPosition={dropdownPosition}
                            />
                        );
                    }}
                />
            </FormField>
        </VisibleField>
    );
}
