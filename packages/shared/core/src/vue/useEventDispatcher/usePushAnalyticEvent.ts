import { useConfigContext } from '../ConfigContext/useConfigContext';
import { encodeAnalyticsEvent } from '../../EventDispatcher/eventDispatcher/utils';
import type { EmbeddedEventItem } from '../../EventDispatcher/eventDispatcher/user-events';
import type { ExternalComponentType } from '@integration-components/types';

export function usePushAnalyticEvent() {
    const config = useConfigContext();

    return (options: EmbeddedEventItem) => {
        const { sendTrackEvent } = config.endpoints;
        if (!sendTrackEvent) return;

        // The generated analytics `Component` enum is owned by the backend contract and does not list every
        // ExternalComponentType yet (e.g. 'piet'). Remove this cast once `pnpm run schemas:generate` includes it.
        type TrackEventComponent = NonNullable<NonNullable<NonNullable<Parameters<typeof sendTrackEvent>[1]>['query']>['component']>;
        const componentName = options.properties.componentName as ExternalComponentType;
        const data = encodeAnalyticsEvent(options);
        if (!data) return;

        sendTrackEvent(
            { body: data.toString(), contentType: 'application/x-www-form-urlencoded', keepalive: true },
            { ...(componentName ? { query: { component: componentName as TrackEventComponent } } : {}) }
        ).catch(() => {});
    };
}
