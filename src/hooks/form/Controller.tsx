import { useEffect, useReducer, useCallback } from 'preact/hooks';
import { ControllerProps, ControllerFieldState, FormState, InternalFormControl, FieldValues } from './types';
import { validateFieldWithRaceConditionHandling, getNestedValue } from './useForm';

export function Controller<TFieldValues>({ name, control, rules, render }: ControllerProps<TFieldValues>) {
    const [, rerender] = useReducer<number, void>(x => x + 1, 0);

    // Cast to internal control for implementation access
    const internalControl = control as InternalFormControl<TFieldValues>;

    useEffect(() => {
        const unsubscribe = control.subscribe(() => {
            // Trigger re-render when control state changes
            rerender();
        });

        if (rules) {
            internalControl._fieldRules.set(name, rules);
        }

        return () => {
            unsubscribe();
            internalControl._fieldRules.delete(name);
        };
    }, [control, internalControl, name, rules]);

    const value = internalControl._values.get(name);

    const fieldState: ControllerFieldState = {
        error: internalControl._errors.get(name),
        isTouched: internalControl._touched.get(name) || false,
        isDirty: internalControl._dirty.get(name) || false,
    };

    const formState: FormState<TFieldValues> = {
        dirtyFields: internalControl._computedDirtyFields,
        isSubmitting: internalControl._isSubmitting,
        isValid: Object.keys(internalControl._computedErrors).length === 0 && !internalControl._isSubmitting,
        errors: internalControl._computedErrors,
    };

    const handleChange = useCallback(
        (value: any) => {
            let newValue = value;
            if (value && typeof value === 'object' && 'target' in value) {
                const target = value.target as any;
                switch (target.type) {
                    case 'checkbox':
                        newValue = target.checked;
                        break;
                    case 'file':
                        newValue = target.files;
                        break;
                    case 'select-multiple':
                        newValue = Array.from(target.selectedOptions, (option: HTMLOptionElement) => option.value);
                        break;
                    default:
                        newValue = target.value;
                }
            }

            const defaultValue = getNestedValue(internalControl._defaultValues, name as string);
            const isDirty = newValue !== defaultValue;

            internalControl._values.set(name, newValue);
            internalControl._dirty.set(name, isDirty);

            // Update computed state
            if (isDirty) {
                internalControl._computedDirtyFields[name as FieldValues<TFieldValues>] = true;
            } else {
                delete internalControl._computedDirtyFields[name];
            }

            const mode = internalControl._options.mode || 'onBlur';
            if (mode === 'onInput' || mode === 'all') {
                void validateFieldWithRaceConditionHandling(internalControl, name, newValue, rules);
            }

            control.notify();
        },
        [control, internalControl, name, rules]
    );

    const handleBlur = useCallback(() => {
        internalControl._touched.set(name, true);

        // Update computed state
        internalControl._computedTouchedFields[name] = true;

        const value = internalControl._values.get(name);
        void validateFieldWithRaceConditionHandling(internalControl, name, value, rules);

        control.notify();
    }, [control, internalControl, name, rules]);

    const field = {
        name,
        value,
        onInput: handleChange,
        onBlur: handleBlur,
    };

    useEffect(() => {
        return () => {
            internalControl._validationCounters.delete(name);
        };
    }, [internalControl, name]);

    return render({
        field,
        fieldState,
        formState,
    });
}
