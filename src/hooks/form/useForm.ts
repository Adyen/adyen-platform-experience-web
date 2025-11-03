import { useRef, useCallback } from 'preact/hooks';
import {
    UseFormOptions,
    UseFormReturn,
    InternalFormControl,
    FormState,
    FieldValue,
    FieldError,
    FieldPath,
    ValidationRules,
    ValidationResult,
} from './types';

export function getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
        if (result == null) return undefined;
        result = result[key];
    }
    return result;
}

export function setNestedValue(obj: any, path: string, value: any): void {
    if (!path) {
        return;
    }
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    let current = obj;
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]!;
        if (typeof current[key] !== 'object' || current[key] === null) {
            const nextKey = keys[i + 1];
            // Create an array if the next key is a number, otherwise an object
            current[key] = nextKey !== undefined && /^\d+$/.test(nextKey) ? [] : {};
        }
        current = current[key];
    }
    current[lastKey] = value;
}

function flattenObject(obj: any, prefix = ''): Record<string, any> {
    const result: Record<string, any> = {};

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;

            if (value && typeof value === 'object' && !(value instanceof Date) && !(value instanceof File) && !(value instanceof FileList)) {
                // Recursively flatten nested objects
                Object.assign(result, flattenObject(value, newKey));
            } else {
                result[newKey] = value;
            }
        }
    }

    return result;
}

async function validateField(value: any, rules: ValidationRules | undefined): Promise<FieldError> {
    if (!rules) return undefined;

    if (rules.required) {
        const isEmpty = value == null || value === '' || (Array.isArray(value) && value.length === 0);
        if (isEmpty) {
            const message = typeof rules.required === 'string' ? rules.required : 'This field is required';
            return { type: 'required', message };
        }
    }

    if (rules.minLength != null && typeof value === 'string') {
        const minLengthConfig =
            typeof rules.minLength === 'number' ? { value: rules.minLength, message: `Minimum length is ${rules.minLength}` } : rules.minLength;
        if (value.length < minLengthConfig.value) {
            return { type: 'minLength', message: minLengthConfig.message };
        }
    }

    if (rules.maxLength != null && typeof value === 'string') {
        const maxLengthConfig =
            typeof rules.maxLength === 'number' ? { value: rules.maxLength, message: `Maximum length is ${rules.maxLength}` } : rules.maxLength;
        if (value.length > maxLengthConfig.value) {
            return { type: 'maxLength', message: maxLengthConfig.message };
        }
    }

    if (rules.pattern && typeof value === 'string') {
        const patternConfig = rules.pattern instanceof RegExp ? { value: rules.pattern, message: 'Invalid format' } : rules.pattern;
        if (!patternConfig.value.test(value)) {
            return { type: 'pattern', message: patternConfig.message };
        }
    }

    if (rules.validate) {
        try {
            let validationFunctions: Record<string, (value: any) => ValidationResult | Promise<ValidationResult>>;

            if (typeof rules.validate === 'function') {
                validationFunctions = { validate: rules.validate };
            } else {
                validationFunctions = rules.validate;
            }

            for (const [key, validateFn] of Object.entries(validationFunctions)) {
                const result = await validateFn(value);
                if (result !== true && result != null) {
                    return { type: key, message: typeof result === 'string' ? result : 'Validation failed' };
                }
            }
        } catch (error) {
            console.error('A custom validation function threw an error:', error);
            return { type: 'validate', message: 'Validation error occurred' };
        }
    }

    return undefined;
}

