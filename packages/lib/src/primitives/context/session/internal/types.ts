import { INTERNAL_EVT_SESSION_READY } from './constants';
import type { Emitter } from '../../../reactive/eventEmitter';

export type SessionEventEmitter = Emitter<typeof INTERNAL_EVT_SESSION_READY>;

export interface SessionAutofresher {
    readonly recover: (error: any) => void;
    readonly refresh: (skipCanAutofreshCheck?: boolean) => void;
}

export interface SessionDeadline<T extends any> {
    get elapsed(): boolean | undefined;
    readonly refresh: (session: T | undefined) => void;
    get signal(): AbortSignal | undefined;
}

export interface SessionRefresher<T extends any> {
    readonly expire: (expireCallback?: (...args: any[]) => any) => void;
    readonly on: SessionEventEmitter['on'];
    get pending(): boolean;
    get promise(): Promise<void>;
    readonly refresh: () => Promise<void>;
    get refreshing(): boolean;
    get session(): T | undefined;
    get signal(): AbortSignal | undefined;
}
