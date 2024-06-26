import { describe, expect, test } from 'vitest';
import { createAbortSink, isAbortSignal } from './main';

describe('isAbortSignal', () => {
    test('should return true for only for instances of `AbortSignal`', () => {
        expect(isAbortSignal(new AbortController().signal)).toBe(true);
        expect(isAbortSignal({ aborted: true })).toBe(false);
        expect(isAbortSignal()).toBe(false);
    });
});

describe('createAbortSink', () => {
    test('should create abort sink with non-aborted signal when called without source signals', () => {
        const abortSink = createAbortSink();
        const { signal } = abortSink;

        expect(signal.aborted).toBe(false);
        abortSink.abort();
        expect(signal.aborted).toBe(true);
    });

    test('should create abort sink with already aborted signal if at least one source signal is already aborted', () => {
        const $controllers = Array.from(Array(3), () => new AbortController()) as [AbortController, AbortController, AbortController];

        // abort one of the signals
        $controllers[1].abort();

        const abortSink = createAbortSink(...$controllers.map(c => c.signal));
        const { signal } = abortSink;

        // signal is already aborted
        expect(signal.aborted).toBe(true);

        // signal is already aborted — calling abort does nothing
        abortSink.abort();
        expect(signal.aborted).toBe(true);
    });

    test('should create abort sink with link to multiple source signals (1)', () => {
        const $controllers = Array.from(Array(3), () => new AbortController()) as AbortController[];

        const abortSink = createAbortSink(...$controllers.map(({ signal }) => signal));
        const { signal } = abortSink;

        // signal not aborted (none of the source signals is aborted)
        expect(signal.aborted).toBe(false);

        // unlink the first signal
        abortSink.unlink($controllers[0]?.signal);

        // aborting an unlinked signal no longer has any effect on the `abortSink` signal
        $controllers[0]?.abort();
        expect(signal.aborted).toBe(false);

        for (let i = 1; i < $controllers.length; i++) {
            const controller = $controllers[i]!;

            // aborting any of the linked signals will also abort the `abortSink` signal
            controller.abort();
            expect(signal.aborted).toBe(true);
        }

        // signal is already aborted — calling abort does nothing
        abortSink.abort();
        expect(signal.aborted).toBe(true);
    });

    test('should create abort sink with link to multiple source signals (2)', () => {
        const $controllers = Array.from(Array(3), () => new AbortController()) as AbortController[];

        const abortSink = createAbortSink(...$controllers.map(({ signal }) => signal));
        const { signal } = abortSink;

        // signal not aborted (none of the source signals is aborted)
        expect(signal.aborted).toBe(false);

        const startIndex = 1;

        // unlink one or more of the signals
        abortSink.unlink(...$controllers.slice(startIndex).map(({ signal }) => signal));

        for (let i = startIndex; i < $controllers.length; i++) {
            const controller = $controllers[i]!;

            // aborting an unlinked signal no longer has any effect on the `abortSink` signal
            controller.abort();
            expect(signal.aborted).toBe(false);
        }

        // disconnect all linked signals
        abortSink.disconnect();

        $controllers.forEach(controller => {
            // aborting an unlinked signal no longer has any effect on the `abortSink` signal
            controller.abort();
            expect(signal.aborted).toBe(false);
        });

        // abort the signal
        abortSink.abort();
        expect(signal.aborted).toBe(true);
    });
});
