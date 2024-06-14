import { EVT_SESSION_EXPIRED_STATE_CHANGE, EVT_SESSION_REFRESHING_STATE_CHANGE } from './constants';
import type { GetPredicateType, Promised } from '../../../utils/types';

export type SessionEventType = typeof EVT_SESSION_EXPIRED_STATE_CHANGE | typeof EVT_SESSION_REFRESHING_STATE_CHANGE;

type _SessionAutoRefresh = boolean | undefined;
type _SessionDeadline = _SessionDeadlineSingle | _SessionDeadlineSingle[];
type _SessionDeadlineSingle = AbortSignal | Date | number | string | undefined;

export interface SessionSpecification<T, HttpParams extends any[] = any[]> {
    autoRefresh?: _SessionAutoRefresh | ((currentSession: T | undefined) => Promised<_SessionAutoRefresh>);
    assert?: <S>(maybeSession: S) => asserts maybeSession is GetPredicateType<T, S>;
    deadline?: _SessionDeadline | ((currentSession: T | undefined, signal: AbortSignal) => Promised<_SessionDeadline>);
    http?: (currentSession: T | undefined, signal: AbortSignal, ...args: HttpParams) => Promised<any>;
    onRefresh: (currentSession: T | undefined, signal: AbortSignal) => Promised<T>;
}