export function useForm<TFieldValues = Record<string, any>>(options: UseFormOptions<TFieldValues> = {}): UseFormReturn<TFieldValues> {
    const { defaultValues = {} as Partial<TFieldValues>, mode = 'onBlur' } = options;

    const controlRef = useRef<InternalFormControl<TFieldValues>>();

    if (!controlRef.current) {
        const control: InternalFormControl<TFieldValues> = {
            _values: new Map(),
            _errors: new Map(),
            _touched: new Map(),
            _dirty: new Map(),
            _subscribers: new Set(),
            _validationCounters: new Map(),
            _fieldRules: new Map(),
            _options: options,
            _defaultValues: defaultValues,
            _isSubmitting: false,
            _computedErrors: {},
            _computedTouchedFields: {},
            _computedDirtyFields: {},
            subscribe: (callback: () => void) => {
                control._subscribers.add(callback);
                return () => control._subscribers.delete(callback);
            },
            notify: () => {
                control._subscribers.forEach(cb => cb());
            },
        };

        // Flatten defaultValues to support nested objects
        const flattenedDefaults = flattenObject(defaultValues);
        Object.entries(flattenedDefaults).forEach(([key, value]) => {
            control._values.set(key, value);
        });

        controlRef.current = control;
    }

    const control = controlRef.current;

    const errors = control._computedErrors;
    const touchedFields = control._computedTouchedFields;
    const dirtyFields = control._computedDirtyFields;

    const hasErrors = Object.keys(errors).length > 0;
    const isValid = !hasErrors && !control._isSubmitting;

    const formState: FormState = {
        errors,
        touchedFields,
        dirtyFields,
        isSubmitting: control._isSubmitting,
        isValid,
    };

    const setValue = useCallback(
        (name: FieldPath, value: FieldValue, options?: { shouldValidate?: boolean; shouldDirty?: boolean; shouldTouch?: boolean }) => {
            const defaultValue = getNestedValue(control._defaultValues, name);
            const isDirty = value !== defaultValue;

            control._values.set(name, value);

            if (options?.shouldDirty !== false) {
                control._dirty.set(name, isDirty);
                // Update computed state
                if (isDirty) {
                    control._computedDirtyFields[name] = true;
                } else {
                    delete control._computedDirtyFields[name];
                }
            }

            if (options?.shouldTouch) {
                control._touched.set(name, true);
                // Update computed state
                control._computedTouchedFields[name] = true;
            }

            if (options?.shouldValidate !== false && (mode === 'onInput' || mode === 'all' || options?.shouldValidate)) {
                void validateFieldWithRaceConditionHandling(control, name, value, control._fieldRules.get(name));
            }

            control.notify();
        },
        [control, mode]
    );

    const getValues = useCallback(
        (name?: FieldPath): any => {
            if (name) {
                return control._values.get(name);
            }

            const values = {} as TFieldValues;
            control._values.forEach((value, key) => {
                setNestedValue(values, key, value);
            });
            return values;
        },
        [control]
    );

    const reset = useCallback(
        (values?: Partial<TFieldValues>) => {
            const resetValues = values || control._defaultValues;

            control._values.clear();
            control._errors.clear();
            control._touched.clear();
            control._dirty.clear();
            control._validationCounters.clear();

            // Clear computed state objects
            control._computedErrors = {};
            control._computedTouchedFields = {};
            control._computedDirtyFields = {};

            // Flatten resetValues to support nested objects
            const flattenedResetValues = flattenObject(resetValues);
            Object.entries(flattenedResetValues).forEach(([key, value]) => {
                control._values.set(key, value);
            });

            control._isSubmitting = false;
            control.notify();
        },
        [control]
    );

    const trigger = useCallback(
        async (name?: FieldPath | FieldPath[]): Promise<boolean> => {
            const fieldsToValidate = name ? (Array.isArray(name) ? name : [name]) : Array.from(control._values.keys());

            let hasTouchedChanged = false;
            fieldsToValidate.forEach(fieldName => {
                if (!control._touched.has(fieldName)) {
                    control._touched.set(fieldName, true);
                    control._computedTouchedFields[fieldName] = true;
                    hasTouchedChanged = true;
                }
            });

            if (hasTouchedChanged) {
                control.notify();
            }

            const validationPromises = fieldsToValidate.map(async fieldName => {
                const value = control._values.get(fieldName);
                const rules = control._fieldRules.get(fieldName);

                if (rules) {
                    await validateFieldWithRaceConditionHandling(control, fieldName, value, rules);
                }

                return !control._errors.has(fieldName);
            });

            const results = await Promise.all(validationPromises);
            return results.every(result => result);
        },
        [control]
    );

    const handleSubmit = useCallback(
        (onValid: (data: TFieldValues) => void | Promise<void>, onInvalid?: (errors: Record<string, FieldError>) => void) => {
            return async (e?: Event) => {
                if (e && e.preventDefault) {
                    e.preventDefault();
                }

                control._isSubmitting = true;
                control.notify();

                try {
                    // Trigger validation for all fields
                    const isValid = await trigger();

                    if (isValid) {
                        const data = getValues();
                        await onValid(data);
                    } else if (onInvalid) {
                        onInvalid(control._computedErrors);
                    }
                } finally {
                    control._isSubmitting = false;
                    control.notify();
                }
            };
        },
        [control, trigger, getValues]
    );

    return {
        control,
        handleSubmit,
        setValue,
        getValues,
        reset,
        formState,
        trigger,
    };
}

export async function validateFieldWithRaceConditionHandling<TFieldValues>(
    control: InternalFormControl<TFieldValues>,
    name: string,
    value: any,
    rules?: ValidationRules
): Promise<void> {
    const currentCounter = (control._validationCounters.get(name) || 0) + 1;
    control._validationCounters.set(name, currentCounter);

    try {
        const error = await validateField(value, rules);

        if (control._validationCounters.get(name) === currentCounter) {
            if (error) {
                control._errors.set(name, error);
                control._computedErrors[name] = error;
            } else {
                control._errors.delete(name);
                delete control._computedErrors[name];
            }
            control.notify();
        }
    } catch (err) {
        if (control._validationCounters.get(name) === currentCounter) {
            const errorObj = { type: 'validate', message: 'Validation error' };
            control._errors.set(name, errorObj);
            control._computedErrors[name] = errorObj;
            control.notify();
        }
    }
}
