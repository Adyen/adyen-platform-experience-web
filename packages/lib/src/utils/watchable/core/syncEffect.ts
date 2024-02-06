import { WatchCallable } from '../types';
import { struct } from '@src/utils/common';

const createSyncEffectChain = (() => {
    const noop = <T extends WatchCallable<any> = WatchCallable<any>>(fn: T): T => fn;
    const noex = struct();

    return (effect?: WatchCallable<any>) => {
        if (effect === undefined) return noop;

        const chainedFnStack: WatchCallable<any>[] = [];

        return <T extends WatchCallable<any> = WatchCallable<any>>(fn: T): T =>
            ((...args: any[]) => {
                let exception = noex;
                try {
                    chainedFnStack.push(fn);
                    return fn(...args);
                } catch (ex) {
                    throw (exception = ex);
                } finally {
                    chainedFnStack.pop();
                    if (chainedFnStack.length === 0 && exception === noex) effect();
                }
            }) as T;
    };
})();

export default createSyncEffectChain;
