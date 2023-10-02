import { Watchable, WatchAtoms, WatchCallable } from '../types';
import { noop, struct } from '../../common';

export const createLiveWatchableState = <T extends Record<string, any>>(watchableAtoms = {} as WatchAtoms<T>) => {
    const descriptors = {} as {
        [K in keyof T]: {
            enumerable: true;
            get: () => WatchCallable<T[K]>;
        };
    };

    for (const key of Object.keys(watchableAtoms) as (keyof T)[]) {
        const { get, value } = Object.getOwnPropertyDescriptor(watchableAtoms, key) as PropertyDescriptor;
        descriptors[key] = {
            enumerable: true,
            get:
                get ||
                (typeof value === 'function'
                    ? () => value() // ensures that the `this` binding of the getter function is preserved
                    : () => value),
        };
    }

    return struct(descriptors) as T;
};

export const createWatchableIdleCallbacks = <T extends Record<string, any>>() => {
    const callbacks: Watchable<T>['callback'] = { idle: noop, resume: noop };
    const descriptors = {} as { [K in keyof typeof callbacks]: PropertyDescriptor };

    for (const key of Object.keys(callbacks) as (keyof typeof callbacks)[]) {
        descriptors[key] = {
            get: () => callbacks[key],
            set: (callback?: WatchCallable<any> | null) => {
                if (callback == undefined) {
                    callbacks[key] = noop;
                } else if (typeof callback === 'function' && callback !== callbacks[key]) {
                    callbacks[key] = callback;
                }
            },
        };
    }

    return struct(descriptors) as Watchable<T>['callback'];
};
