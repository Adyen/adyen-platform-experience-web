import { useEffect, useRef } from 'preact/hooks';
import { AdditionalEventProperties } from '../../core/Analytics/analytics/user-events';
import useAnalyticsContext from '../../core/Context/analytics/useAnalyticsContext';
import useComponentTiming from '../useComponentTiming';

export const useDurationEvent = (eventProperties: AdditionalEventProperties) => {
    const { duration } = useComponentTiming();
    const userEvents = useAnalyticsContext();
    const analyticsEventProperties = useRef(eventProperties);

    useEffect(() => {
        analyticsEventProperties.current = eventProperties;
    }, [eventProperties]);

    useEffect(() => {
        const durationRef = duration;
        return () => {
            if (durationRef.current !== undefined) {
                userEvents.addEvent?.('Duration', {
                    ...analyticsEventProperties.current,
                    duration: Math.floor(durationRef.current satisfies number),
                });
            }
        };
    }, [duration, userEvents]);
};
