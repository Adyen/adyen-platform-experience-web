// @vitest-environment jsdom
import { describe, expect, test } from 'vitest';
import { abortedSignal, abortSignalForAny, isAbortSignal } from './main';

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

describe('isAbortSignal', () => {
    test('should return true for only for instances of `AbortSignal`', () => {
        const signal_1 = new AbortController().signal;
        const signal_2 = abortedSignal('aborted');
        const signal_3 = abortSignalForAny([signal_1, signal_2]);

        [signal_1, signal_2, signal_3].forEach(signal => expect(isAbortSignal(signal)).toBe(true));

        expect(isAbortSignal()).toBe(false);
        expect(isAbortSignal({ aborted: true })).toBe(false);
    });
});
