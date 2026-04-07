import { useEffect, useRef } from 'preact/hooks';
import { AdditionalEventProperties } from '../../core/Analytics/analytics/user-events';
import useAnalyticsContext from '../../core/Context/analytics/useAnalyticsContext';
import useComponentTiming from '../useComponentTiming';

export const useDurationEvent = (eventProperties: AdditionalEventProperties) => {
    const { duration } = useComponentTiming();
    const userEvents = useAnalyticsContext();
    const analyticsEventPropertiesRef = useRef(eventProperties);

    useEffect(() => {
        analyticsEventPropertiesRef.current = eventProperties;
    }, [eventProperties]);

    useEffect(() => {
        const durationRef = duration;
        return () => {
            if (durationRef.current !== undefined) {
                userEvents.addEvent?.('Duration', {
                    ...analyticsEventPropertiesRef.current,
                    duration: Math.floor(durationRef.current satisfies number),
                });
            }
        };
    }, [duration, userEvents]);
};
