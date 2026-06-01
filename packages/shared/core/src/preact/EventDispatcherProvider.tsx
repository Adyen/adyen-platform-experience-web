import type { ComponentChildren } from 'preact';
import { PropsWithChildren } from 'preact/compat';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { setupAnalytics } from '../setupAnalytics';
import type { EventQueueItem } from '../EventDispatcher/eventDispatcher/user-events';
import { usePushAnalyticEvent } from './useEventDispatcher/usePushAnalyticEvent';
import type { ExternalComponentType } from '@integration-components/types';
import { EventDispatcherContext } from './EventDispatcherContext';

export interface EventDispatcherProviderProps {
    componentName?: ExternalComponentType;
    analyticsEnabled: boolean;
    children?: ComponentChildren;
}

export const EventDispatcherProvider = ({ children, componentName, analyticsEnabled }: PropsWithChildren<EventDispatcherProviderProps>) => {
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

    const { userEvents, subscribe } = useMemo(() => setupAnalytics({ analyticsEnabled, componentName }), [analyticsEnabled, componentName]);

    useEffect(() => subscribe(pushEvent), [subscribe, pushEvent]);

    return <EventDispatcherContext.Provider value={userEvents}>{children}</EventDispatcherContext.Provider>;
};
