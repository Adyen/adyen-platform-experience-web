import { Watchable, WatchAtoms, WatchCallable, WatchCallback } from './types';
import { UNWATCH_SIGNAL } from './constants';
import { noop } from '../constants';
import { struct } from '../utils';

const watchable = <T extends Record<string, any>>(atoms = {} as WatchAtoms<T>) => {
    const unwatchers = new WeakSet<WatchCallable<void>>();
    const watchers = new Map<WatchCallback<T>, number>();

    let snapshot: T | undefined;

    const state = (() => {
        const descriptors = {} as {
            [K in keyof T]: {
                enumerable: true;
                get: () => WatchCallable<T[K]>;
            };
        };

        for (const key of Object.keys(atoms) as (keyof T)[]) {
            const { get, value } = Object.getOwnPropertyDescriptor(atoms, key) as PropertyDescriptor;
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
    })();

    const callbacks = (() => {
        const callbacks: Watchable<T>['callback'] = { idle: noop, resume: noop };
        const descriptors = {} as {
            [K in keyof typeof callbacks]: PropertyDescriptor;
        };

        const factory = (type: keyof typeof callbacks) => ({
            get: () => callbacks[type],
            set: (callback?: WatchCallable<any> | null) => {
                if (callback == undefined) callbacks[type] = noop;
                else if (typeof callback === 'function' && callback !== callbacks[type]) callbacks[type] = callback;
            },
        });

        for (const key of Object.keys(callbacks) as (keyof typeof callbacks)[]) {
            descriptors[key] = factory(key);
        }

        return struct(descriptors) as Watchable<T>['callback'];
    })();

    const notifyWatchers = (signal?: typeof UNWATCH_SIGNAL) => {
        if (watchers.size === 0) return;

        if (signal === UNWATCH_SIGNAL) {
            watchers.forEach((_, cb) => cb(signal));
            return true;
        }

        const currentSnapshot = snapshot as T;
        snapshot = { ...state };

        for (const key of Object.keys(snapshot) as (keyof T)[]) {
            if (snapshot[key] !== currentSnapshot[key] && snapshot[key] === snapshot[key]) {
                watchers.forEach((_, cb) => cb(snapshot as T));
                return true;
            }
        }

        return false;
    };

    const watch = (callback?: WatchCallback<T>) => {
        if (!callback) return noop;

        const unwatch = () => {
            let callbackWeight = watchers.get(callback) || 0;

            if (unwatchers.delete(unwatch)) {
                watchers.set(callback, (callbackWeight = Math.max(0, --callbackWeight)));
            }

            if (callbackWeight === 0 && watchers.delete(callback) && watchers.size === 0) {
                snapshot = undefined;
                callbacks.idle();
            }
        };

        const callbackWeight = watchers.get(callback) || 0;

        unwatchers.add(unwatch);
        watchers.set(callback, callbackWeight + 1);

        if (callbackWeight === 0) {
            snapshot = snapshot || { ...state };
            callbacks.resume();
        }

        callback(snapshot as T);

        return unwatch;
    };

    return struct({
        callback: { value: callbacks },
        idle: { get: () => watchers.size === 0 },
        notify: { value: notifyWatchers },
        snapshot: { get: () => ({ ...(snapshot || state) }) },
        watch: { value: watch },
    }) as Watchable<T>;
};

export default watchable;
