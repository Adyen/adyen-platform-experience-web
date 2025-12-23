import type { ComponentChildren } from 'preact';
import { PropsWithChildren } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { createUserEvents } from '../../Analytics/analytics/user-events';
import { AnalyticsContext } from './AnalyticsContext';
import { useAnalytics } from '../../../hooks/useAnalytics/useAnalytics';
import { ExternalComponentType } from '../../../components/types';

export interface AnalyticsProviderProps {
    componentName?: ExternalComponentType;
    analyticsEnabled: boolean;
    children?: ComponentChildren;
}

export const AnalyticsProvider = ({ children, componentName, analyticsEnabled }: PropsWithChildren<AnalyticsProviderProps>) => {
    const userEvents = useMemo(() => createUserEvents(analyticsEnabled, componentName), [componentName, analyticsEnabled]);

    useAnalytics({ userEvents, analyticsEnabled });

    return <AnalyticsContext.Provider value={userEvents}>{children}</AnalyticsContext.Provider>;
};
