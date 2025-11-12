import { useEffect, useReducer, useCallback } from 'preact/hooks';
import { ControllerProps, ControllerFieldState, FormState } from './types';

export function Controller<TFieldValues>({ name, control, rules, render }: ControllerProps<TFieldValues>) {
    const [, rerender] = useReducer<number, void>(x => x + 1, 0);

    useEffect(() => {
        const unsubscribe = control.subscribe(() => {
            // Trigger re-render when control state changes
            rerender();
        });

        let unregister = () => {};
        if (rules) {
            unregister = control.register(name, rules);
        }

        return () => {
            unsubscribe();
            unregister();
        };
    }, [control, name, rules]);

    const value = control.getValue(name);

    const fieldState: ControllerFieldState = control.getFieldState(name);

    const formState: FormState<TFieldValues> = control.getFormState();

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

            control.setValue(name, newValue);
        },
        [control, name]
    );

    const handleBlur = useCallback(() => {
        control.setTouched(name, true);
        void control.trigger(name);
    }, [control, name]);

    const field = {
        name,
        value,
        onInput: handleChange,
        onBlur: handleBlur,
    };

    return render({
        field,
        fieldState,
        formState,
    });
}
