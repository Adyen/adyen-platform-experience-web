import { createLiveWatchableState, createWatchableIdleCallbacks } from './helpers';
import { Watchable, WatchAtoms, WatchCallable, WatchCallback } from './types';
import { UNWATCH_SIGNAL } from './constants';
import { noop } from '../utils';

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
