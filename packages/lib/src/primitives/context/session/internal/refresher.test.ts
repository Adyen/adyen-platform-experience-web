// @vitest-environment jsdom
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createSessionRefresher } from './refresher';
import { createEventEmitter } from '../../../reactive/eventEmitter';
import { ALREADY_RESOLVED_PROMISE, getPromiseState } from '../../../../utils';
import { PromiseState } from '../../../../utils/types';
import { INTERNAL_EVT_SESSION_READY } from './constants';
import { ERR_SESSION_FACTORY_UNAVAILABLE, ERR_SESSION_INVALID, ERR_SESSION_REFRESH_ABORTED, EVT_SESSION_EXPIRED } from '../constants';
import type { SessionEventType, SessionSpecification } from '../types';

vi.mock('../constants', async importOriginal => {
    const mod = await importOriginal<typeof import('../constants')>();
    return {
        ...mod,
        ERR_SESSION_FACTORY_UNAVAILABLE: 'Error<SESSION_FACTORY_UNAVAILABLE>',
        ERR_SESSION_INVALID: 'Error<SESSION_INVALID>',
        ERR_SESSION_REFRESH_ABORTED: 'Error<SESSION_REFRESH_ABORTED>',
    };
});

describe('createSessionRefresher', () => {
    type RefresherContext = {
        _emitter: ReturnType<typeof createEventEmitter<SessionEventType>>;
        _specification: SessionSpecification<any>;
        afterRefresh: (data: { session?: unknown; signal?: AbortSignal }) => void;
        beforeRefresh: (session?: unknown) => void;
        duringRefresh: () => Promise<void>;
        expireSession: () => void;
        refresher: ReturnType<typeof createSessionRefresher>;
        patchSpecification: <T extends keyof SessionSpecification<any>>(field: T, value: SessionSpecification<any>[T]) => void;
        resetSpecification: () => void;
    };

    beforeEach<RefresherContext>(ctx => {
        const _sessionEventCapture = [[], []] as readonly [any[], any[]];
        const _patches: (() => void)[] = [];

        ctx._emitter = createEventEmitter();
        ctx._specification = { onRefresh: () => {} };
        ctx.refresher = createSessionRefresher(ctx._emitter, ctx._specification);
        ctx.expireSession = () => ctx._emitter.emit(EVT_SESSION_EXPIRED);

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

        ctx.afterRefresh = (data: { session?: unknown; signal?: AbortSignal }) => {
            const { refresher } = ctx;
            const [actual, expected] = _sessionEventCapture;

            expect(refresher.refreshing).toBe(false);
            expect(refresher.session).toBe(data.session);
            expect(refresher.signal!.aborted).toBe(data.signal ? data.signal.aborted : false);

            if (actual.length > 0 && actual.length === expected.length) {
                // session event was dispatched and arrays have been populated
                // match all items except the last (timestamps)
                expect(actual.slice(0, -1)).toMatchObject(expected.slice(0, -1));

                // match the last items (timestamps)
                expect(actual[actual.length - 1]).toBeCloseTo(expected[expected.length - 1], -1);
            }
        };

        ctx.beforeRefresh = (session?: unknown) => {
            const { refresher } = ctx;
            const [actual, expected] = _sessionEventCapture;

            actual.length = expected.length = 0;

            refresher.on(INTERNAL_EVT_SESSION_READY, ({ timeStamp }) => {
                actual.push(refresher.refreshing, refresher.signal!.aborted, refresher.session, timeStamp);
                expected.push(true, false, session, Date.now());
            });

            refresher.promise.catch(() => {});

            expect(refresher.refreshing).toBe(false);
            expect(refresher.session).toBeUndefined();
            expect(refresher.signal).toBeUndefined();
        };

        ctx.duringRefresh = async () => {
            const { refresher } = ctx;
            expect(refresher.refreshing).toBe(true);
            expect(refresher.signal).not.toBeUndefined();
            expect(refresher.signal!.aborted).toBe(false);
            expect(await getPromiseState(refresher.promise)).toBe(PromiseState.PENDING);
        };
    });

    const _refreshErrorAssertions = async (
        { afterRefresh, beforeRefresh, duringRefresh, refresher }: RefresherContext,
        error: any,
        signal?: AbortSignal
    ) => {
        beforeRefresh();

        // initiate refresh once
        void refresher.refresh(signal);

        await duringRefresh();
        await expect(async () => refresher.promise).rejects.toThrowError(error);
        expect(await getPromiseState(refresher.promise)).toBe(PromiseState.REJECTED);

        afterRefresh({ signal });
    };

    test<RefresherContext>('should create session refresh manager', async ctx => {
        const { afterRefresh, beforeRefresh, duringRefresh, refresher, patchSpecification } = ctx;
        const SESSION = 'first_session';

        patchSpecification('onRefresh', () => SESSION);
        beforeRefresh(SESSION);

        expect(refresher.context.emitter).toBe(ctx._emitter);
        expect(refresher.context.specification).toBe(ctx._specification);

        // initiate refresh once
        void refresher.refresh();

        await duringRefresh();
        await refresher.promise;

        expect(refresher.session).toBe(SESSION);
        expect(await getPromiseState(refresher.promise)).toBe(PromiseState.FULFILLED);

        afterRefresh({ session: SESSION });
    });

    test<RefresherContext>('should throw unavailable session factory error if `onRefresh` is not callable', async ctx => {
        ctx.patchSpecification('onRefresh', 'non-callable' as any);
        await _refreshErrorAssertions(ctx, ERR_SESSION_FACTORY_UNAVAILABLE);
    });

    test<RefresherContext>('should throw invalid session error if session assertion fails', async ctx => {
        ctx.patchSpecification('assert', undefinedSession => (undefinedSession as any)());
        await _refreshErrorAssertions(ctx, ERR_SESSION_INVALID);
    });

    test<RefresherContext>('should throw refresh aborted error for pending refreshes on new refresh request', async ctx => {
        const { afterRefresh, beforeRefresh, duringRefresh, refresher, patchSpecification } = ctx;
        const SESSION = 'first_session';

        patchSpecification('onRefresh', () => SESSION);
        beforeRefresh(SESSION);

        // call refresh() a few times
        const REFRESH_PROMISES = Array.from({ length: 3 }, () => refresher.refresh()) as [Promise<any>, Promise<any>, Promise<any>];

        await duringRefresh();

        for (let i = 0; i < REFRESH_PROMISES.length; i++) {
            const promise = REFRESH_PROMISES[i]!;

            if (i === REFRESH_PROMISES.length - 1) {
                await promise;
                expect(refresher.session).toBe(SESSION);
                expect(await getPromiseState(promise)).toBe(PromiseState.FULFILLED);
            } else {
                await expect(async () => promise).rejects.toThrowError(ERR_SESSION_REFRESH_ABORTED as any);
                expect(await getPromiseState(promise)).toBe(PromiseState.REJECTED);
            }
        }

        await refresher.promise;

        expect(refresher.session).toBe(SESSION);
        expect(await getPromiseState(refresher.promise)).toBe(PromiseState.FULFILLED);

        afterRefresh({ session: SESSION });
    });

    test<RefresherContext>('should throw refresh aborted error for latest refresh when associated external signal aborts', async ctx => {
        const controller = new AbortController();
        const assertions = _refreshErrorAssertions(ctx, ERR_SESSION_REFRESH_ABORTED, controller.signal);

        // wait for next tick and abort the signal
        await ALREADY_RESOLVED_PROMISE;
        controller.abort();

        await assertions;
    });

    test<RefresherContext>('should be pending only when session expires while no refresh is in progress', async ctx => {
        const { expireSession, refresher, patchSpecification } = ctx;

        expect(refresher.refreshing).toBe(false);
        expect(refresher.pending).toBe(false);

        // initiate refresh once
        void refresher.refresh();
        expect(refresher.refreshing).toBe(true);
        expect(refresher.pending).toBe(false);

        // expire session
        expireSession();
        expect(refresher.refreshing).toBe(true);
        expect(refresher.pending).toBe(false);

        await refresher.promise;
        expect(refresher.refreshing).toBe(false);
        expect(refresher.pending).toBe(false);

        // expire session
        expireSession();
        expect(refresher.refreshing).toBe(false);
        expect(refresher.pending).toBe(true);
    });
});
