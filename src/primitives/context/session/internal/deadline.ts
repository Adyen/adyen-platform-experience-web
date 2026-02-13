import {
    abortedSignal,
    abortSignalForAny,
    enumerable,
    getter,
    isAbortSignal,
    isFunction,
    noop,
    parseDate,
    struct,
    tryResolve,
} from '../../../../utils';
import clock from '../../../time/clock';
import { createAbortable } from '../../../async/abortable';
import { createPromisor } from '../../../async/promisor';
import { isWatchlistUnsubscribeToken } from '../../../reactive/watchlist';
import { createEventEmitter, Emitter } from '../../../reactive/eventEmitter';
import { INTERNAL_EVT_SESSION_DEADLINE } from './constants';
import type { SessionEventType, SessionSpecification } from '../types';
import type { SessionDeadline, SessionDeadlineEmitter } from './types';

export const createSessionDeadline = <T extends any>(emitter: Emitter<SessionEventType>, specification: SessionSpecification<T>) => {
    let _deadlineSignal: AbortSignal | undefined;
    let _deadlineTimestamp = Infinity;
    let _refreshPromisorSignal: AbortSignal | undefined;
    let _stopDeadlineClock: (() => void) | undefined;

    const _deadlineAbortable = createAbortable();
    const _deadlineEmitter: SessionDeadlineEmitter = createEventEmitter();

    const _clearDeadline = () => {
        _deadlineSignal?.removeEventListener('abort', _clearDeadline);
        _deadlineTimestamp = Infinity;
        _stopDeadlineClock?.();
        _deadlineAbortable.refresh();
        _deadlineEmitter.emit(INTERNAL_EVT_SESSION_DEADLINE);
    };

    const _refreshPromisor = createPromisor(async (signal, session: T | undefined) => {
        _refreshPromisorSignal = signal;

        const deadline = await tryResolve(() => {
            const _deadline = specification.deadline;
            return isFunction(_deadline) ? _deadline.call(specification, session, signal) : _deadline;
        }).catch(noop as () => undefined);

        if (_refreshPromisorSignal !== signal) return;

        const _deadlines = (Array.isArray(deadline) ? deadline : [deadline]).filter(deadline => deadline || deadline === 0);

        if (_deadlines.length > 0) {
            let _deadlineElapsed = false;
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

            if (!_deadlineElapsed) {
                _deadlineSignal = abortSignalForAny([..._signals, _deadlineAbortable.signal]);
                _deadlineSignal.addEventListener('abort', _clearDeadline);
                _startDeadlineClock();
            } else _deadlineSignal ??= abortedSignal();

            // clear collections
            _deadlines.length = 0;
            _signals.clear();
        } else {
            _deadlineSignal = undefined;
            _deadlineAbortable.refresh();
        }
    });

    const _startDeadlineClock = () => {
        if (!Number.isFinite(_deadlineTimestamp)) return;

        let unsubscribeClock = clock.subscribe(snapshotOrSignal => {
            if (isWatchlistUnsubscribeToken(snapshotOrSignal)) return _clearDeadline();
            if (snapshotOrSignal.now >= _deadlineTimestamp) _deadlineAbortable.abort();
        });

        _stopDeadlineClock = () => {
            unsubscribeClock?.();
            unsubscribeClock = _stopDeadlineClock = undefined!;
        };
    };

    return struct<SessionDeadline<T>>({
        elapse: enumerable(_deadlineAbortable.abort),
        elapsed: getter(() => _deadlineSignal && _deadlineSignal.aborted),
        on: enumerable(_deadlineEmitter.on),
        refresh: enumerable(_refreshPromisor.bind(undefined)),
        signal: getter(() => _deadlineAbortable.signal),
    });
};

export default createSessionDeadline;
