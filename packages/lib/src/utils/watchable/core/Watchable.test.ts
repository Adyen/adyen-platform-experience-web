import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { noop } from '@src/utils/common';
import Watchable from './Watchable';
import { UNWATCH_SIGNAL } from '../constants';

describe('Watchable', () => {
    type TestWatchable = {
        version: number;
        watchable: Watchable<{ version: number }>;
        watchFn: Mock;
    };

    beforeEach<TestWatchable>(context => {
        let VERSION = 1;

        Object.defineProperties(context, {
            version: {
                enumerable: true,
                get: () => VERSION,
                set: (version: number) => {
                    VERSION = version;
                },
            },
            watchable: { enumerable: true, value: new Watchable({ version: () => VERSION }) },
            watchFn: { enumerable: true, value: vi.fn() },
        });
    });

    test<TestWatchable>('should create watchable instance', context => {
        const watchable = context.watchable;

        expect(watchable).toHaveProperty('idle');
        expect(watchable).toHaveProperty('idleCallbacks');
        expect(watchable).toHaveProperty('notifyWatchers');
        expect(watchable).toHaveProperty('snapshot');
        expect(watchable).toHaveProperty('watch');

        expect(watchable.idle).toBe(true);
        expect(watchable.idleCallbacks.idle).toBe(noop);
        expect(watchable.idleCallbacks.resume).toBe(noop);

        expect(watchable.snapshot).toBeTypeOf('object');
        expect(watchable.snapshot).toHaveProperty('version');
        expect(watchable.snapshot.version).toBe(context.version);

        expect(watchable.notifyWatchers).toBeTypeOf('function');
        expect(watchable.watch).toBeTypeOf('function');

        // no watchers registered yet
        expect(watchable.notifyWatchers()).toBe(undefined);
    });

    test<TestWatchable>('should recompute state snapshot correctly', context => {
        const watchable = context.watchable;

        // watchable is idle (there are no registered watchers)
        expect(watchable.idle).toBe(true);

        // watchable is still idle (snapshot is always recomputed to reflect the latest state)
        expect(watchable.snapshot.version).toBe(context.version++); // current version
        expect(watchable.snapshot.version).toBe(context.version); // updated version

        // register a watch function
        const unwatch = watchable.watch(context.watchFn);

        // watch function is called immediately on watch
        expect(context.watchFn).toBeCalledTimes(1);

        // watchable is no longer idle
        expect(watchable.idle).toBe(false);

        // update version
        context.version++;

        // watchable is not idle (snapshot is lazily recomputed only when notifyWatchers() is called)
        // hence snapshot can be stale pending a call to notifyWatchers()
        expect(watchable.snapshot.version).not.toBe(context.version);
        expect(watchable.snapshot.version).toBe(context.version - 1);

        // notify watchers (version updated)
        expect(watchable.notifyWatchers()).toBe(true);
        expect(context.watchFn).toBeCalledTimes(2);
        expect(watchable.snapshot.version).toBe(context.version);

        // unregister watcher
        unwatch();

        // watchable is now back to being idle
        expect(watchable.idle).toBe(true);

        // update version
        context.version++;

        // in its idle state (snapshot will always be recomputed to reflect the latest state
        // even if the notifyWatchers() is not called (because there are no registered watchers)
        expect(watchable.snapshot.version).toBe(context.version);
    });

    test<TestWatchable>('should trigger watch and idle callbacks correctly', context => {
        const watchable = context.watchable;
        const idleCallback = (watchable.idleCallbacks.idle = vi.fn());
        const resumeCallback = (watchable.idleCallbacks.resume = vi.fn());

        expect(resumeCallback).toBeCalledTimes(0); // not called
        expect(idleCallback).toBeCalledTimes(0); // not called
        expect(watchable.idle).toBe(true); // watchable is idle (there are no registered watchers)

        // register a watch function
        const unwatch = watchable.watch(context.watchFn);

        expect(context.watchFn).toBeCalledTimes(1); // watch function is called immediately on watch
        expect(resumeCallback).toBeCalledTimes(1); // was called (exited idle state)
        expect(idleCallback).toBeCalledTimes(0); // not called (exited idle state)
        expect(watchable.idle).toBe(false); // watchable is no longer idle

        expect(watchable.notifyWatchers()).toBe(false); // state is unchanged (this call does nothing)
        expect(watchable.snapshot.version).toBe(context.version); // version unchanged

        // not called because state did not changed
        expect(context.watchFn).toBeCalledTimes(1);

        // update version
        context.version++;

        // notify watchers (version updated)
        expect(watchable.notifyWatchers()).toBe(true);
        expect(context.watchFn).toBeCalledTimes(2);
        expect(watchable.snapshot.version).toBe(context.version);

        // register the same watch function again
        const unwatch2 = watchable.watch(context.watchFn);

        expect(context.watchFn).toBeCalledTimes(3); // called immediately on watch
        expect(resumeCallback).toBeCalledTimes(1); // not called (already exited idle state earlier)
        expect(idleCallback).toBeCalledTimes(0); // not called

        // shared unwatch function
        expect(unwatch).toBe(unwatch2);

        context.version++; // update version
        expect(watchable.notifyWatchers()).toBe(true); // notify watchers of possible state update

        // watch function called only once though registered twice
        expect(context.watchFn).toBeCalledTimes(4);

        // unregister first watcher
        unwatch();

        expect(resumeCallback).toBeCalledTimes(1); // not called
        expect(idleCallback).toBeCalledTimes(0); // not called (not yet in idle state)
        expect(watchable.idle).toBe(false); // not idle yet (there is still one watcher)

        // unregister second watcher
        unwatch2();

        expect(resumeCallback).toBeCalledTimes(1); // not called
        expect(idleCallback).toBeCalledTimes(1); // was called (entered into idle state)
        expect(watchable.idle).toBe(true); // now idle (there are no watchers)
    });

    test<TestWatchable>('should trigger callbacks correctly with unwatch signal', context => {
        const watchable = context.watchable;
        const anotherWatchFn = vi.fn();

        // register watch functions
        // each watch function will be called once on registration
        watchable.watch(context.watchFn);
        watchable.watch(anotherWatchFn);

        // notify watchers with unwatch signal
        expect(watchable.notifyWatchers(UNWATCH_SIGNAL)).toBe(true);

        expect(context.watchFn).toBeCalledTimes(2);
        expect(anotherWatchFn).toBeCalledTimes(2);

        expect(context.watchFn).toHaveBeenLastCalledWith(UNWATCH_SIGNAL);
        expect(anotherWatchFn).toHaveBeenLastCalledWith(UNWATCH_SIGNAL);
    });
});
