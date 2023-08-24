import __Watchable__ from './Watchable';
import { Watchable, WatchAtoms } from './types';
import { struct } from '../utils';

const watchable = <T extends Record<string, any>>(watchableAtoms = {} as WatchAtoms<T>) => {
    const instance = new __Watchable__(watchableAtoms);

    return struct({
        callback: { value: instance.idleCallbacks },
        idle: { get: () => instance.idle },
        notify: { value: instance.notifyWatchers },
        snapshot: { get: () => instance.snapshot as T },
        watch: { value: instance.watch },
    }) as Watchable<T>;
};

export default watchable;
