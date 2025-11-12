import { createContext, ComponentChildren } from 'preact';
import { useContext } from 'preact/hooks';
import { FormContextValue } from './types';

// Create the form context
const FormContext = createContext<FormContextValue<any> | null>(null);

// Hook to use the form context
export function useFormContext<TFieldValues>(): FormContextValue<TFieldValues> {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('useFormContext must be used within a FormProvider');
    }
    return context as FormContextValue<TFieldValues>;
}

interface FormProviderProps<TFieldValues> extends FormContextValue<TFieldValues> {
    children: ComponentChildren;
}

// FormProvider component
export function FormProvider<TFieldValues>({ children, ...methods }: FormProviderProps<TFieldValues>) {
    return <FormContext.Provider value={methods as FormContextValue<TFieldValues>}>{children}</FormContext.Provider>;
}

export { FormContext };
