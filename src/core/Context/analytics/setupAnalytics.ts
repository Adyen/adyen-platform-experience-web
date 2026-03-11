import { createUserEvents, type EventQueueItem, type UserEvents } from '../../Analytics/analytics/user-events';
import type { ExternalComponentType } from '../../../components/types';

export interface AnalyticsSetupOptions {
    analyticsEnabled: boolean;
    componentName?: ExternalComponentType;
}

export interface AnalyticsSetupResult {
    userEvents: Partial<UserEvents>;
    subscribe(pushEvent: (data: EventQueueItem) => void): () => void;
}

/**
 * Initializes analytics user events and returns a subscribe/unsubscribe helper.
 * Framework-agnostic — Preact/Vue adapters call this, then wire the result into their reactivity system.
 */
export function setupAnalytics({ analyticsEnabled, componentName }: AnalyticsSetupOptions): AnalyticsSetupResult {
    const userEvents = createUserEvents(analyticsEnabled, componentName);

    userEvents.updateBaseTrackingPayload?.({
        sdkVersion: process.env.VITE_VERSION,
        userAgent: navigator.userAgent,
    });

    return {
        userEvents,
        subscribe(pushEvent: (data: EventQueueItem) => void) {
            if (analyticsEnabled) {
                userEvents.subscribe?.(pushEvent);
                return () => userEvents.unsubscribe?.(pushEvent);
            }
            return () => {};
        },
    };
}
