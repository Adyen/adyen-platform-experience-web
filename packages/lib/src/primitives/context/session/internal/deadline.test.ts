// @vitest-environment jsdom
import { describe, expect, test, vi } from 'vitest';
import { createSessionDeadlineManager } from './deadline';
import { createEventEmitter } from '../../../reactive/eventEmitter';
// import { ALREADY_RESOLVED_PROMISE, getPromiseState } from '../../../../utils';
// import { PromiseState } from '../../../../utils/types';
import type { SessionEventType, SessionSpecification } from '../types';
// import type { SessionDeadline } from './types';

describe('createSessionDeadlineManager', () => {
    const _emitter = createEventEmitter<SessionEventType>();
    const _specification: SessionSpecification<any> = { onRefresh: () => {} };

    const _patchSpecification = <T extends keyof typeof _specification>(field: T, value: (typeof _specification)[T]) => {
        [_specification[field], value] = [value, _specification[field]];
        return () => void (_specification[field] = value);
    };

    test('should create deadline manager', async () => {
        vi.useFakeTimers();
        const deadlineManager = createSessionDeadlineManager(_emitter, _specification);
        const unpatchDeadline = _patchSpecification('deadline', () => Date.now() + 5000); // 5 seconds session

        expect(deadlineManager.elapsed).toBeUndefined();
        expect(deadlineManager.signal).toBeUndefined();
        expect(deadlineManager.timestamp).toBeUndefined();

        // refresh deadline once
        deadlineManager.refresh('');

        await vi.advanceTimersByTimeAsync(0);

        expect(deadlineManager.elapsed).toBe(false);
        expect(deadlineManager.signal).not.toBeUndefined();
        expect(deadlineManager.signal!.aborted).toBe(false);
        expect(deadlineManager.timestamp).not.toBeUndefined();

        await vi.advanceTimersByTimeAsync(5000);

        expect(deadlineManager.elapsed).toBe(true);
        expect(deadlineManager.signal!.aborted).toBe(true);
        expect(deadlineManager.timestamp).toBeCloseTo(Date.now(), -1);

        unpatchDeadline();
        vi.useRealTimers();
    });
});
