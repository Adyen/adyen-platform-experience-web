import { useCallback, useEffect } from 'preact/hooks';
import useCoreContext from '../../core/Context/useCoreContext';
import { usePushAnalyticEvent } from './usePushAnalyticEvent';
import type { AnalyticsEventPayload, EventQueueItem, MixpanelProperty, UserEvents } from '../../core/Analytics/analytics/user-events';

type UseAnalyticsProps = {
    userEvents: UserEvents;
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

export const useAnalytics = ({ userEvents }: UseAnalyticsProps) => {
    const sdkVersion = process.env.VITE_VERSION;
    const { i18n } = useCoreContext();

    const pushAnalyticsEvent = usePushAnalyticEvent();

    useEffect(() => {
        userEvents.updateBaseTrackingPayload({
            sdkVersion,
            userAgent: navigator.userAgent,
        });
    }, [sdkVersion, userEvents, i18n]);

    const pushEvents = useCallback(
        (data: EventQueueItem) => {
            const eventItem = convertToEmbeddedEvent(data);
            pushAnalyticsEvent(eventItem);
        },
        [pushAnalyticsEvent]
    );

    useEffect(() => {
        userEvents.subscribe(pushEvents);

        const customizedLocale = Object.keys(i18n.customTranslations);
        if (customizedLocale.length > 0) {
            for (const locale of customizedLocale) {
                const translations = i18n.customTranslations[locale]!;
                const keys = Object.keys(translations!);
                if (keys.length > 0) {
                    userEvents.addEvent('Customized translation', {
                        category: 'PIE',
                        subCategory: 'PIE Component',
                        locale: locale,
                        keys: keys,
                    });
                }
            }
        }

        return () => {
            userEvents.unsubscribe(pushEvents);
        };
    }, [userEvents, pushEvents, i18n]);
};
