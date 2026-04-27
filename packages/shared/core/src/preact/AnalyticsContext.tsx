import { createContext } from 'preact';

import { noop } from '@integration-components/utils';
import { UserEvents } from '../Analytics/analytics/user-events';

const defaultUserEvents: UserEvents = {
    addEvent: noop,
    addJourneyEvent: noop,
    addTaskEvent: noop,
    addPageEvent: noop,
    addFieldEvent: noop,
    startEvent: noop,
    subscribe: noop,
    updateBaseTrackingPayload: noop,
    updateSharedEventProperties: noop,
    unsubscribe: noop,
} as unknown as UserEvents;

export const AnalyticsContext = createContext<Partial<UserEvents>>(defaultUserEvents);
