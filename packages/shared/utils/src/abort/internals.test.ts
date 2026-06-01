// @vitest-environment jsdom
import { describe, expect, test } from 'vitest';
import { abortError, augmentSignalReason, timeoutError } from './internals';

const _runTestsForDOMException = (name: string, factory: (message?: string) => DOMException) => {
    test(`should return '${name}' DOMException`, () => {
        const defaultMessage = factory().message;
        const exception_1 = factory();
        const exception_2 = factory();

        expect(exception_1).toBeInstanceOf(DOMException);
        expect(exception_1.message).toBe(defaultMessage);
        expect(exception_1.name).toBe(name);

        expect(exception_2).toBeInstanceOf(DOMException);
        expect(exception_2.message).toBe(defaultMessage);
        expect(exception_2.message).toBe(exception_1.message);
        expect(exception_2.name).toBe(name);
    });

    test(`should return '${name}' DOMException with specified message`, () => {
        ['hello_world', 'unknown_error', 'aborted', 'uncaught_exception'].forEach(message => {
            const exception = factory(message);
            expect(exception).toBeInstanceOf(DOMException);
            expect(exception.message).toBe(message);
            expect(exception.name).toBe(name);
        });
    });
};

describe('abortError', () => _runTestsForDOMException('AbortError', abortError));
describe('timeoutError', () => _runTestsForDOMException('TimeoutError', timeoutError));

describe('AbortSignal.prototype.throwIfAborted', () => {
    test('should throw an error if signal is aborted', () => {
        const controller = new AbortController();
        const { signal } = controller;

        expect(signal).toHaveProperty('throwIfAborted');
        expect(signal.aborted).toBe(false);
        expect(signal.throwIfAborted()).toBeUndefined();

        // abort signal
        controller.abort();

        expect(signal.aborted).toBe(true);
        expect(signal.reason?.constructor?.name).toBe('DOMException');
        expect(() => signal.throwIfAborted()).toThrowError();
    });
});

describe('AbortSignal.prototype.reason', () => {
    test('should have a reason property', () => {
        const controller = new AbortController();
        const { signal } = controller;

        expect(signal).toHaveProperty('reason');
        expect(signal.aborted).toBe(false);
        expect(signal.reason).toBeUndefined();

        // abort signal
        controller.abort();

        expect(signal.aborted).toBe(true);
        expect(signal.reason?.constructor?.name).toBe('DOMException');
        expect(signal.reason.name).toBe('AbortError');
    });
});

describe('augmentSignalReason', () => {
    test('should return same signal (augmented)', () => {
        for (let i = 0; i < 5; i++) {
            const signal = new AbortController().signal;
            expect(augmentSignalReason(signal, i + 1)).toBe(signal);
        }
    });

    test('should set immutable signal abort reason', () => {
        ['hello', new DOMException('aborted'), new Error('unknown_error')].forEach(reason => {
            const signal = new AbortController().signal;
            const unusedReason = Symbol();

            augmentSignalReason(signal, reason);

            // same reason
            expect(signal.reason).toBe(reason);

            try {
                // attempt resetting reason (should fail)
                (signal as any).reason = unusedReason;
            } catch {
                // same reason
                expect(signal.reason).toBe(reason);
                expect(signal.reason).not.toBe(unusedReason);
            }
        });
    });
});
