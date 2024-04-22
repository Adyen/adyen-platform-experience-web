import { enumerable, isFunction, noop, struct } from '@src/utils/common';
import type { EmittableEvent, Emitter, EmitterEvents } from './types';

export const createEventEmitter = <Events extends EmitterEvents>() => {
    const _eventTarget = new (class extends EventTarget {})();

    const _emitEvent: Emitter<Events>['emit'] = (type, ...restArgs) => {
        const [detail] = restArgs;

        if (restArgs.length && detail === undefined) {
            // `undefined` has been explicitly passed as the detail of the event to be dispatched.
            // Notify the consumer with a corresponding warning indicating possible resolutions.
            // Warning can further be conditioned to only be available in development environment.
            console.warn(
                'Unexpected value `undefined` provided for event detail.\n' +
                    '\tTurn off this warning by doing either of the following:\n' +
                    '\t(1) omit the optional event detail parameter.\n' +
                    '\t(2) explicitly pass `null` for the event detail parameter (instead of `undefined`).\n'
            );
        }

        const event = new CustomEvent(
            type,
            struct({
                bubbles: enumerable(false),
                cancelable: enumerable(false),
                detail: enumerable(detail ?? null),
            })
        ) as EmittableEvent<Events, typeof type>;

        return _eventTarget.dispatchEvent(event);
    };

    const _onEvent: Emitter<Events>['on'] = (type, listener) => {
        if (!isFunction<typeof listener>(listener)) return noop;

        const _listener = (evt: Event) =>
            listener.call(
                null,
                struct({
                    detail: enumerable((evt as EmittableEvent<Events, typeof type>).detail),
                    timeStamp: enumerable(evt.timeStamp),
                    type: enumerable(evt.type),
                })
            );

        _eventTarget.addEventListener(type, _listener);

        return () => _eventTarget.removeEventListener(type, _listener);
    };

    return struct({
        emit: enumerable(_emitEvent),
        on: enumerable(_onEvent),
    }) as Emitter<Events>;
};

export default createEventEmitter;
