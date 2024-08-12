// @vitest-environment jsdom
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createSessionDeadline } from './deadline';
import { createEventEmitter } from '../../../reactive/eventEmitter';
import { setupTimers } from '../../../time/__testing__/fixtures';
import { INTERNAL_EVT_SESSION_DEADLINE } from './constants';
import { augmentSpecificationContext, SpecificationContext } from '../__testing__/fixtures';
import { waitForTicks } from '../__testing__/utils';
import type { SessionEventType } from '../types';

describe('createSessionDeadline', () => {
    setupTimers();

    type DeadlineContext = SpecificationContext & {
        _emitter: ReturnType<typeof createEventEmitter<SessionEventType>>;
        deadline: ReturnType<typeof createSessionDeadline<any>>;
        advanceDeadlineClockBy: (ms: number) => void;
        get deadlineEventEmitted(): boolean;
    };

    beforeEach<DeadlineContext>(async ctx => {
        augmentSpecificationContext(ctx);

        ctx._emitter = createEventEmitter();

        let _deadlineEventEmitted = false;
        const deadline = createSessionDeadline(ctx._emitter, ctx._specification);
        const { elapsed, on, refresh } = Object.getOwnPropertyDescriptors(deadline);

        const _augmentedRefresh = {
            ...refresh,
            value: (...args: Parameters<NonNullable<typeof refresh.value>>) => {
                _deadlineEventEmitted = false;
                return refresh.value?.(...args);
            },
        };

        ctx.advanceDeadlineClockBy = ms => {
            vi.advanceTimersByTime(ms);
            vi.advanceTimersToNextTimer();
        };

        Object.defineProperties(ctx, {
            deadline: {
                enumerable: true,
                value: Object.create(null, { elapsed, on, refresh: _augmentedRefresh }),
            },
            deadlineEventEmitted: {
                enumerable: true,
                get: () => _deadlineEventEmitted,
            },
        });

        ctx.deadline.on(INTERNAL_EVT_SESSION_DEADLINE, () => (_deadlineEventEmitted = true));

        // 5 seconds sessions
        ctx.patchSpecification('deadline', () => Date.now() + 5000);

        expect(ctx.deadline.elapsed).toBeUndefined();
    });

    test<DeadlineContext>('should have indeterminate elapse status if there is no deadline signal or timeout', async ctx => {
        const expectation = async () => {
            await ctx.deadline.refresh(undefined);
            expect(ctx.deadline.elapsed).toBeUndefined();
        };

        for (const deadline of [undefined, null, NaN, []]) {
            // sync deadline computation
            ctx.patchSpecification('deadline', () => deadline!);
            await expectation();

            // async deadline computation
            ctx.patchSpecification('deadline', () => async () => deadline!);
            await expectation();
        }

        const deadline = vi
            .fn()
            .mockRejectedValueOnce('uncaught_exception')
            .mockImplementationOnce(() => {
                throw 'unknown_error';
            });

        // deadline function fails or rejects with an exception
        ctx.patchSpecification('deadline', () => deadline);

        for (let i = 0; i < 2; i++) {
            await expectation();
        }
    });

    test<DeadlineContext>('should always be elapsed if deadline signal already aborted or timeout in the past', async ctx => {
        const controller = new AbortController();
        const deadlines = [-Infinity, 0, Date.now() - 1, controller.signal];
        controller.abort();

        const expectation = async () => {
            await ctx.deadline.refresh(undefined);
            expect(ctx.deadline.elapsed).toBe(true);
        };

        for (const deadline of deadlines) {
            // sync deadline computation
            ctx.patchSpecification('deadline', () => deadline);
            await expectation();

            // async deadline computation
            ctx.patchSpecification('deadline', () => async () => deadline!);
            await expectation();
        }
    });

    test<DeadlineContext>('should elapse deadline on clock timeout', async ctx => {
        // refresh deadline once
        await ctx.deadline.refresh(undefined);
        expect(ctx.deadline.elapsed).toBe(false);
        expect(ctx.deadlineEventEmitted).toBe(false);

        // advance deadline clock to the moment it elapses
        ctx.advanceDeadlineClockBy(5000);
        expect(ctx.deadline.elapsed).toBe(true);
        expect(ctx.deadlineEventEmitted).toBe(true);
    });

    test<DeadlineContext>('should elapse deadline on earliest clock timeout', async ctx => {
        // earliest session timeout is 2000 milliseconds
        ctx.patchSpecification('deadline', () => [5000, 2000, 10_000, 7500].map(timeout => Date.now() + timeout));

        // refresh deadline once
        await ctx.deadline.refresh(undefined);
        expect(ctx.deadline.elapsed).toBe(false);
        expect(ctx.deadlineEventEmitted).toBe(false);

        // advance deadline clock to the moment it elapses
        ctx.advanceDeadlineClockBy(2000);
        expect(ctx.deadline.elapsed).toBe(true);
        expect(ctx.deadlineEventEmitted).toBe(true);
    });

    test<DeadlineContext>('should elapse deadline on signal abort', async ctx => {
        const controller = new AbortController();

        // session should last for 5 seconds or until signal is aborted
        ctx.patchSpecification('deadline', () => controller.signal);

        // refresh deadline once
        await ctx.deadline.refresh(undefined);
        expect(ctx.deadline.elapsed).toBe(false);
        expect(ctx.deadlineEventEmitted).toBe(false);

        // abort signal
        controller.abort();
        expect(ctx.deadline.elapsed).toBe(true);
        expect(ctx.deadlineEventEmitted).toBe(true);
    });

    test<DeadlineContext>('should elapse deadline on first signal abort or earliest timeout', async ctx => {
        const controllers = [new AbortController(), new AbortController()];
        const timeouts = [5000, 2000, 10_000, 7500];

        ctx.patchSpecification('deadline', () => [
            ...timeouts.map(timeout => Date.now() + timeout),
            ...controllers.map(controller => controller.signal),
        ]);

        // refresh deadline once
        await ctx.deadline.refresh(undefined);
        expect(ctx.deadline.elapsed).toBe(false);
        expect(ctx.deadlineEventEmitted).toBe(false);

        // advance deadline clock just before it should elapse
        ctx.advanceDeadlineClockBy(1900);
        expect(ctx.deadline.elapsed).toBe(false);
        expect(ctx.deadlineEventEmitted).toBe(false);

        // abort signal
        controllers.pop()!.abort();
        expect(ctx.deadline.elapsed).toBe(true);
        expect(ctx.deadlineEventEmitted).toBe(true);

        // update deadline specification to discard aborted signal
        ctx.patchSpecification('deadline', () => [
            ...timeouts.map(timeout => Date.now() + timeout),
            ...controllers.map(controller => controller.signal),
        ]);

        // refresh deadline once again
        await ctx.deadline.refresh(undefined);
        expect(ctx.deadline.elapsed).toBe(false);
        expect(ctx.deadlineEventEmitted).toBe(false);

        // advance deadline clock to the moment it elapses
        ctx.advanceDeadlineClockBy(2000);
        expect(ctx.deadline.elapsed).toBe(true);
        expect(ctx.deadlineEventEmitted).toBe(true);
    });

    test<DeadlineContext>('should not elapse deadline on new refresh call', async ctx => {
        // refresh deadline once
        await ctx.deadline.refresh(undefined);
        expect(ctx.deadline.elapsed).toBe(false);
        expect(ctx.deadlineEventEmitted).toBe(false);

        // refresh deadline once more
        void ctx.deadline.refresh(undefined);
        expect(ctx.deadline.elapsed).toBe(false);
        expect(ctx.deadlineEventEmitted).toBe(false);

        // wait for a sufficient number of ticks
        await waitForTicks();
        expect(ctx.deadline.elapsed).toBe(false);
        expect(ctx.deadlineEventEmitted).toBe(false);
    });
});
