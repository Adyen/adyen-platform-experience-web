import { useRef, useCallback } from 'preact/hooks';
import { UseFormOptions, UseFormReturn, InternalFormControl, FormState, FieldValue, FieldError, ValidationRules, FieldValues } from './types';
import Localization from '../../core/Localization';

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

function purgeEmptyValues<T>(obj: T): T {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.filter(item => item !== '' && item !== null) as T;

    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value === '' || value === null || value === undefined) continue;
        if (typeof value === 'object' && !Array.isArray(value)) {
            const cleaned = purgeEmptyValues(value);
            if (Object.keys(cleaned as object).length > 0) {
                result[key] = cleaned;
            }
        } else {
            result[key] = value;
        }
    }
    return result as T;
}

function flattenObject(obj: any, prefix = ''): Record<string, any> {
    const result: Record<string, any> = {};

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;

            if (
                value &&
                typeof value === 'object' &&
                !Array.isArray(value) &&
                !(value instanceof Date) &&
                !(value instanceof File) &&
                !(value instanceof FileList)
            ) {
                // Recursively flatten nested objects
                Object.assign(result, flattenObject(value, newKey));
            } else {
                result[newKey] = value;
            }
        }
    }

    return result;
}

async function validateField(value: FieldValue, rules: ValidationRules | undefined, i18n: Localization['i18n']): Promise<FieldError> {
    if (!rules) return undefined;

    if (rules.required) {
        const isEmpty = value == null || value === '' || (Array.isArray(value) && value.length === 0);
        if (isEmpty) {
            const message = typeof rules.required === 'string' ? rules.required : i18n.get('common.errors.fieldRequired');
            return { type: 'required', message };
        }
    }

    if (rules.validate) {
        try {
            const result = await rules.validate(value);
            if (!result.valid) {
                return { message: result.message, type: 'validation' };
            }
        } catch (error) {
            console.error('A custom validation function threw an error:', error);
            return { type: 'validation', message: 'Validation error occurred' };
        }
    }

    return undefined;
}

