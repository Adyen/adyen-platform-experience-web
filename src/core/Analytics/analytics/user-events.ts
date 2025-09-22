export type MixpanelProperty = string | number | boolean | any[] | null | undefined;

/**
 * Level of the funnel that is relevant for this event
 */
type ActionLevel = 'journey' | 'task' | 'page' | 'field';

/**
 * The type of action associated with the event
 */
export type ActionType = 'add' | 'reset' | 'update';

/**
 * The base event properties that are sent with every event
 */
export type BaseEventProperties = {
    category: 'pie';
    subCategory: 'pie component';
    capabilities?: string[];
    componentName?: string;
    countryCode?: string;
    locale?: string;
    sdkVersion?: string;
    userAgent?: string;
};

/**
 * Additional event properties
 */
export interface AdditionalEventProperties {
    actionType?: ActionType;
    actionLevel?: ActionLevel;
    page?: string;
    field?: string;
    returnType?: 'backend' | 'validation' | (string & {});
    returnValue?: string | string[];
    additionalData?: string | string[];
    label?: string;
    category: string;
    subCategory: string;
    [key: string]: MixpanelProperty;

    // Mixpanel experiment properties
    'Experiment name'?: string;
    'Variant name'?: string;
}

/**
 * Name of the tracked event
 * Can be either a custom name or one of the pre-defined values
 */
export type FilterType = 'Date filter' | 'Amount filter' | 'Balance account filter' | 'Category filter' | 'Currency filter' | 'Status filter';

/**
 * Name of the tracked event
 * Can be either a custom name or one of the pre-defined values
 */
export type EventName =
    | 'Clicked button'
    | 'Modified filter'
    | 'Encountered error'
    | (string & {})

    // Mixpanel experiment event
    | '$experiment_started';

export type AnalyticsEventPayload = Required<BaseEventProperties> & AdditionalEventProperties;

export type EventQueueItem = {
    name: EventName;
    properties?: AnalyticsEventPayload;
};

type UserEventCallback = (eventQueueItem: EventQueueItem) => void;

export class UserEvents {
    private readonly queue: EventQueueItem[] = [];

    private readonly subscriptions: Set<UserEventCallback> = new Set();

    /** payload of commmon props sent in every event */
    private baseTrackingPayload: BaseEventProperties;

    /** properties not set with every event but that may be shared between some events
     * ex. `page` value for `Interacted with form field` events
     */
    private sharedEventProperties: Partial<AdditionalEventProperties>;

    constructor() {
        this.baseTrackingPayload = {
            category: 'pie',
            subCategory: 'pie component',
        };
        this.sharedEventProperties = {};
    }

    protected add(...args: EventQueueItem[]) {
        this.queue.push(...args);
    }

    protected notifySubscribers() {
        while (this.queue.length > 0) {
            const lastEvent = this.queue.pop()!;

            this.subscriptions.forEach((callback: UserEventCallback) => {
                return callback(lastEvent);
            });
        }
    }

    /**
     * Adds an analytics event with all base event properties.
     */
    public addEvent(eventName: EventName, properties: AdditionalEventProperties) {
        const completeEvent = { ...this.baseTrackingPayload, ...properties } as AnalyticsEventPayload;
        this.add({
            name: eventName,
            // type: 'add_event',
            properties: completeEvent,
        });
        this.notifySubscribers();
    }

    /**
     * Adds an event with context specific to
     */
    public addModifyFilterEvent(properties: Omit<AdditionalEventProperties, 'subCategory' | 'label'> & { label?: FilterType }) {
        this.addEvent('Modified filter', {
            ...properties,
            subCategory: 'Filter',
        } as AdditionalEventProperties);
    }

    /**
     * Tracks an experiment for Mixpanel experiment reporting
     */
    public trackExperiment({ name, variant }: { name: string; variant: string }) {
        this.add({
            // type: 'add_event',
            name: '$experiment_started',
            properties: {
                ...this.baseTrackingPayload,
                'Experiment name': name,
                'Variant name': variant,
            } as AnalyticsEventPayload,
        });
    }

    /**
     * Starts a timer for an event to measure the time it takes for an event to occur. Time is ended when `addEvent` is executed with the same key
     */
    public startEvent(eventName: EventName) {
        this.add({
            // type: 'start_event',
            name: eventName,
        });
        this.notifySubscribers();
    }

    /**
     * Subscribes a callback to analytics events. It gets called every time
     * one of the above public methods get called, and the event data is passed back as an array.
     * The callback must have a single argument which is an array of [eventName, eventPayload?].
     * @example
     * ```js
     * const callback = ([eventName, eventPayload]) => console.log(eventName, eventPayload);
     * this.subscribe(callback);
     *
     * const exampleEventPayload = { count: 1, segmentation: { foo: 'bar' } };
     * this.addEvent('exampleEventDidOccur', exampleEventPayload);
     *
     * // `callback` will get called with `['exampleEventDidOccur', exampleEventPayload]`
     * ```
     */
    public subscribe(callback: UserEventCallback) {
        this.subscriptions.add(callback);
    }

    /**
     * Sets params that are sent on every event
     * */
    public updateBaseTrackingPayload(baseTrackingPayload: Partial<BaseEventProperties>) {
        this.baseTrackingPayload = { ...this.baseTrackingPayload, ...baseTrackingPayload };
    }

    /**
     * Sets params that may be shared between events
     * */
    public updateSharedEventProperties = (props: Record<string, MixpanelProperty>) => {
        this.sharedEventProperties = { ...this.sharedEventProperties, ...props };
    };

    /**
     * Removes a subscribed callback
     */
    public unsubscribe(callback: UserEventCallback) {
        if (this.subscriptions.has(callback)) {
            this.subscriptions.delete(callback);
        }
    }
}

/** @deprecated - use useAnalyticsContext */
export const userEvents = new UserEvents();

export const createUserEvents = () => {
    return new UserEvents();
};
