import { useConfigContext } from '../ConfigContext/useConfigContext';
import { encodeAnalyticsEvent } from '../../EventDispatcher/eventDispatcher/utils';
import type { EmbeddedEventItem } from '../../EventDispatcher/eventDispatcher/user-events';
import type { ExternalComponentType } from '@integration-components/types';

export function usePushAnalyticEvent() {
    const { endpoints } = useConfigContext();

    return (options: EmbeddedEventItem) => {
        const { sendTrackEvent } = endpoints;
        if (!sendTrackEvent) return;

        const componentName = options.properties.componentName as ExternalComponentType;
        const data = encodeAnalyticsEvent(options);
        if (!data) return;

        sendTrackEvent(
            { body: data.toString(), contentType: 'application/x-www-form-urlencoded', keepalive: true },
            { ...(componentName ? { query: { component: componentName } } : {}) }
        ).catch(() => {});
    };
}
