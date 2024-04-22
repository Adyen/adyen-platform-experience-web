export interface EmittableEvent<Events extends EmitterEvents, EventType extends EmitterEventType<Events>> extends CustomEvent {
    bubbles: false;
    cancelable: false;
    detail: EmittableEventDetail<Events, EventType>;
    type: EmittableEventType<Events, EventType>;
}

export type EmittableEventDetail<Events extends EmitterEvents, EventType extends EmitterEventType<Events>> = Events extends Events
    ? EmitterEventsMap<Events>[EventType extends EmitterEventType<Events> ? EventType : never]
    : never;

export type EmittableEventType<Events extends EmitterEvents, EventType extends EmitterEventType<Events>> = EventType extends EventType
    ? EventType
    : never;

export interface Emitter<Events extends EmitterEvents> {
    readonly emit: <EventType extends EmitterEventType<Events>>(type: EventType, detail?: EmittableEventDetail<Events, EventType>) => boolean;
    readonly on: <EventType extends EmitterEventType<Events>>(
        type: EventType,
        listener: (this: null, evt: Readonly<Pick<EmittableEvent<Events, EventType>, 'detail' | 'timeStamp' | 'type'>>) => any
    ) => () => void;
}

export type EmitterEvents = string | Record<string, any>;
export type EmitterEventsMap<T> = T extends string
    ? { [K in T]: null }
    : T extends Record<string, any>
    ? { [K in keyof T]: NonNullable<T[K]> | null }
    : never;
export type EmitterEventType<Events> = Events extends Events ? keyof EmitterEventsMap<Events> : never;
