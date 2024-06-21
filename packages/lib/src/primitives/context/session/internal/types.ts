import type { Emitter } from '../../../reactive/eventEmitter';

export type SessionEventEmitter<T extends any> = Emitter<{ session: T }>;

export interface SessionDeadlineController<T extends any> {
    readonly abort: () => void;
    get elapsed(): boolean | undefined;
    readonly refresh: (session: T | undefined) => void;
    get signal(): AbortSignal | undefined;
    get timestamp(): number | undefined;
}

export interface SessionRefreshController<T extends any> {
    readonly on: SessionEventEmitter<T>['on'];
    get promise(): Promise<T>;
    readonly refresh: () => Promise<T>;
    get refreshing(): boolean;
    get session(): T | undefined;
    get signal(): AbortSignal | undefined;
}
