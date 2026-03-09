import { inject } from 'vue';
import type { CoreContextValue } from './types';
import { CORE_CONTEXT_KEY } from './constants';

export function useCoreContext(): CoreContextValue {
    const context = inject<CoreContextValue>(CORE_CONTEXT_KEY);

    if (!context) {
        throw new Error('useCoreContext must be used within a CoreProvider');
    }

    return context;
}

export default useCoreContext;
