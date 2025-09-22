import { useCallback, useEffect } from 'preact/hooks';

import { usePushAnalyticEvent } from './usePushAnalyticEvent';
import type { AnalyticsEventPayload, EventQueueItem, MixpanelProperty, UserEvents } from '../../core/Analytics/analytics/user-events';

type UseAnalyticsProps = {
    userEvents: UserEvents;
};

type EmbeddedEventItem = {
    event: string;
    properties: AnalyticsEventPayload | Record<string, MixpanelProperty>;
};

export const convertToEmbeddedEvent = (eventQueueItem: EventQueueItem): EmbeddedEventItem => {
    const { name, properties } = eventQueueItem;
    return {
        event: name,
        properties: properties || {},
    };
};

export const useAnalytics = ({ userEvents }: UseAnalyticsProps) => {
    const sdkVersion = process.env.VITE_VERSION;

    const pushAnalyticsEvent = usePushAnalyticEvent();

    useEffect(() => {
        userEvents.updateBaseTrackingPayload({
            sdkVersion,
            userAgent: navigator.userAgent,
        });
    }, [sdkVersion, userEvents]);

    const pushEvents = useCallback(
        (data: EventQueueItem) => {
            const eventItem = convertToEmbeddedEvent(data);
            pushAnalyticsEvent(eventItem);
        },
        [pushAnalyticsEvent]
    );

    useEffect(() => {
        userEvents.subscribe(pushEvents);

        return () => {
            userEvents.unsubscribe(pushEvents);
        };
    }, [userEvents, pushEvents]);
};
