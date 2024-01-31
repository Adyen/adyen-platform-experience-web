import { createLiveWatchableState, createWatchableIdleCallbacks } from './helpers';
import { Watchable, WatchAtoms, WatchCallable, WatchCallback } from '../types';
import { UNWATCH_SIGNAL } from '../constants';
import { noop } from '../../common';

export default class __Watchable__<T extends Record<string, any>> {
    readonly #idleCallbacks: Watchable<T>['callback'];
    readonly #liveState: T;

    #lastStateSnapshot?: T;
    #unwatchCallbacks = new WeakMap<WatchCallback<T>, WatchCallable<void>>();
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

        let unwatchCallback = this.#unwatchCallbacks.get(watchCallback);
        const callbackUnwatchCallbacksCount = this.#watchCallbacks.get(watchCallback) || 0;

        if (!unwatchCallback) {
            let unwatch = () => {
                const callbackUnwatchCallbacksCount = this.#watchCallbacks.get(watchCallback) || 0;

                if (callbackUnwatchCallbacksCount === 1) {
                    unwatch = undefined as unknown as () => any;
                    this.#unwatchCallbacks.delete(watchCallback);
                    this.#watchCallbacks.delete(watchCallback);

                    if (this.#watchCallbacks.size === 0) {
                        this.#lastStateSnapshot = undefined;
                        this.#idleCallbacks.idle();
                    }
                } else if (callbackUnwatchCallbacksCount > 1) {
                    this.#watchCallbacks.set(watchCallback, callbackUnwatchCallbacksCount - 1);
                }
            };

            this.#unwatchCallbacks.set(watchCallback, (unwatchCallback = () => unwatch?.()));
        }

        this.#watchCallbacks.set(watchCallback, callbackUnwatchCallbacksCount + 1);

        if (callbackUnwatchCallbacksCount === 0) {
            this.#lastStateSnapshot ||= { ...this.#liveState };
            this.#idleCallbacks.resume();
        }

        watchCallback(this.#lastStateSnapshot as T);

        return unwatchCallback;
    }
}
