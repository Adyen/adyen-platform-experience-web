import { enumerable, getMappedValue, getter, isFunction, noop, sameValue, struct } from '../../../utils';
import { createWatchListCurrentStateRecord, createWatchListSubscriptionEventCallbacks } from './helpers';
import type { WatchList, WatchListEntries, WatchListSubscriptionCallback } from './types';
import { UNSUBSCRIBE_TOKEN } from './constants';

export const isWatchlistUnsubscribeToken = <T extends Record<string, any>>(
    currentStateSnapshotOrUnsubscribeToken?: Parameters<WatchListSubscriptionCallback<T>>[0]
): currentStateSnapshotOrUnsubscribeToken is typeof UNSUBSCRIBE_TOKEN => currentStateSnapshotOrUnsubscribeToken === UNSUBSCRIBE_TOKEN;

export const createWatchlist = <T extends Record<string, any>>(entries: WatchListEntries<T>) => {
    let lastStateSnapshot: Readonly<T> | undefined;

    const currentState = createWatchListCurrentStateRecord(entries);
    const subscriptionEventCallbacks = createWatchListSubscriptionEventCallbacks();
    const subscriptionCallbacksWithReferenceCounting = new Map<WatchListSubscriptionCallback<T>, number>();
    const unsubscribeCallbacks = new WeakMap<WatchListSubscriptionCallback<T>, (...args: any[]) => void>();

    const _getCurrentStateSnapshot = () => Object.freeze({ ...currentState });
    const _isWithoutSubscriptionCallbacks = () => subscriptionCallbacksWithReferenceCounting.size === 0;

    const _notifySubscriptions = (unsubscribeToken?: typeof UNSUBSCRIBE_TOKEN) => {
        if (_isWithoutSubscriptionCallbacks()) return;

        if (isWatchlistUnsubscribeToken(unsubscribeToken)) {
            const subscriptionCallbacks: WatchListSubscriptionCallback<T>[] = [];

            subscriptionCallbacksWithReferenceCounting.forEach((referenceCount, callback) => {
                subscriptionCallbacks.push(callback);
                const unsubscribeCallback = unsubscribeCallbacks.get(callback)!;
                while (referenceCount--) unsubscribeCallback?.();
            });

            subscriptionCallbacks.forEach(callback => callback(unsubscribeToken));
            return true;
        }

        const currentStateSnapshot = lastStateSnapshot as Readonly<T>;

        lastStateSnapshot = _getCurrentStateSnapshot();

        for (const key of Object.keys(lastStateSnapshot) as (keyof T)[]) {
            if (sameValue(lastStateSnapshot[key], currentStateSnapshot[key])) continue;
            subscriptionCallbacksWithReferenceCounting.forEach((_, callback) => callback(lastStateSnapshot!));
            return true;
        }

        return false;
    };

    const subscribe: WatchList<T>['subscribe'] = (subscriptionCallback?: WatchListSubscriptionCallback<T>) => {
        if (!isFunction(subscriptionCallback)) return noop;

        const unsubscribeCallback = getMappedValue(subscriptionCallback, unsubscribeCallbacks, () => {
            let unsubscribe: (() => void) | undefined = () => {
                const subscriptionCallbackReferenceCount = subscriptionCallbacksWithReferenceCounting.get(subscriptionCallback) || 0;

                if (subscriptionCallbackReferenceCount === 1) {
                    unsubscribe = undefined;
                    subscriptionCallbacksWithReferenceCounting.delete(subscriptionCallback);
                    unsubscribeCallbacks.delete(subscriptionCallback);

                    if (_isWithoutSubscriptionCallbacks()) {
                        lastStateSnapshot = undefined;
                        subscriptionEventCallbacks.idle();
                    }
                } else if (subscriptionCallbackReferenceCount > 1) {
                    subscriptionCallbacksWithReferenceCounting.set(subscriptionCallback, subscriptionCallbackReferenceCount - 1);
                }
            };

            return () => {
                unsubscribe?.();
            };
        })!;

        const willResumeSubscriptions = _isWithoutSubscriptionCallbacks();

        subscriptionCallbacksWithReferenceCounting.set(
            subscriptionCallback,
            (subscriptionCallbacksWithReferenceCounting.get(subscriptionCallback) || 0) + 1
        );

        if (willResumeSubscriptions) {
            lastStateSnapshot = _getCurrentStateSnapshot();
            subscriptionEventCallbacks.resume();
        }

        subscriptionCallback(lastStateSnapshot!);

        return unsubscribeCallback;
    };

    return struct<WatchList<T>>({
        idle: getter(_isWithoutSubscriptionCallbacks),
        on: enumerable(subscriptionEventCallbacks),
        cancelSubscriptions: enumerable(() => _notifySubscriptions(UNSUBSCRIBE_TOKEN) as true),
        requestNotification: enumerable(() => _notifySubscriptions()),
        snapshot: getter(() => lastStateSnapshot ?? _getCurrentStateSnapshot()),
        subscribe: enumerable(subscribe),
    });
};

export default createWatchlist;
