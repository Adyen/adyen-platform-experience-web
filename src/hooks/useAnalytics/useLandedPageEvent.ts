import { useEffect, useRef } from 'preact/hooks';
import { AdditionalEventProperties } from '../../core/Analytics/analytics/user-events';
import useAnalyticsContext from '../../core/Context/analytics/useAnalyticsContext';

export const useLandedPageEvent = (eventProperties: AdditionalEventProperties) => {
    const userEvents = useAnalyticsContext();
    const logEvent = useRef(true);

    useEffect(() => {
        if (!logEvent.current) return;
        // Log event only on component mount
        logEvent.current = false;
        userEvents.addEvent?.('Landed on page', eventProperties);
    }, [userEvents, eventProperties]);
};
