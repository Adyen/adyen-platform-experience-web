import { inject, isRef, type ComputedRef, type Ref } from 'vue';
import type { UserEvents } from './types';
import { ANALYTICS_CONTEXT_KEY } from './constants';

type InjectedAnalytics = Partial<UserEvents> | Ref<Partial<UserEvents>> | ComputedRef<Partial<UserEvents>>;

export function useAnalyticsContext(): Partial<UserEvents> {
    const injected = inject<InjectedAnalytics>(ANALYTICS_CONTEXT_KEY);

    if (!injected) {
        throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
    }

    if (!isRef(injected)) {
        return injected;
    }

    return new Proxy({} as Partial<UserEvents>, {
        get(_target, prop: string) {
            const current = (injected.value ?? {}) as Record<string, unknown>;
            return current[prop];
        },
        has(_target, prop: string) {
            return prop in (injected.value ?? {});
        },
    });
}
