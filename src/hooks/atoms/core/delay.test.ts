import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createDelay } from './delay';

describe('createDelay', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('should execute callback immediately when delay is 0 or undefined', () => {
        const fn = vi.fn();

        createDelay().exec(fn);
        expect(fn).toHaveBeenCalledTimes(1);

        createDelay({ delay: 0 }).exec(fn);
        expect(fn).toHaveBeenCalledTimes(2);
    });

    test('should delay execution of callback', () => {
        const fn = vi.fn();
        const scheduler = createDelay({ delay: 500 });

        scheduler.exec(fn);
        expect(fn).not.toHaveBeenCalled();

        vi.advanceTimersByTime(499);
        expect(fn).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    test('should debounce multiple calls', () => {
        const fn = vi.fn();
        const scheduler = createDelay({ delay: 500 });

        scheduler.exec(fn);
        vi.advanceTimersByTime(200);

        scheduler.exec(fn);
        vi.advanceTimersByTime(200);

        scheduler.exec(fn);
        vi.advanceTimersByTime(499);
        expect(fn).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    test('should cancel pending execution', () => {
        const fn = vi.fn();
        const scheduler = createDelay({ delay: 500 });

        scheduler.exec(fn);
        vi.advanceTimersByTime(200);

        scheduler.cancel();
        vi.advanceTimersByTime(500);
        expect(fn).not.toHaveBeenCalled();
    });

    test('should reconfigure delay', () => {
        const fn = vi.fn();
        const scheduler = createDelay({ delay: 500 });

        scheduler.reconfigure({ delay: 100 });
        scheduler.exec(fn);

        vi.advanceTimersByTime(99);
        expect(fn).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    test('should prevent execution after dispose', () => {
        const fn = vi.fn();
        const scheduler = createDelay({ delay: 500 });

        scheduler.exec(fn);
        scheduler.dispose();

        vi.advanceTimersByTime(1000);
        expect(fn).not.toHaveBeenCalled();

        // Further exec calls are no-ops
        scheduler.exec(fn);
        expect(fn).not.toHaveBeenCalled();
    });

    test('should normalize delay values', () => {
        const fn = vi.fn();

        // Negative → 0 (immediate)
        createDelay({ delay: -100 }).exec(fn);
        expect(fn).toHaveBeenCalledTimes(1);

        // Fractional → rounded
        const scheduler = createDelay({ delay: 99.7 });
        scheduler.exec(fn);
        vi.advanceTimersByTime(99);
        expect(fn).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(1);
        expect(fn).toHaveBeenCalledTimes(2);
    });
});