export function useForm<TFieldValues>(options: UseFormOptions<TFieldValues>): UseFormReturn<TFieldValues> {
    const { defaultValues = {} as Partial<TFieldValues>, i18n } = options;

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
            setValue: (
                name: FieldValues<TFieldValues>,
                value: FieldValue,
                options?: { shouldValidate?: boolean; shouldDirty?: boolean; shouldTouch?: boolean }
            ) => {
                const defaultValue = getNestedValue(control._defaultValues, name as string);
                const isDirty = value !== defaultValue;

                control._values.set(name, value);

                if (options?.shouldDirty !== false) {
                    control._dirty.set(name, isDirty);
                    if (isDirty) {
                        control._computedDirtyFields[name] = true;
                    } else {
                        delete control._computedDirtyFields[name];
                    }
                }

                if (options?.shouldTouch) {
                    control._touched.set(name, true);
                    control._computedTouchedFields[name] = true;
                }

                const modeToUse = control._options.mode || 'onBlur';
                if (options?.shouldValidate !== false && (modeToUse === 'onInput' || modeToUse === 'all' || options?.shouldValidate)) {
                    void validateFieldWithRaceConditionHandling({ control, name, value, rules: control._fieldRules.get(name), i18n });
                }

                control.notify();
            },
            setTouched: (name: FieldValues<TFieldValues>, touched: boolean) => {
                control._touched.set(name, touched);
                if (touched) {
                    control._computedTouchedFields[name] = true;
                } else {
                    delete control._computedTouchedFields[name];
                }
                control.notify();
            },
            getValue: (name: FieldValues<TFieldValues>) => {
                return control._values.get(name);
            },
            getFieldState: (name: FieldValues<TFieldValues>) => {
                return {
                    error: control._errors.get(name),
                    isTouched: control._touched.get(name) || false,
                    isDirty: control._dirty.get(name) || false,
                };
            },
            getFormState: () => {
                const hasErrors = Object.keys(control._computedErrors).length > 0;
                const isValid = !hasErrors && !control._isSubmitting;
                return {
                    dirtyFields: control._computedDirtyFields,
                    touchedFields: control._computedTouchedFields,
                    isSubmitting: control._isSubmitting,
                    isValid,
                    errors: control._computedErrors,
                } as FormState<TFieldValues>;
            },
            register: (name: FieldValues<TFieldValues>, rules: ValidationRules) => {
                control._fieldRules.set(name, rules);
                return () => {
                    control._fieldRules.delete(name);
                    control._validationCounters.delete(name);
                };
            },
            trigger: async (name?: FieldValues<TFieldValues> | FieldValues<TFieldValues>[]) => {
                const fieldsToValidate = name ? (Array.isArray(name) ? name : [name]) : Array.from(control._values.keys());

                let hasTouchedChanged = false;
                fieldsToValidate.forEach(fieldName => {
                    if (!control._touched.has(fieldName)) {
                        control._touched.set(fieldName, true);
                        control._computedTouchedFields[fieldName as FieldValues<TFieldValues>] = true;
                        hasTouchedChanged = true;
                    }
                });

                if (hasTouchedChanged) {
                    control.notify();
                }

                const validationPromises = fieldsToValidate.map(async fieldName => {
                    const value = control._values.get(fieldName)!;
                    const rules = control._fieldRules.get(fieldName);

                    if (rules) {
                        await validateFieldWithRaceConditionHandling({ control, name: fieldName, value, rules, i18n });
                    }

                    return !control._errors.has(fieldName);
                });

                const results = await Promise.all(validationPromises);
                return results.every(result => result);
            },
        };

        // Flatten defaultValues to support nested objects
        const flattenedDefaults = flattenObject(defaultValues);
        Object.entries(flattenedDefaults).forEach(([key, value]) => {
            control._values.set(key as FieldValues<TFieldValues>, value);
        });

        controlRef.current = control;
    }

    const control = controlRef.current;

    const errors = control._computedErrors;
    const dirtyFields = control._computedDirtyFields;
    const touchedFields = control._computedTouchedFields;

    const hasErrors = Object.keys(errors).length > 0;
    const isValid = !hasErrors && !control._isSubmitting;

    const formState: FormState<TFieldValues> = {
        dirtyFields,
        touchedFields,
        isSubmitting: control._isSubmitting,
        isValid,
        errors,
    };

    const setValue = useCallback(
        (
            name: FieldValues<TFieldValues>,
            value: FieldValue,
            options?: { shouldValidate?: boolean; shouldDirty?: boolean; shouldTouch?: boolean }
        ) => {
            control.setValue(name, value, options);
        },
        [control]
    );

    const getValues = useCallback(
        (name?: FieldValues<TFieldValues>): any => {
            if (name) {
                return control._values.get(name);
            }

            const values = {} as TFieldValues;
            control._values.forEach((value, key) => {
                setNestedValue(values, key as string, value);
            });
            return values;
        },
        [control]
    );

    const reset = useCallback(
        (values?: Partial<TFieldValues>) => {
            const resetValues = values || control._defaultValues;

            // If custom values provided, update defaultValues so dirty checks compare to new baseline
            if (values) {
                control._defaultValues = values;
            }

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
                control._values.set(key as FieldValues<TFieldValues>, value);
            });

            control._isSubmitting = false;
            control.notify();
        },
        [control]
    );

    const trigger = useCallback(
        async (name?: FieldValues<TFieldValues> | FieldValues<TFieldValues>[]): Promise<boolean> => {
            return control.trigger(name);
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
                        const data = purgeEmptyValues(getValues());
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

export async function validateFieldWithRaceConditionHandling<TFieldValues>({
    control,
    i18n,
    name,
    value,
    rules,
}: {
    control: InternalFormControl<TFieldValues>;
    i18n: Localization['i18n'];
    name: FieldValues<TFieldValues>;
    value: FieldValue;
    rules?: ValidationRules;
}): Promise<void> {
    const currentCounter = (control._validationCounters.get(name) || 0) + 1;
    control._validationCounters.set(name, currentCounter);

    try {
        const error = await validateField(value, rules, i18n);

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
            const errorObj = { type: 'validation', message: 'Validation error' } as const;
            control._errors.set(name, errorObj);
            control._computedErrors[name] = errorObj;
            control.notify();
        }
    }
}
