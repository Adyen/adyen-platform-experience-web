import { EVT_SESSION_EXPIRED_STATE_CHANGE, EVT_SESSION_REFRESHING_STATE_CHANGE } from './constants';
import type { Promised } from '../../../utils/types';

export type SessionEventType = typeof EVT_SESSION_EXPIRED_STATE_CHANGE | typeof EVT_SESSION_REFRESHING_STATE_CHANGE;

export interface SessionSpecification<T, HttpParams extends any[] = any[]> {
    assert?: (maybeSession: any) => asserts maybeSession is T;
    deadline?: (session: T) => Promised<Date | number | string | undefined>;
    http?: (currentSession: T | undefined, ...args: HttpParams) => Promised<any>;
    next: (currentSession: T | undefined, signal: AbortSignal) => Promised<T>;
}
