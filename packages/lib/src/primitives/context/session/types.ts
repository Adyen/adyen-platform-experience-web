import { EVT_SESSION_EXPIRED_STATE_CHANGE, EVT_SESSION_REFRESHING_STATE_CHANGE } from './constants';
import type { GetPredicateType, Promised } from '../../../utils/types';

export type SessionEventType = typeof EVT_SESSION_EXPIRED_STATE_CHANGE | typeof EVT_SESSION_REFRESHING_STATE_CHANGE;

export interface SessionSpecification<T, HttpParams extends any[] = any[]> {
    autoRefresh?: boolean | ((currentSession: T | undefined) => Promised<boolean | undefined>);
    assert?: <S>(maybeSession: S) => asserts maybeSession is GetPredicateType<T, S>;
    deadline?: (session: T) => Promised<Date | number | string | undefined>;
    http?: (currentSession: T | undefined, signal: AbortSignal, ...args: HttpParams) => Promised<any>;
    onRefresh: (currentSession: T | undefined, signal: AbortSignal) => Promised<T>;
}
