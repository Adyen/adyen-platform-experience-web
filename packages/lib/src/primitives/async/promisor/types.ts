import type { Promised } from '../../../utils/types';

export interface Promisor<T, K = T> {
    get promise(): Promise<T>;
    readonly refresh: () => Promisor<T, K>;
    readonly reject: (reason?: any) => void;
    readonly resolve: (value: K) => void;
}

export type PromisorThenCallback<T, K = any> = (value: K) => Promised<T>;
export type PromisorCatchCallback<T> = (reason?: any) => Promised<T>;
