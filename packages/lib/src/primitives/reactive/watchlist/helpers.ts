import { getter, isFunction, isNullish, noop, struct } from '../../utils';
import type { WatchListEntries, WatchListSubscriptionEventCallbacks } from './types';

export const createWatchListCurrentStateRecord = <T extends Record<string, any>>(entries: WatchListEntries<T>) => {
    const statePropertyDescriptors = {} as { [K in keyof T]: TypedPropertyDescriptor<T[K]> };
    const entriesPropertyDescriptors = Object.getOwnPropertyDescriptors(entries) as typeof statePropertyDescriptors;

    for (const key of Object.keys(entries) as (keyof T)[]) {
        const { get, value } = entriesPropertyDescriptors[key];

        statePropertyDescriptors[key] = getter(
            get ||
                ((isFunction(value)
                    ? // ensure that the `this` binding of the getter function is preserved
                      value.bind(entries)
                    : () => value) as NonNullable<typeof get>)
        );
    }

    return struct<Readonly<T>>(statePropertyDescriptors);
};

export const createWatchListSubscriptionEventCallbacks = () => {
    const callbacks = { idle: null, resume: null } as {
        [K in keyof WatchListSubscriptionEventCallbacks]: NonNullable<WatchListSubscriptionEventCallbacks[K]> | null;
    };

    const descriptors = {} as {
        [K in keyof typeof callbacks]: {
            get: () => (typeof callbacks)[K];
            set: (callback?: (typeof callbacks)[K]) => void;
        };
    };

    for (const key of Object.keys(callbacks) as (keyof typeof callbacks)[]) {
        descriptors[key] = {
            get: () => callbacks[key] ?? noop,
            set: (callback?: (typeof callbacks)[typeof key]) => {
                if (isNullish(callback)) {
                    callbacks[key] = null;
                } else if (isFunction(callback) && callback !== callbacks[key]) {
                    callbacks[key] = callback;
                }
            },
        };
    }

    return struct(descriptors) as WatchListSubscriptionEventCallbacks;
};
