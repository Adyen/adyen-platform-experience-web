import { useEffect, useRef } from 'preact/hooks';
import { AdditionalEventProperties } from '@integration-components/core/EventDispatcher/eventDispatcher/user-events';
import useEventDispatcherContext from '../../../../../src/core/Context/eventDispatcher/useEventDispatcherContext';

export const useLandedPageEvent = (eventProperties: AdditionalEventProperties) => {
    const userEvents = useEventDispatcherContext();
    const logEventRef = useRef(true);

    useEffect(() => {
        if (!logEventRef.current) return;
        // Log event only on component mount
        logEventRef.current = false;
        userEvents.addEvent?.('Landed on page', eventProperties);
    }, [userEvents, eventProperties]);
};
