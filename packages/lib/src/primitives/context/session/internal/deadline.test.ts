// @vitest-environment jsdom
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createSessionDeadline } from './deadline';
import { createEventEmitter } from '../../../reactive/eventEmitter';
import { setupTimers } from '../../../time/__testing__/fixtures';
import type { SessionEventType, SessionSpecification } from '../types';

describe('createSessionDeadline', () => {
    setupTimers();

    type DeadlineContext = {
        _emitter: ReturnType<typeof createEventEmitter<SessionEventType>>;
        _specification: SessionSpecification<any>;
        deadline: ReturnType<typeof createSessionDeadline<any>>;
        patchSpecification: <T extends keyof SessionSpecification<any>>(field: T, value: SessionSpecification<any>[T]) => void;
        resetSpecification: () => void;
    };

    beforeEach<DeadlineContext>(ctx => {
        const _patches: (() => void)[] = [];

        ctx._emitter = createEventEmitter();
        ctx._specification = { onRefresh: () => {} };
        ctx.deadline = createSessionDeadline(ctx._emitter, ctx._specification);

        ctx.patchSpecification = <T extends keyof typeof ctx._specification>(field: T, value: (typeof ctx._specification)[T]) => {
            [ctx._specification[field], value] = [value, ctx._specification[field]];
            _patches.push(() => void (ctx._specification[field] = value));
        };

        ctx.resetSpecification = () => {
            while (_patches.length) {
                const unpatch = _patches.pop();
                unpatch && unpatch();
            }
        };
    });

    test<DeadlineContext>('should create deadline manager', async ctx => {
        const { deadline, patchSpecification } = ctx;

        // 5 seconds sessions
        patchSpecification('deadline', () => Date.now() + 5000);

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
    });
});
