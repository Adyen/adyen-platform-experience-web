import { EVT_SESSION_ACTIVE_STATE_CHANGE, EVT_SESSION_INIT_STATE_CHANGE } from './constants';
import type { Emitter } from '@src/primitives/common/eventEmitter';

type _MaybePromise<T> = T | Promise<T>;

type _OmitFirstParameter<T extends (...args: any[]) => any, FirstParam> = T extends (
    session: FirstParam,
    ...args: infer RestParams
) => infer ReturnValue
    ? (...args: RestParams) => ReturnValue
    : T;

type _SessionCallable<Callable extends (...args: any[]) => any, T, HttpParams extends any[] = any[]> = Callable extends (
    withSessionProvisioningParams?: SessionProvisioningParams<T, HttpParams>
) => infer ReturnValue
    ? (withSessionProvisioningParams?: SessionProvisioningParams<T, HttpParams>) => ReturnValue
    : never;

export interface Session<T, HttpParams extends any[] = any[]> {
    readonly http: SessionHttpExecutor<T, HttpParams>;
    get initializing(): boolean;
    get isExpired(): boolean | undefined;
    readonly on: Emitter<SessionEventType>['on'];
    get timestamp(): number | undefined;
}

export type SessionCallable<T, HttpParams extends any[] = any[]> = _SessionCallable<
    (withSessionProvisioningParams?: SessionProvisioningParams<T, HttpParams>) => any,
    T,
    HttpParams
>;

export type SessionEventType = typeof EVT_SESSION_ACTIVE_STATE_CHANGE | typeof EVT_SESSION_INIT_STATE_CHANGE;
export type SessionFactory<T, HttpParams extends any[] = any[]> = SessionProvisioningParams<T, HttpParams>['createNext'] & {};
export type SessionHttpExecutor<T, HttpParams extends any[] = any[]> = _OmitFirstParameter<SessionProvisioningParams<T, HttpParams>['http'] & {}, T>;

export interface SessionProvisioningParams<T, HttpParams extends any[] = any[]> {
    assert?: (maybeSession: any) => asserts maybeSession is T;
    createNext?: (currentSession: T | undefined, signal: AbortSignal) => _MaybePromise<T>;
    getDeadline?: (session: T) => _MaybePromise<Date | number | string | undefined>;
    http?: (currentSession: T | undefined, ...args: HttpParams) => _MaybePromise<any>;
}
