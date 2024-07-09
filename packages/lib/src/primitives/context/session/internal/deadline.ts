import clock from '../../../time/clock';
import { createPromisor } from '../../../async/promisor';
import { isWatchlistUnsubscribeToken } from '../../../reactive/watchlist';
import { createEventEmitter, Emitter } from '../../../reactive/eventEmitter';
import { abortSignalForAny, enumerable, getter, isAbortSignal, isFunction, noop, parseDate, struct, tryResolve } from '../../../../utils';
import { EVT_SESSION_REFRESHING_START } from '../constants';
import { INTERNAL_EVT_SESSION_DEADLINE } from './constants';
import type { SessionEventType, SessionSpecification } from '../types';
import type { SessionDeadline, SessionDeadlineEmitter } from './types';

const _aborted = (signal: AbortSignal | undefined) => signal && signal.aborted;

export const createSessionDeadline = <T extends any>(emitter: Emitter<SessionEventType>, specification: SessionSpecification<T>) => {
    let _deadlineEventPending = false;
    let _deadlineElapseSignal: AbortSignal | undefined;
    let _deadlineSignal: AbortSignal | undefined;
    let _deadlineTimestamp: number = Infinity;
    let _refreshPromisorSignal: AbortSignal | undefined;
    let _stopDeadlineClock: (() => void) | undefined;

    const _deadlineEmitter: SessionDeadlineEmitter = createEventEmitter();

    const _clearDeadline = () => {
        _deadlineSignal?.removeEventListener('abort', _clearDeadline);
        _deadlineTimestamp = Infinity;
        _stopDeadlineClock?.();

        if (_deadlineEventPending || (_aborted(_deadlineSignal) && _aborted(_deadlineElapseSignal))) {
            _deadlineEventPending = false;
            _deadlineEmitter.emit(INTERNAL_EVT_SESSION_DEADLINE);
        }
    };

    const _refresh: SessionDeadline<T>['refresh'] = session => {
        _deadlineSignal && _refreshPromisor.abort();
        return _refreshPromisor(session);
    };

    const _refreshPromisor = createPromisor(async (signal, session: T | undefined) => {
        _refreshPromisorSignal = signal;

        const deadline = await tryResolve(() => {
            const _deadline = specification.deadline;
            return isFunction(_deadline) ? _deadline.call(specification, session, signal) : _deadline;
        }).catch(noop as () => undefined);

        if (_refreshPromisorSignal !== signal) return;

        let _deadlineElapsed = false;
        let _deadlines = Array.isArray(deadline) ? deadline : [deadline];
        let _signals = new Set<AbortSignal>();

        for (const deadline of _deadlines) {
            if (isAbortSignal(deadline)) {
                if ((_deadlineElapsed = deadline.aborted)) break;
                _signals.add(deadline);
            } else {
                _deadlineTimestamp = Math.min(_deadlineTimestamp, parseDate(deadline) ?? Infinity);
                if ((_deadlineElapsed = _deadlineTimestamp <= Date.now())) break;
            }
        }

        _deadlineElapsed ||= _signals.size < 1 && !Number.isFinite(_deadlineTimestamp);
        _deadlineElapseSignal = _deadlineSignal = undefined;

        if (!_deadlineElapsed) {
            _deadlineSignal = abortSignalForAny([..._signals, (_deadlineElapseSignal = signal)]);
            _deadlineSignal.addEventListener('abort', _clearDeadline);
            _startDeadlineClock();
        }

        // clear collections
        _deadlines.length = 0;
        _signals.clear();
    });

    const _startDeadlineClock = () => {
        if (!Number.isFinite(_deadlineTimestamp)) return;

        let unsubscribeClock = clock.subscribe(snapshotOrSignal => {
            if (isWatchlistUnsubscribeToken(snapshotOrSignal)) return _clearDeadline();
            if (snapshotOrSignal.now >= _deadlineTimestamp && (_deadlineEventPending = true)) _refreshPromisor.abort();
        });

        _stopDeadlineClock = () => {
            unsubscribeClock?.();
            unsubscribeClock = _stopDeadlineClock = undefined!;
        };
    };

    emitter.on(EVT_SESSION_REFRESHING_START, _clearDeadline);

    return struct<SessionDeadline<T>>({
        elapsed: getter(() => _aborted(_deadlineSignal)),
        on: enumerable(_deadlineEmitter.on),
        refresh: enumerable(_refresh),
        signal: getter(() => _deadlineSignal),
    });
};

export default createSessionDeadline;
