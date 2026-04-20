import { useEffect, useRef } from 'preact/hooks';
import { AdditionalEventProperties } from '@integration-components/core/Analytics/analytics/user-events';
import useAnalyticsContext from '../../../../../src/core/Context/analytics/useAnalyticsContext';

export const useLandedPageEvent = (eventProperties: AdditionalEventProperties) => {
    const userEvents = useAnalyticsContext();
    const logEventRef = useRef(true);

    useEffect(() => {
        if (!logEventRef.current) return;
        // Log event only on component mount
        logEventRef.current = false;
        userEvents.addEvent?.('Landed on page', eventProperties);
    }, [userEvents, eventProperties]);
};
