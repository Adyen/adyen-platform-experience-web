import { EVT_SESSION_ACTIVE, EVT_SESSION_INIT } from './constants';
import type { Promised } from '../../../utils/types';

export type SessionEventType = typeof EVT_SESSION_ACTIVE | typeof EVT_SESSION_INIT;

export interface SessionSpecification<T, HttpParams extends any[] = any[]> {
    assert?: (maybeSession: any) => asserts maybeSession is T;
    deadline?: (session: T) => Promised<Date | number | string | undefined>;
    http?: (currentSession: T | undefined, ...args: HttpParams) => Promised<any>;
    next: (currentSession: T | undefined, signal: AbortSignal) => Promised<T>;
}
