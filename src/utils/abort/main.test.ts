// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { abortedSignal, abortSignalForAny, abortSignalWithTimeout, isAbortSignal } from './main';

describe('abortedSignal', () => {
    test('should return already aborted signal', () => {
        const signal = abortedSignal();
        expect(signal.aborted).toBe(true);
        expect(signal.reason.name).toBe('AbortError');
    });

    test('should return already aborted signal with AbortError if reason is undefined', () => {
        const signal = abortedSignal(undefined);
        expect(signal.aborted).toBe(true);
        expect(signal.reason.name).toBe('AbortError');
    });

    test('should return already aborted signal with specified reason', () => {
        [null, 'hello', new DOMException('aborted'), new Error('unknown_error')].forEach(reason => {
            const signal = abortedSignal(reason);
            expect(signal.aborted).toBe(true);
            expect(signal.reason).toBe(reason);
        });
    });
});

describe('abortSignalForAny', () => {
    test('should throw an error called without source signals or with invalid signal value', () => {
        type _SignalFactory = (...args: any[]) => AbortSignal;
        const signal_1 = new AbortController().signal;

        const throwsMissingAbortSignalTypeError = () => (abortSignalForAny as _SignalFactory)();
        const throwsInvalidAbortSignalTypeError = () => (abortSignalForAny as _SignalFactory)([signal_1, 5, 'invalid_value']);

        expect(throwsMissingAbortSignalTypeError).toThrowError();
        expect(throwsInvalidAbortSignalTypeError).toThrowError();
    });

    test('should return already aborted signal if at least one of the source signals is already aborted', () => {
        const $controllers = Array.from(Array(3), () => new AbortController()) as AbortController[];

        // abort one of the signals
        $controllers[1]?.abort();

        const signal = abortSignalForAny($controllers.map(c => c.signal));

        // signal is already aborted
        expect(signal.aborted).toBe(true);
    });

    test('should return abort signal linked to multiple source signals', () => {
        const $controllers = Array.from(Array(3), () => new AbortController()) as AbortController[];
        const signal = abortSignalForAny($controllers.map(({ signal }) => signal));

        // signal not aborted (none of the source signals is aborted)
        expect(signal.aborted).toBe(false);

        for (let i = 0; i < $controllers.length; i++) {
            $controllers[i]?.abort();
            // aborting any of the linked signals will also abort the signal
            expect(signal.aborted).toBe(true);
        }
    });
});

describe('abortSignalWithTimeout', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'setTimeout'] });
        vi.runOnlyPendingTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('should return abort signal with timeout (1)', () => {
        const signal = abortSignalWithTimeout(0);

        // signal not yet aborted (until next tick)
        expect(signal.aborted).toBe(false);

        vi.advanceTimersToNextTimer();
        vi.runOnlyPendingTimers();

        // signal is aborted
        expect(signal.aborted).toBe(true);
    });

    test('should return abort signal with timeout (2)', () => {
        let elapsedTime = 0;
        const timeouts = [100, 500, 2000];
        const signals = timeouts.map(ms => abortSignalWithTimeout(ms));

        // signals not yet aborted
        signals.forEach(signal => expect(signal.aborted).toBe(false));

        [
            100, // elapsed time => ~100ms
            350, // elapsed time => ~450ms
            1000, // elapsed time => ~1450ms
            750, // elapsed time => ~2200ms
        ].forEach(timeAdvance => {
            vi.advanceTimersByTime(timeAdvance);
            vi.advanceTimersToNextTimer();

            elapsedTime += timeAdvance;

            signals.forEach((signal, index) => {
                expect(signal.aborted).toBe(elapsedTime >= timeouts[index]!);
            });
        });
    });
});

describe('isAbortSignal', () => {
    test('should return true for only for instances of `AbortSignal`', () => {
        const signal_1 = new AbortController().signal;
        const signal_2 = abortedSignal('aborted');
        const signal_3 = abortSignalWithTimeout(0);
        const signal_4 = abortSignalForAny([signal_1, signal_2, signal_3]);

        [signal_1, signal_2, signal_3, signal_4].forEach(signal => expect(isAbortSignal(signal)).toBe(true));

        expect(isAbortSignal()).toBe(false);
        expect(isAbortSignal({ aborted: true })).toBe(false);
    });
});
