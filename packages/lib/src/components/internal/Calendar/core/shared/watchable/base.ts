import { Watchable, WatchAtoms, WatchCallable, WatchCallback } from './types';
import { UNWATCH_SIGNAL } from './constants';
import { noop } from '../constants';
import { struct } from '../utils';

const createLiveWatchableState = <T extends Record<string, any>>(watchableAtoms = {} as WatchAtoms<T>) => {
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

const createWatchableIdleCallbacks = <T extends Record<string, any>>() => {
    const callbacks: Watchable<T>['callback'] = { idle: noop, resume: noop };
    const descriptors = {} as {
        [K in keyof typeof callbacks]: PropertyDescriptor;
    };

    const factory = (type: keyof typeof callbacks) => ({
        get: () => callbacks[type],
        set: (callback?: WatchCallable<any> | null) => {
            if (callback == undefined) {
                callbacks[type] = noop;
            } else if (typeof callback === 'function' && callback !== callbacks[type]) {
                callbacks[type] = callback;
            }
        },
    });

    for (const key of Object.keys(callbacks) as (keyof typeof callbacks)[]) {
        descriptors[key] = factory(key);
    }

    return struct(descriptors) as Watchable<T>['callback'];
};

export default class __Watchable__<T extends Record<string, any>> {
    readonly #idleCallbacks: Watchable<T>['callback'];
    readonly #liveState: T;

    #lastStateSnapshot?: T;
    #unwatchCallbacks = new WeakSet<WatchCallable<void>>();
    #watchCallbacks = new Map<WatchCallback<T>, number>();

    constructor(watchableAtoms = {} as WatchAtoms<T>) {
        this.#idleCallbacks = createWatchableIdleCallbacks<T>();
        this.#liveState = createLiveWatchableState(watchableAtoms);
        this.notifyWatchers = this.notifyWatchers.bind(this);
        this.watch = this.watch.bind(this);
    }

    get idle() {
        return this.#watchCallbacks.size === 0;
    }

    get idleCallbacks() {
        return this.#idleCallbacks;
    }

    get snapshot() {
        return { ...(this.#lastStateSnapshot || this.#liveState) };
    }

    notifyWatchers(signal?: typeof UNWATCH_SIGNAL) {
        if (this.#watchCallbacks.size === 0) return;

        if (signal === UNWATCH_SIGNAL) {
            this.#watchCallbacks.forEach((_, cb) => cb(signal));
            return true;
        }

        const currentSnapshot = this.#lastStateSnapshot as T;
        this.#lastStateSnapshot = { ...this.#liveState };

        for (const key of Object.keys(this.#lastStateSnapshot) as (keyof T)[]) {
            if (this.#lastStateSnapshot[key] !== currentSnapshot[key] && this.#lastStateSnapshot[key] === this.#lastStateSnapshot[key]) {
                this.#watchCallbacks.forEach((_, cb) => cb(this.#lastStateSnapshot as T));
                return true;
            }
        }

        return false;
    }

    watch(watchCallback?: WatchCallback<T>) {
        if (!watchCallback) return noop;

        const unwatchCallback = () => {
            let callbackUnwatchCallbacksCount = this.#watchCallbacks.get(watchCallback) || 0;

            if (this.#unwatchCallbacks.delete(unwatchCallback)) {
                this.#watchCallbacks.set(watchCallback, (callbackUnwatchCallbacksCount = Math.max(0, --callbackUnwatchCallbacksCount)));
            }

            if (callbackUnwatchCallbacksCount === 0 && this.#watchCallbacks.delete(watchCallback) && this.#watchCallbacks.size === 0) {
                this.#lastStateSnapshot = undefined;
                this.#idleCallbacks.idle();
            }
        };

        const callbackUnwatchCallbacksCount = this.#watchCallbacks.get(watchCallback) || 0;

        this.#unwatchCallbacks.add(unwatchCallback);
        this.#watchCallbacks.set(watchCallback, callbackUnwatchCallbacksCount + 1);

        if (callbackUnwatchCallbacksCount === 0) {
            this.#lastStateSnapshot = this.#lastStateSnapshot || { ...this.#liveState };
            this.#idleCallbacks.resume();
        }

        watchCallback(this.#lastStateSnapshot as T);

        return unwatchCallback;
    }
}
