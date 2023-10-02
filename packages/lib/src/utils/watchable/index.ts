import syncEffect from './core/syncEffect';
import __Watchable__ from './core/Watchable';
import { WatchableFactory } from './types';
import { struct } from '../common';

const watchable = (watchableAtoms => {
    const instance = new __Watchable__(watchableAtoms);

    return struct({
        callback: { value: instance.idleCallbacks },
        idle: { get: () => instance.idle },
        notify: { value: instance.notifyWatchers },
        snapshot: { get: () => instance.snapshot },
        watch: { value: instance.watch },
    });
}) as WatchableFactory;

export default Object.defineProperties(watchable, {
    withSyncEffect: { value: syncEffect },
});
