import __Watchable__ from './base';
import { Watchable, WatchAtoms } from './types';
import { struct } from '../utils';

const watchable = <T extends Record<string, any>>(watchableAtoms = {} as WatchAtoms<T>) => {
    const base = new __Watchable__(watchableAtoms);

    return struct({
        callback: { value: base.idleCallbacks },
        idle: { get: () => base.idle },
        notify: { value: base.notifyWatchers },
        snapshot: { get: () => base.snapshot as T },
        watch: { value: base.watch },
    }) as Watchable<T>;
};

export default watchable;
