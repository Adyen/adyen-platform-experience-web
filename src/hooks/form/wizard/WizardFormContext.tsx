import { createContext, ComponentChildren } from 'preact';
import { useContext } from 'preact/hooks';
import { WizardFormContextValue } from './types';

const WizardFormContext = createContext<WizardFormContextValue<any> | null>(null);

export function useWizardFormContext<TFieldValues = Record<string, any>>(): WizardFormContextValue<TFieldValues> {
    const context = useContext(WizardFormContext);
    if (!context) {
        throw new Error('useWizardFormContext must be used within a WizardFormProvider');
    }
    return context as WizardFormContextValue<TFieldValues>;
}

interface WizardFormProviderProps<TFieldValues = Record<string, any>> extends WizardFormContextValue<TFieldValues> {
    children: ComponentChildren;
}

export function WizardFormProvider<TFieldValues = Record<string, any>>({ children, ...methods }: WizardFormProviderProps<TFieldValues>) {
    return <WizardFormContext.Provider value={methods}>{children}</WizardFormContext.Provider>;
}

export { WizardFormContext };
