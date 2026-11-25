import { EVT_SESSION_EXPIRED, EVT_SESSION_READY, EVT_SESSION_REFRESHED, EVT_SESSION_REFRESHING_END, EVT_SESSION_REFRESHING_START } from './constants';
import type { GetPredicateType, Promised } from '@integration-components/utils/types';

export type SessionEventType =
    | typeof EVT_SESSION_EXPIRED
    | typeof EVT_SESSION_READY
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

    /**
     * Minimum interval (in milliseconds) between session refreshes triggered by expired-token
     * responses (e.g. 401). Within the interval, such responses are rejected without refreshing.
     * Does not affect deadline-driven or explicit refreshes. `0` disables the throttle; invalid
     * values fall back to `DEFAULT_SESSION_REAUTH_THROTTLE_MS`.
     */
    reauthThrottleMs?: number;
}
