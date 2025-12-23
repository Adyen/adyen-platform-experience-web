import { useCallback, useEffect } from 'preact/hooks';
import useCoreContext from '../../core/Context/useCoreContext';
import { usePushAnalyticEvent } from './usePushAnalyticEvent';
import type { AnalyticsEventPayload, EventQueueItem, MixpanelProperty, UserEvents } from '../../core/Analytics/analytics/user-events';

type UseAnalyticsProps = {
    userEvents: Partial<UserEvents>;
    analyticsEnabled: boolean;
};

export type EmbeddedEventItem = {
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

export const useAnalytics = ({ userEvents, analyticsEnabled }: UseAnalyticsProps) => {
    const sdkVersion = process.env.VITE_VERSION;
    const { i18n } = useCoreContext();

    const pushAnalyticsEvent = usePushAnalyticEvent();

    useEffect(() => {
        if (analyticsEnabled) {
            userEvents.updateBaseTrackingPayload?.({
                sdkVersion,
                userAgent: navigator.userAgent,
            });
        }
    }, [sdkVersion, userEvents, i18n, analyticsEnabled]);

    const pushEvents = useCallback(
        (data: EventQueueItem) => {
            const eventItem = convertToEmbeddedEvent(data);
            pushAnalyticsEvent(eventItem);
        },
        [pushAnalyticsEvent]
    );

    useEffect(() => {
        if (analyticsEnabled) {
            userEvents.subscribe?.(pushEvents);
        }

        return () => {
            if (analyticsEnabled) {
                userEvents.unsubscribe?.(pushEvents);
            }
        };
    }, [userEvents, pushEvents, i18n, analyticsEnabled]);
};
