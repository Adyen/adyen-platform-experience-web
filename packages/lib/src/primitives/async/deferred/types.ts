import type { Promised } from '../../../utils/types';

export interface Deferred<T = any> {
    get promise(): Promise<T>;
    readonly refresh: () => Deferred<T>;
    readonly reject: (reason?: any) => void;
    readonly resolve: (value: Promised<T>) => void;
}
