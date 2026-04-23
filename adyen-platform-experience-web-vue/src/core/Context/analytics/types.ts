export interface EventQueueItem {
    name: string;
    properties?: Record<string, any>;
}

export interface UserEvents {
    addEvent: (event: EventQueueItem) => void;
    addJourneyEvent: (event: EventQueueItem) => void;
    addTaskEvent: (event: EventQueueItem) => void;
    addPageEvent: (event: EventQueueItem) => void;
    addFieldEvent: (event: EventQueueItem) => void;
    startEvent: (event: EventQueueItem) => void;
    subscribe: (callback: (event: EventQueueItem) => void) => void;
    unsubscribe: (callback: (event: EventQueueItem) => void) => void;
    updateBaseTrackingPayload: (payload: Record<string, any>) => void;
    updateSharedEventProperties: (properties: Record<string, any>) => void;
}

export interface AnalyticsProviderProps {
    componentName?: string;
    analyticsEnabled: boolean;
}
