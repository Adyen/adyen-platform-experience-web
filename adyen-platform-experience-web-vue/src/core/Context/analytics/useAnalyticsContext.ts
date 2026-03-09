import { inject } from 'vue';
import type { UserEvents } from './types';
import { ANALYTICS_CONTEXT_KEY } from './constants';

export function useAnalyticsContext(): Partial<UserEvents> {
    const context = inject<Partial<UserEvents>>(ANALYTICS_CONTEXT_KEY);

    if (!context) {
        throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
    }

    return context;
}

export default useAnalyticsContext;
