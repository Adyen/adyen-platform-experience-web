import type { ComponentChildren } from 'preact';
import { PropsWithChildren } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { createUserEvents } from '../../Analytics/analytics/user-events';
import { AnalyticsContext } from './AnalyticsContext';
import { useAnalytics } from '../../../hooks/useAnalytics/useAnalytics';

export interface AnalyticsProviderProps {
    componentName?: string;
    children?: ComponentChildren;
}

/**
 * The provider exists to scope analytics to one application instance.
 * This would otherwise be problematic when a consumer might have several
 * instantiations of a embedded Component for instance on the same page
 */
export const AnalyticsProvider = ({ children, componentName }: PropsWithChildren<AnalyticsProviderProps>) => {
    const userEvents = useMemo(() => createUserEvents(componentName), [componentName]);

    useAnalytics({ userEvents });

    return <AnalyticsContext.Provider value={userEvents}>{children}</AnalyticsContext.Provider>;
};
