// @vitest-environment jsdom
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createSessionDeadline } from './deadline';
import { createEventEmitter } from '../../../reactive/eventEmitter';
import { setupTimers } from '../../../time/__testing__/fixtures';
import { augmentSpecificationContext, SpecificationContext } from '../__testing__/fixtures';
import type { SessionEventType } from '../types';

describe('createSessionDeadline', () => {
    setupTimers();

    type DeadlineContext = SpecificationContext & {
        _emitter: ReturnType<typeof createEventEmitter<SessionEventType>>;
        deadline: ReturnType<typeof createSessionDeadline<any>>;
    };

    beforeEach<DeadlineContext>(ctx => {
        augmentSpecificationContext(ctx);
        ctx._emitter = createEventEmitter();
        ctx.deadline = createSessionDeadline(ctx._emitter, ctx._specification);
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
