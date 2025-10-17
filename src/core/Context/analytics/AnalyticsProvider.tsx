import type { ComponentChildren } from 'preact';
import { PropsWithChildren } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { createUserEvents } from '../../Analytics/analytics/user-events';
import { AnalyticsContext } from './AnalyticsContext';
import { useAnalytics } from '../../../hooks/useAnalytics/useAnalytics';
import { ExternalComponentType } from '../../../components/types';

export interface AnalyticsProviderProps {
    componentName?: ExternalComponentType;
    children?: ComponentChildren;
}

export const AnalyticsProvider = ({ children, componentName }: PropsWithChildren<AnalyticsProviderProps>) => {
    const userEvents = useMemo(() => createUserEvents(componentName), [componentName]);

    useAnalytics({ userEvents });

    return <AnalyticsContext.Provider value={userEvents}>{children}</AnalyticsContext.Provider>;
};
