// @vitest-environment jsdom
import { describe, expect, test, vi } from 'vitest';
import { createSessionDeadlineController } from './deadline';
import { createEventEmitter } from '../../../reactive/eventEmitter';
import { setupTimers } from '../../../time/__testing__/fixtures';
import type { SessionEventType, SessionSpecification } from '../types';

describe('createSessionDeadlineController', () => {
    setupTimers();

    const _emitter = createEventEmitter<SessionEventType>();
    const _specification: SessionSpecification<any> = { onRefresh: () => {} };

    const _patchSpecification = <T extends keyof typeof _specification>(field: T, value: (typeof _specification)[T]) => {
        [_specification[field], value] = [value, _specification[field]];
        return () => void (_specification[field] = value);
    };

    test('should create deadline manager', async () => {
        const deadlineController = createSessionDeadlineController(_emitter, _specification);
        const unpatchDeadline = _patchSpecification('deadline', () => Date.now() + 5000); // 5 seconds session

        expect(deadlineController.elapsed).toBeUndefined();
        expect(deadlineController.signal).toBeUndefined();
        expect(deadlineController.timestamp).toBeUndefined();

        // refresh deadline once
        deadlineController.refresh('');

        await vi.advanceTimersByTimeAsync(0);

        expect(deadlineController.elapsed).toBe(false);
        expect(deadlineController.signal).not.toBeUndefined();
        expect(deadlineController.signal!.aborted).toBe(false);
        expect(deadlineController.timestamp).not.toBeUndefined();

        await vi.advanceTimersByTimeAsync(5000);
        await vi.advanceTimersToNextTimerAsync();

        expect(deadlineController.elapsed).toBe(true);
        expect(deadlineController.signal!.aborted).toBe(true);
        expect(deadlineController.timestamp).toBeCloseTo(Date.now(), -2);

        unpatchDeadline();
    });
});
