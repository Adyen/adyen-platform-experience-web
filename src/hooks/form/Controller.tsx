import { useEffect, useReducer, useCallback } from 'preact/hooks';
import { TargetedEvent } from 'preact/compat';
import { ControllerProps, ControllerFieldState, FormState } from './types';
import { validateFieldWithRaceConditionHandling } from './useForm';

export function Controller<TFieldValues = Record<string, any>>({ name, control, rules, render }: ControllerProps<TFieldValues>) {
    const [, rerender] = useReducer<number, void>(x => x + 1, 0);

    useEffect(() => {
        const unsubscribe = control.subscribe(() => {
            // Trigger re-render when control state changes
            rerender();
        });

        if (rules) {
            control._fieldRules.set(name, rules);
        }

        return () => {
            unsubscribe();
            control._fieldRules.delete(name);
        };
    }, [control, name, rules]);

    const value = control._values.get(name) ?? '';

    const fieldState: ControllerFieldState = {
        error: control._errors.get(name),
        isTouched: control._touched.get(name) || false,
        isDirty: control._dirty.get(name) || false,
    };

    const errors: Record<string, any> = {};
    const touchedFields: Record<string, boolean> = {};
    const dirtyFields: Record<string, boolean> = {};

    control._errors.forEach((error, key) => {
        if (error) errors[key] = error;
    });

    control._touched.forEach((touched, key) => {
        if (touched) touchedFields[key] = true;
    });

    control._dirty.forEach((dirty, key) => {
        if (dirty) dirtyFields[key] = true;
    });

    const formState: FormState<TFieldValues> = {
        errors,
        touchedFields,
        dirtyFields,
        isSubmitting: control._isSubmitting,
        isValid: Object.keys(errors).length === 0 && !control._isSubmitting,
    };

    const handleInput = useCallback(
        (e: TargetedEvent<HTMLInputElement, Event>) => {
            const target = e.target as HTMLInputElement;
            const newValue = target.value;

            const defaultValue = control._defaultValues[name as keyof TFieldValues];
            const isDirty = newValue !== defaultValue;

            control._values.set(name, newValue);
            control._dirty.set(name, isDirty);

            const mode = control._options.mode || 'onBlur';
            if (mode === 'onInput' || mode === 'all') {
                void validateFieldWithRaceConditionHandling(control, name, newValue, rules);
            }

            control.notify();
        },
        [control, name, rules]
    );

    const handleBlur = useCallback(() => {
        control._touched.set(name, true);

        const value = control._values.get(name);
        void validateFieldWithRaceConditionHandling(control, name, value, rules);

        control.notify();
    }, [control, name, rules]);

    const field = {
        name,
        value,
        onInput: handleInput,
        onBlur: handleBlur,
    };

    useEffect(() => {
        return () => {
            control._validationCounters.delete(name);
        };
    }, [control, name]);

    return render({
        field,
        fieldState,
        formState,
    });
}
