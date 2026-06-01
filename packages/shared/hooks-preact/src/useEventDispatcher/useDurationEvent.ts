import { useEffect, useRef } from 'preact/hooks';
import { AdditionalEventProperties } from '@integration-components/core/EventDispatcher/eventDispatcher/user-events';
import useEventDispatcherContext from '../../../../../src/core/Context/eventDispatcher/useEventDispatcherContext';
import useComponentTiming from '../useComponentTiming';

export const useDurationEvent = (eventProperties: AdditionalEventProperties) => {
    const { duration } = useComponentTiming();
    const userEvents = useEventDispatcherContext();
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
