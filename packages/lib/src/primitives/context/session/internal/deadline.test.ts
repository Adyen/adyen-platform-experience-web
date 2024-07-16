// @vitest-environment jsdom
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createSessionDeadline } from './deadline';
import { createEventEmitter } from '../../../reactive/eventEmitter';
import { setupTimers } from '../../../time/__testing__/fixtures';
import { augmentSpecificationContext, SpecificationContext } from '../__testing__/fixtures';
import { waitForTicks } from '../__testing__/utils';
import type { SessionEventType } from '../types';

describe('createSessionDeadline', () => {
    setupTimers();

    type DeadlineContext = SpecificationContext & {
        _emitter: ReturnType<typeof createEventEmitter<SessionEventType>>;
        deadline: ReturnType<typeof createSessionDeadline<any>>;
        advanceDeadlineClockBy: (ms: number) => void;
        expectDeadlineNotToHaveElapsed: () => void;
        expectDeadlineToHaveElapsed: () => void;
    };

    beforeEach<DeadlineContext>(async ctx => {
        augmentSpecificationContext(ctx);
        ctx._emitter = createEventEmitter();
        ctx.deadline = createSessionDeadline(ctx._emitter, ctx._specification);

        ctx.advanceDeadlineClockBy = ms => {
            vi.advanceTimersByTime(ms);
            vi.advanceTimersToNextTimer();
        };

        ctx.expectDeadlineNotToHaveElapsed = () => {
            expect(ctx.deadline.elapsed).toBe(false);
            expect(ctx.deadline.signal).not.toBeUndefined();
            expect(ctx.deadline.signal!.aborted).toBe(false);
        };

        ctx.expectDeadlineToHaveElapsed = () => {
            expect(ctx.deadline.elapsed).toBe(true);
            expect(ctx.deadline.signal!.aborted).toBe(true);
        };

        // 5 seconds sessions
        ctx.patchSpecification('deadline', () => Date.now() + 5000);

        expect(ctx.deadline.elapsed).toBeUndefined();
        expect(ctx.deadline.signal).toBeUndefined();
    });

    test<DeadlineContext>('should elapse after session timeout', async ctx => {
        // refresh deadline once
        await ctx.deadline.refresh(undefined);
        ctx.expectDeadlineNotToHaveElapsed();

        // advance deadline clock to the moment it elapses
        ctx.advanceDeadlineClockBy(5000);
        ctx.expectDeadlineToHaveElapsed();
    });

    test<DeadlineContext>('should elapse deadline on new refresh call', async ctx => {
        // refresh deadline once
        await ctx.deadline.refresh(undefined);
        ctx.expectDeadlineNotToHaveElapsed();

        // refresh deadline once more
        void ctx.deadline.refresh(undefined);
        ctx.expectDeadlineToHaveElapsed();

        // wait for a sufficient number of ticks
        await waitForTicks();
        ctx.expectDeadlineNotToHaveElapsed();
    });

    test<DeadlineContext>('should elapse deadline on signal abort', async ctx => {
        const controller = new AbortController();

        // session should last for 5 seconds or until signal is aborted
        ctx.patchSpecification('deadline', () => [Date.now() + 5000, controller.signal]);

        // refresh deadline once
        await ctx.deadline.refresh(undefined);
        ctx.expectDeadlineNotToHaveElapsed();

        // abort signal
        controller.abort();
        ctx.expectDeadlineToHaveElapsed();
    });
});
