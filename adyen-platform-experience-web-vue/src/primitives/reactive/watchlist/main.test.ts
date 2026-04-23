import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { createWatchlist, isWatchlistUnsubscribeToken } from './main';
import { noop } from '../../../utils';
import { UNSUBSCRIBE_TOKEN } from './constants';
import type { WatchList } from './types';

describe('isWatchlistUnsubscribeToken', () => {
    test('should return true for only unique unsubscribe token symbol', () => {
        expect(isWatchlistUnsubscribeToken(UNSUBSCRIBE_TOKEN)).toBe(true);
        expect(isWatchlistUnsubscribeToken(Symbol())).toBe(false);
        expect(isWatchlistUnsubscribeToken()).toBe(false);
    });
});

describe('createWatchlist', () => {
    type TestWatchList = {
        version: number;
        watchlist: WatchList<{ version: number }>;
        watchFn: Mock;
    };

    beforeEach<TestWatchList>(context => {
        let VERSION = 1;

        Object.defineProperties(context, {
            version: {
                enumerable: true,
                get: () => VERSION,
                set: (version: number) => {
                    VERSION = version;
                },
            },
            watchlist: { enumerable: true, value: createWatchlist({ version: () => VERSION }) },
            watchFn: { enumerable: true, value: vi.fn() },
        });
    });

    test<TestWatchList>('should create watchlist', context => {
        const watchlist = context.watchlist;

        expect(watchlist).toHaveProperty('cancelSubscriptions');
        expect(watchlist).toHaveProperty('idle');
        expect(watchlist).toHaveProperty('on');
        expect(watchlist).toHaveProperty('requestNotification');
        expect(watchlist).toHaveProperty('snapshot');
        expect(watchlist).toHaveProperty('subscribe');

        expect(watchlist.idle).toBe(true);
        expect(watchlist.on.idle).toBe(noop);
        expect(watchlist.on.resume).toBe(noop);

        expect(watchlist.snapshot).toBeTypeOf('object');
        expect(watchlist.snapshot).toHaveProperty('version');
        expect(watchlist.snapshot.version).toBe(context.version);

        expect(watchlist.cancelSubscriptions).toBeTypeOf('function');
        expect(watchlist.requestNotification).toBeTypeOf('function');
        expect(watchlist.subscribe).toBeTypeOf('function');

        // no subscriptions registered yet
        expect(watchlist.requestNotification()).toBeUndefined();
    });

    test<TestWatchList>('should recompute state snapshot correctly', context => {
        const watchlist = context.watchlist;

        // watchlist is idle (there are no subscriptions)
        expect(watchlist.idle).toBe(true);

        // watchlist is still idle (snapshot is always recomputed to reflect the latest state)
        expect(watchlist.snapshot.version).toBe(context.version++); // current version
        expect(watchlist.snapshot.version).toBe(context.version); // updated version

        // register a subscription function
        const unsubscribe = watchlist.subscribe(context.watchFn);

        // subscription function is called immediately on subscribe
        expect(context.watchFn).toBeCalledTimes(1);

        // watchlist is no longer idle
        expect(watchlist.idle).toBe(false);

        // update version
        context.version++;

        // watchlist is not idle (snapshot is lazily recomputed only when requestNotification() is called)
        // hence snapshot can be stale pending a call to requestNotification()
        expect(watchlist.snapshot.version).not.toBe(context.version);
        expect(watchlist.snapshot.version).toBe(context.version - 1);

        // notify subscriptions (version updated)
        expect(watchlist.requestNotification()).toBe(true);
        expect(context.watchFn).toBeCalledTimes(2);
        expect(watchlist.snapshot.version).toBe(context.version);

        // unregister subscription
        unsubscribe();

        // watchlist is now back to being idle
        expect(watchlist.idle).toBe(true);

        // update version
        context.version++;

        // in its idle state (snapshot will always be recomputed to reflect the latest state
        // even if the requestNotification() is not called (because there are no registered subscriptions)
        expect(watchlist.snapshot.version).toBe(context.version);
    });

    test<TestWatchList>('should trigger subscription callbacks correctly', context => {
        const watchlist = context.watchlist;
        const idleCallback = (watchlist.on.idle = vi.fn());
        const resumeCallback = (watchlist.on.resume = vi.fn());

        expect(resumeCallback).toBeCalledTimes(0); // not called
        expect(idleCallback).toBeCalledTimes(0); // not called
        expect(watchlist.idle).toBe(true); // watchlist is idle (there are no registered subscriptions)

        // register a subscription function
        const unsubscribe = watchlist.subscribe(context.watchFn);

        expect(context.watchFn).toBeCalledTimes(1); // subscription function is called immediately on subscribe
        expect(resumeCallback).toBeCalledTimes(1); // was called (exited idle state)
        expect(idleCallback).toBeCalledTimes(0); // not called (exited idle state)
        expect(watchlist.idle).toBe(false); // watchlist is no longer idle

        expect(watchlist.requestNotification()).toBe(false); // state is unchanged (this call does nothing)
        expect(watchlist.snapshot.version).toBe(context.version); // version unchanged

        // not called because state did not changed
        expect(context.watchFn).toBeCalledTimes(1);

        // update version
        context.version++;

        // notify subscriptions (version updated)
        expect(watchlist.requestNotification()).toBe(true);
        expect(context.watchFn).toBeCalledTimes(2);
        expect(watchlist.snapshot.version).toBe(context.version);

        // register the same subscription function again
        const unsubscribe2 = watchlist.subscribe(context.watchFn);

        expect(context.watchFn).toBeCalledTimes(3); // called immediately on subscribe
        expect(resumeCallback).toBeCalledTimes(1); // not called (already exited idle state earlier)
        expect(idleCallback).toBeCalledTimes(0); // not called

        // shared unsubscribe function
        expect(unsubscribe).toBe(unsubscribe2);

        context.version++; // update version
        expect(watchlist.requestNotification()).toBe(true); // notify subscriptions of possible state update

        // subscription function called only once though registered twice
        expect(context.watchFn).toBeCalledTimes(4);

        // unregister first subscription
        unsubscribe();

        expect(resumeCallback).toBeCalledTimes(1); // not called
        expect(idleCallback).toBeCalledTimes(0); // not called (not yet in idle state)
        expect(watchlist.idle).toBe(false); // not idle yet (there is still one subscription)

        // unregister second subscription
        unsubscribe2();

        expect(resumeCallback).toBeCalledTimes(1); // not called
        expect(idleCallback).toBeCalledTimes(1); // was called (entered into idle state)
        expect(watchlist.idle).toBe(true); // now idle (there are no subscriptions)
    });

    test<TestWatchList>('should trigger callbacks correctly for subscriptions cancellation', context => {
        const watchlist = context.watchlist;
        const anotherWatchFn = vi.fn();

        // register subscription functions
        // each subscription function will be called once on registration
        watchlist.subscribe(context.watchFn);
        watchlist.subscribe(anotherWatchFn);

        // cancel all subscriptions
        expect(watchlist.cancelSubscriptions()).toBe(true);

        expect(context.watchFn).toBeCalledTimes(2);
        expect(anotherWatchFn).toBeCalledTimes(2);

        expect(context.watchFn).toHaveBeenLastCalledWith(UNSUBSCRIBE_TOKEN);
        expect(anotherWatchFn).toHaveBeenLastCalledWith(UNSUBSCRIBE_TOKEN);
    });
});
