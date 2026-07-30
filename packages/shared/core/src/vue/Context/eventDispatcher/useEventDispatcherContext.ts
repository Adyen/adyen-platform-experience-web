import { inject, unref, type ComputedRef } from 'vue';
import type { UserEvents } from '../../../EventDispatcher/eventDispatcher/user-events';
import { EVENT_DISPATCHER_CONTEXT_KEY } from './constants';

type InjectedAnalytics = ComputedRef<Partial<UserEvents>>;

export function useEventDispatcherContext(): Partial<UserEvents> {
    const injected = inject<InjectedAnalytics>(EVENT_DISPATCHER_CONTEXT_KEY);

    if (!injected) {
        throw new Error('useEventDispatcherContext must be used within an EventDispatcherProvider');
    }

    return new Proxy({} as Partial<UserEvents>, {
        get(_target, prop: string) {
            const current = unref(injected) as Record<string, unknown>;
            return current?.[prop];
        },
        has(_target, prop: string) {
            return prop in (unref(injected) ?? {});
        },
    });
}
