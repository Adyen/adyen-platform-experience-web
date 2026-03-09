import { inject } from 'vue';
import type { ConfigContextValue } from './types';
import { CONFIG_CONTEXT_KEY } from './constants';

export function useConfigContext(): ConfigContextValue {
    const context = inject<ConfigContextValue>(CONFIG_CONTEXT_KEY);

    if (!context) {
        throw new Error('useConfigContext must be used within a ConfigProvider');
    }

    return context;
}

export default useConfigContext;
