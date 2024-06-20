import clock from '../../../time/clock';
import { enumerable, getter, isFunction, noop, parseDate, struct, tryResolve } from '../../../../utils';
import { createAbortSink, isAbortSignal } from '../../../auxiliary/abortSink';
import { createPromisor } from '../../../async/promisor';
import { isWatchlistUnsubscribeToken } from '../../../reactive/watchlist';
import { EVT_SESSION_EXPIRED, EVT_SESSION_REFRESHED } from '../constants';
import type { Emitter } from '../../../reactive/eventEmitter';
import type { SessionEventType, SessionSpecification } from '../types';
import type { SessionDeadline } from './types';

export const createSessionDeadlineManager = <T extends any>(emitter: Emitter<SessionEventType>, specification: SessionSpecification<T>) => {
    let _abort = noop;
    let _active = false;
    let _deadlineSignal: AbortSignal | undefined;
    let _deadlineTimestamp: number | undefined;
    let _refreshPromisorSignal: AbortSignal | undefined;
    let _stopDeadlineClock: (() => void) | undefined;

    const _clearDeadline = () => {
        _deadlineSignal?.removeEventListener('abort', _clearDeadline);
        _deadlineTimestamp = Math.min(Date.now(), _deadlineTimestamp ?? Infinity);
        _stopDeadlineClock?.();
        _refreshPromisor.abort();

        if (_active) {
            _active = false;
            emitter.emit(EVT_SESSION_EXPIRED);
        }
    };

    const _getSessionDeadline = (session: T | undefined, signal: AbortSignal) =>
        tryResolve(() => {
            const _deadline = specification.deadline;
            return isFunction(_deadline) ? _deadline.call(specification, session, signal) : _deadline;
        }).catch(noop);

    const _refreshPromisor = createPromisor(async (signal, session: T | undefined) => {
        _abort();
        _refreshPromisorSignal = signal;

        const sessionDeadline = await _getSessionDeadline(session, signal);

        if (_refreshPromisorSignal !== signal) return;

        const DEADLINES = Array.isArray(sessionDeadline) ? sessionDeadline : [sessionDeadline];
        const SIGNALS = new Set<AbortSignal>();

        let deadlineElapsed = false;
        let earliestTime = Infinity;

        for (const deadline of DEADLINES) {
            if (isAbortSignal(deadline)) {
                if ((deadlineElapsed = deadline.aborted)) break;
                SIGNALS.add(deadline);
            } else {
                earliestTime = Math.min(earliestTime, parseDate(deadline!) ?? Infinity);
                if (Number.isFinite(earliestTime) && (deadlineElapsed = earliestTime <= Date.now())) break;
            }
        }

        _active = !deadlineElapsed && (SIGNALS.size > 0 || Number.isFinite(earliestTime));
        _deadlineSignal = _deadlineTimestamp = undefined;

        if (_active) {
            ({ abort: _abort, signal: _deadlineSignal } = createAbortSink(...SIGNALS));
            _deadlineSignal.addEventListener('abort', _clearDeadline);
            if (Number.isFinite(earliestTime)) _startDeadlineClock(earliestTime);
        }

        // clear collections
        DEADLINES.length = 0;
        SIGNALS.clear();

        emitter.emit(EVT_SESSION_REFRESHED);
    });

    const _startDeadlineClock = (deadlineTimestamp: number) => {
        _deadlineTimestamp = deadlineTimestamp;

        let unsubscribeClock = clock.subscribe(snapshotOrSignal => {
            if (isWatchlistUnsubscribeToken(snapshotOrSignal)) return _stopDeadlineClock?.();
            if (snapshotOrSignal.now >= deadlineTimestamp) _abort();
        });

        _stopDeadlineClock = () => {
            unsubscribeClock?.();
            unsubscribeClock = _stopDeadlineClock = undefined!;
        };
    };

    return struct<SessionDeadline<T>>({
        abort: enumerable(() => _abort()),
        elapsed: getter(() => _deadlineSignal && _deadlineSignal.aborted),
        refresh: enumerable(session => void _refreshPromisor(session)),
        signal: getter(() => _deadlineSignal),
        timestamp: getter(() => _deadlineTimestamp),
    });
};

export default createSessionDeadlineManager;
