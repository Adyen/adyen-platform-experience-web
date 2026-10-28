import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { AdyenPlatformExperience } from '../AdyenPlatformExperience';
import { GLOBAL_SECTIONS, INITIAL_CORE_OPTIONS, toCoreOptions } from './coreOptions';
import { getChanges } from './getChanges';
import { useControlValues } from './useControlValues';

type GlobalOptionsContextValue = ReturnType<typeof useControlValues>;

const GlobalOptionsContext = createContext<GlobalOptionsContextValue | null>(null);

export const GlobalOptionsProvider = ({ children }: { children: ReactNode }) => {
    const globalOptions = useControlValues(GLOBAL_SECTIONS);
    const appliedOptions = useRef<object>(INITIAL_CORE_OPTIONS);

    useEffect(() => {
        const nextOptions = toCoreOptions(globalOptions.values);
        const changes = getChanges(appliedOptions.current, nextOptions);
        appliedOptions.current = nextOptions;
        if (Object.keys(changes).length === 0) return;

        AdyenPlatformExperience.getInstance()
            .then(({ core }) => core.update(changes))
            .catch(error => console.error('[integration-demo] Failed to update core options:', error));
    }, [globalOptions.values]);

    return <GlobalOptionsContext.Provider value={globalOptions}>{children}</GlobalOptionsContext.Provider>;
};

export const useGlobalOptions = () => {
    const context = useContext(GlobalOptionsContext);
    if (!context) throw new Error('useGlobalOptions must be used within a GlobalOptionsProvider');
    return context;
};
