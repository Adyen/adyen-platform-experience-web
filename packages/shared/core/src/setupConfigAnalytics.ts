import type { ExternalComponentType } from '@integration-components/types';
import type { ConfigController } from './setupConfig';
import { encodeAnalyticsEvent } from './EventDispatcher/eventDispatcher/utils';
import type { EventQueueItem, UserEvents } from './EventDispatcher/eventDispatcher/user-events';
import { setupAnalytics } from './setupAnalytics';

export const setupConfigAnalytics = (
    analyticsEnabled: boolean,
    configController: ConfigController,
    componentName: ExternalComponentType
): Readonly<{ dispose(): void; events: Partial<UserEvents> }> => {
    const analytics = setupAnalytics({ analyticsEnabled, componentName });
    const push = ({ name, properties }: EventQueueItem) => {
        const endpoint = configController.getSnapshot().contextValue.endpoints.sendTrackEvent;
        if (!endpoint) return;
        const component = properties?.componentName as ExternalComponentType | undefined;
        const data = encodeAnalyticsEvent({ event: name, properties: properties ?? {} });
        if (!data) return;
        endpoint(
            { body: data.toString(), contentType: 'application/x-www-form-urlencoded', keepalive: true },
            { ...(component ? { query: { component } } : {}) }
        ).catch(() => {});
    };

    return {
        dispose: analytics.subscribe(push),
        events: analytics.userEvents,
    };
};
