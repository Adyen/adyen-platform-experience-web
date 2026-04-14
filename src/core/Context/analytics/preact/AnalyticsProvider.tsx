import type { ComponentChildren } from 'preact';
import { PropsWithChildren } from 'preact/compat';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { AnalyticsContext } from './AnalyticsContext';
import type { EventQueueItem } from '../../../Analytics/analytics/user-events';
import { setupAnalytics } from '../setupAnalytics';
import { usePushAnalyticEvent } from '../../../../hooks/useAnalytics/usePushAnalyticEvent';
import { ExternalComponentType } from '../../../../components/types';

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

    const { userEvents, subscribe } = useMemo(() => setupAnalytics({ analyticsEnabled, componentName }), [analyticsEnabled, componentName]);

    useEffect(() => subscribe(pushEvent), [subscribe, pushEvent]);

    return <AnalyticsContext.Provider value={userEvents}>{children}</AnalyticsContext.Provider>;
};
