import { WatchCallable } from '../types';
import { EMPTY_OBJECT } from '@src/utils/common/constants';

const createSyncEffectChain = (() => {
    const noop = <T extends WatchCallable<any> = WatchCallable<any>>(fn: T): T => fn;

    return (effect?: WatchCallable<any>) => {
        if (effect === undefined) return noop;

        const chainedFnStack: WatchCallable<any>[] = [];

        return <T extends WatchCallable<any> = WatchCallable<any>>(fn: T): T =>
            ((...args: any[]) => {
                let exception = EMPTY_OBJECT;
                try {
                    chainedFnStack.push(fn);
                    return fn(...args);
                } catch (ex) {
                    throw (exception = ex);
                } finally {
                    chainedFnStack.pop();
                    if (chainedFnStack.length === 0 && exception === EMPTY_OBJECT) effect();
                }
            }) as T;
    };
})();

export default createSyncEffectChain;
