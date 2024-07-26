import {
    INTERNAL_EVT_SESSION_DEADLINE,
    INTERNAL_EVT_SESSION_READY,
    INTERNAL_EVT_SESSION_REFRESHING_END,
    INTERNAL_EVT_SESSION_REFRESHING_START,
} from './constants';
import type { Emitter } from '../../../reactive/eventEmitter';
import type { SessionEventType, SessionSpecification } from '../types';

export type SessionDeadlineEmitter = Emitter<typeof INTERNAL_EVT_SESSION_DEADLINE>;

export type SessionRefresherEmitter = Emitter<
    typeof INTERNAL_EVT_SESSION_READY | typeof INTERNAL_EVT_SESSION_REFRESHING_END | typeof INTERNAL_EVT_SESSION_REFRESHING_START
>;

export interface SessionDeadline<T extends any> {
    readonly elapse: () => void;
    get elapsed(): boolean | undefined;
    readonly on: SessionDeadlineEmitter['on'];
    readonly refresh: (session: T | undefined) => Promise<void>;
    get signal(): AbortSignal;
}

export interface SessionRefresher<T extends any> {
    readonly context: SessionRefresherContext<T>;
    readonly on: SessionRefresherEmitter['on'];
    get pending(): boolean;
    get promise(): Promise<void>;
    readonly refresh: (signal?: AbortSignal | undefined) => Promise<void>;
    get refreshing(): boolean;
    get session(): T | undefined;
    get signal(): AbortSignal;
}

export interface SessionRefresherContext<T extends any> {
    emitter: Emitter<SessionEventType>;
    specification: SessionSpecification<T>;
}
