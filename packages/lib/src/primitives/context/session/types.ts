import { EVT_SESSION_EXPIRED, EVT_SESSION_REFRESHED, EVT_SESSION_REFRESHING_END, EVT_SESSION_REFRESHING_START } from './constants';
import type { GetPredicateType, Promised } from '../../../utils/types';

export type SessionEventType =
    | typeof EVT_SESSION_EXPIRED
    | typeof EVT_SESSION_REFRESHED
    | typeof EVT_SESSION_REFRESHING_END
    | typeof EVT_SESSION_REFRESHING_START;

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
