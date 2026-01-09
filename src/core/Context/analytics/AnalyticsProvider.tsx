import type { ComponentChildren } from 'preact';
import { PropsWithChildren } from 'preact/compat';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { AnalyticsContext } from './AnalyticsContext';
import { createUserEvents, type EventQueueItem } from '../../Analytics/analytics/user-events';
import { usePushAnalyticEvent } from '../../../hooks/useAnalytics/usePushAnalyticEvent';
import { ExternalComponentType } from '../../../components/types';

export interface AnalyticsProviderProps {
    componentName?: ExternalComponentType;
    analyticsEnabled: boolean;
    children?: ComponentChildren;
}

export const AnalyticsProvider = ({ children, componentName, analyticsEnabled }: PropsWithChildren<AnalyticsProviderProps>) => {
    const pushAnalyticsEvent = usePushAnalyticEvent();

    const pushEvent = useCallback(
        (data: EventQueueItem) => {
            const { name, properties } = data;
            pushAnalyticsEvent({
                event: name,
                properties: properties || {},
            });
        },
        [pushAnalyticsEvent]
    );

    const userEvents = useMemo(() => {
        const userEvents = createUserEvents(analyticsEnabled, componentName);

        userEvents.updateBaseTrackingPayload?.({
            sdkVersion: process.env.VITE_VERSION,
            userAgent: navigator.userAgent,
        });

        return userEvents;
    }, [analyticsEnabled, componentName]);

    useEffect(() => {
        if (analyticsEnabled) {
            userEvents.subscribe?.(pushEvent);
            return () => userEvents.unsubscribe?.(pushEvent);
        }
    }, [analyticsEnabled, pushEvent, userEvents]);

    return <AnalyticsContext.Provider value={userEvents}>{children}</AnalyticsContext.Provider>;
};
