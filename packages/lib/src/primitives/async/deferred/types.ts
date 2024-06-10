import type { Promised } from '../../../utils/types';

export interface Deferred<T extends Promised<any>, K extends Promised<any> = T> {
    get promise(): Promise<T>;
    readonly refresh: () => Deferred<T, K>;
    readonly reject: (reason?: any) => void;
    readonly resolve: (value: K) => void;
}

export type DeferredThenCallback<T extends Promised<any>, K extends Promised<any> = any> = (value: K) => T;
export type DeferredCatchCallback<T extends Promised<any>> = (reason?: any) => T;
