import type { Emitter } from '../../../reactive/eventEmitter';

export type SessionEventEmitter<T extends any> = Emitter<{ session: T }>;

export interface SessionRefreshManager<T extends any> {
    readonly on: SessionEventEmitter<T>['on'];
    get promise(): Promise<T>;
    readonly refresh: () => void;
    get refreshing(): boolean;
    get session(): T | undefined;
    get signal(): AbortSignal;
}
