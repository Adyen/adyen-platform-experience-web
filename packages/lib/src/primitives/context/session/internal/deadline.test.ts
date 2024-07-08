// @vitest-environment jsdom
import { describe, expect, test, vi } from 'vitest';
import { createSessionDeadline } from './deadline';
import { createEventEmitter } from '../../../reactive/eventEmitter';
import { setupTimers } from '../../../time/__testing__/fixtures';
import type { SessionEventType, SessionSpecification } from '../types';

describe('createSessionDeadline', () => {
    setupTimers();

    const _emitter = createEventEmitter<SessionEventType>();
    const _specification: SessionSpecification<any> = { onRefresh: () => {} };

    const _patchSpecification = <T extends keyof typeof _specification>(field: T, value: (typeof _specification)[T]) => {
        [_specification[field], value] = [value, _specification[field]];
        return () => void (_specification[field] = value);
    };

    test('should create deadline manager', async () => {
        const deadline = createSessionDeadline(_emitter, _specification);
        const unpatchDeadline = _patchSpecification('deadline', () => Date.now() + 5000); // 5 seconds session

        expect(deadline.elapsed).toBeUndefined();
        expect(deadline.signal).toBeUndefined();

        // refresh deadline once
        await deadline.refresh('');

        expect(deadline.elapsed).toBe(false);
        expect(deadline.signal).not.toBeUndefined();
        expect(deadline.signal!.aborted).toBe(false);

        vi.advanceTimersByTime(5000);
        vi.advanceTimersToNextTimer();

        expect(deadline.elapsed).toBe(true);
        expect(deadline.signal!.aborted).toBe(true);

        unpatchDeadline();
    });
});
