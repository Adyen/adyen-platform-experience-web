import { useLayoutEffect, useRef } from 'preact/hooks';
import { AdditionalEventProperties } from '@integration-components/core/EventDispatcher/eventDispatcher/user-events';
import { useEventDispatcherContext } from '@integration-components/core/preact';

export const useLandedPageEvent = (eventProperties: AdditionalEventProperties, enabled = true) => {
    const userEvents = useEventDispatcherContext();
    const logEventRef = useRef(true);

    useLayoutEffect(() => {
        if (!enabled || !logEventRef.current) return;
        // Log before child passive effects so page-load analytics remains the first event.
        logEventRef.current = false;
        userEvents.addEvent?.('Landed on page', eventProperties);
    }, [userEvents, eventProperties, enabled]);
};
