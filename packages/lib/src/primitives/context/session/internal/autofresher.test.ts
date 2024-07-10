// @vitest-environment jsdom
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { _canAutofresh, createSessionAutofresher } from './autofresher';
import { createSessionRefresher } from './refresher';
import { createEventEmitter } from '../../../reactive/eventEmitter';
import { ALREADY_RESOLVED_PROMISE, noop } from '../../../../utils';
import { ERR_SESSION_REFRESH_ABORTED, EVT_SESSION_EXPIRED } from '../constants';
import type { SessionEventType, SessionSpecification } from '../types';

vi.mock('../constants', async importOriginal => {
    const mod = await importOriginal<typeof import('../constants')>();
    return {
        ...mod,
        ERR_SESSION_REFRESH_ABORTED: 'Error<SESSION_REFRESH_ABORTED>',
    };
});

describe('createSessionAutofresher', () => {
    type AutofreshContext = {
        _emitter: ReturnType<typeof createEventEmitter<SessionEventType>>;
        _specification: SessionSpecification<any>;
        autofresh: ReturnType<typeof createSessionAutofresher>;
        canAutofresh: () => ReturnType<typeof _canAutofresh>;
        expireSession: () => void;
        refresher: ReturnType<typeof createSessionRefresher>;
        patchSpecification: <T extends keyof SessionSpecification<any>>(field: T, value: SessionSpecification<any>[T]) => void;
        resetSpecification: () => void;
    };

    const TICKS_UNTIL_REFRESHED = 10;

    const _waitForTicks = async (ticks = 1) => {
        for (let i = 0; i < ticks; i++) await ALREADY_RESOLVED_PROMISE;
    };

    beforeEach<AutofreshContext>(ctx => {
        const _patches: (() => void)[] = [];

        ctx._emitter = createEventEmitter();
        ctx._specification = { onRefresh: () => {} };
        ctx.refresher = createSessionRefresher(ctx._emitter, ctx._specification);
        ctx.autofresh = createSessionAutofresher(ctx.refresher);
        ctx.canAutofresh = _canAutofresh.bind(null, ctx.refresher);
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
    });

    test<AutofreshContext>('should do nothing if there is no pending refresh', async ctx => {
        const { autofresh, refresher, patchSpecification } = ctx;
        const autoRefresh = vi.fn();
        const onRefresh = vi.fn();
        let autoRefreshCalledTimes = 0;

        patchSpecification('autoRefresh', autoRefresh);
        patchSpecification('onRefresh', onRefresh);

        for (const skip of [undefined, false, true]) {
            expect(refresher.pending).toBe(false);
            expect(autoRefresh).toHaveBeenCalledTimes(autoRefreshCalledTimes);
            expect(onRefresh).not.toHaveBeenCalled();

            skip === undefined ? autofresh() : autofresh(skip);

            // wait for a sufficient number of ticks
            await _waitForTicks(TICKS_UNTIL_REFRESHED);
            if (skip !== true) ++autoRefreshCalledTimes;

            expect(autoRefresh).toHaveBeenCalledTimes(autoRefreshCalledTimes);
        }

        expect(refresher.pending).toBe(false);
        expect(onRefresh).not.toHaveBeenCalled();
    });

    test<AutofreshContext>('should do nothing if refresh already in progress', async ctx => {
        const { expireSession, refresher, patchSpecification } = ctx;
        const autoRefresh = vi.fn();
        const onRefresh = vi.fn();
        let onRefreshCalledTimes = 0;

        patchSpecification('autoRefresh', autoRefresh);
        patchSpecification('onRefresh', onRefresh);

        const expectations = (refreshing: boolean) => {
            expect(refresher.pending).toBe(false);
            expect(refresher.refreshing).toBe(refreshing);
        };

        for (let i = 0; i < 3; i++) {
            expectations(false);

            // initiate a refresh (refresh in progress)
            // and wait for a sufficient number of ticks
            refresher.refresh().catch(noop);
            await _waitForTicks();

            expect(onRefresh).toHaveBeenCalledTimes(++onRefreshCalledTimes);
            expectations(true);

            // trigger session expired (to signal pending refresh)
            // will also trigger `autofresh(false)`
            expireSession();

            expectations(true);

            // wait for a sufficient number of ticks
            await _waitForTicks(TICKS_UNTIL_REFRESHED);

            expect(onRefresh).toHaveBeenCalledTimes(onRefreshCalledTimes);
        }

        expect(autoRefresh).not.toHaveBeenCalled();
        expect(onRefresh).toHaveBeenCalledTimes(onRefreshCalledTimes);
        expectations(false);
    });

    test<AutofreshContext>('should do nothing if not allowed to auto refresh', async ctx => {
        const { expireSession, refresher, patchSpecification } = ctx;
        const autoRefresh = vi.fn();
        const onRefresh = vi.fn();
        let autoRefreshCalledTimes = 0;

        patchSpecification('autoRefresh', autoRefresh); // not allowed to auto refresh
        patchSpecification('onRefresh', onRefresh);

        const expectations = () => {
            expect(refresher.refreshing).toBe(false);
            expect(autoRefresh).toHaveBeenCalledTimes(autoRefreshCalledTimes);
        };

        for (let i = 0; i < 3; i++) {
            expectations();

            // trigger session expired (to signal pending refresh)
            // will also trigger `autofresh(false)`
            expireSession();

            ++autoRefreshCalledTimes;
            expect(refresher.pending).toBe(true);
            expectations();

            // wait for a sufficient number of ticks
            await _waitForTicks(TICKS_UNTIL_REFRESHED);

            expect(onRefresh).not.toHaveBeenCalled();
            expect(refresher.pending).toBe(true);
            expectations();
        }
    });

    test<AutofreshContext>('should attempt refresh if able to auto refresh and session just expired (with no refresh in progress)', async ctx => {
        const { expireSession, refresher, patchSpecification } = ctx;
        const autoRefresh = vi.fn(() => true);
        const onRefresh = vi.fn();
        let autoRefreshCalledTimes = 0;
        let onRefreshCalledTimes = 0;

        patchSpecification('autoRefresh', autoRefresh);
        patchSpecification('onRefresh', onRefresh);

        const expectations = (refreshPending: boolean) => {
            expect(refresher.pending).toBe(refreshPending);
            expect(refresher.refreshing).toBe(false);
            expect(autoRefresh).toHaveBeenCalledTimes(autoRefreshCalledTimes);
            expect(onRefresh).toHaveBeenCalledTimes(onRefreshCalledTimes);
        };

        for (let i = 0; i < 3; i++) {
            expectations(false);

            // trigger session expired (to signal pending refresh)
            // will also trigger `autofresh(false)`
            expireSession();

            ++autoRefreshCalledTimes;
            expectations(true);

            // wait for a sufficient number of ticks
            await _waitForTicks(TICKS_UNTIL_REFRESHED);

            ++onRefreshCalledTimes;
            expectations(false);
        }
    });

    test<AutofreshContext>('should destruct', async ctx => {
        const { autofresh, expireSession, refresher, patchSpecification } = ctx;
        const autoRefresh = vi.fn(() => true);
        const onRefresh = vi.fn();
        let refreshPending = false;

        patchSpecification('autoRefresh', autoRefresh);
        patchSpecification('onRefresh', onRefresh);

        const expectations = () => {
            expect(refresher.pending).toBe(refreshPending);
            expect(refresher.refreshing).toBe(false);
            expect(autoRefresh).toHaveBeenCalledTimes(1);
            expect(onRefresh).toHaveBeenCalledTimes(1);
        };

        // trigger session expired (to signal pending refresh)
        // will also trigger `autofresh(false)`
        expireSession();

        refresher.promise.catch(noop);

        // wait for a sufficient number of ticks
        await _waitForTicks(4);

        // destruct autofresher
        autofresh.destruct();

        await expect(async () => refresher.promise).rejects.toThrowError(ERR_SESSION_REFRESH_ABORTED as any);

        for (let i = 0; i < 3; i++) {
            expectations();

            // trigger session expired (to signal pending refresh)
            // will also trigger `autofresh(false)`
            expireSession();

            refreshPending = true;
            expectations();

            // wait for a sufficient number of ticks
            await _waitForTicks(TICKS_UNTIL_REFRESHED);
        }

        expectations();
    });

    describe('_canAutofresh', () => {
        test<AutofreshContext>('should return boolean', async ctx => {
            const { canAutofresh, patchSpecification } = ctx;
            expect(await canAutofresh()).toBe(false); // default (not defined)

            for (const autoRefresh of [undefined, false, true]) {
                const canAutofreshResult = autoRefresh === true;

                // (1) literal value
                patchSpecification('autoRefresh', autoRefresh);
                expect(await canAutofresh()).toBe(canAutofreshResult);

                const autoRefreshFn = vi.fn().mockReturnValueOnce(autoRefresh).mockResolvedValueOnce(autoRefresh);

                // (2) function returning value
                patchSpecification('autoRefresh', autoRefreshFn);

                for (let i = 0; i < 2; i++) {
                    expect(await canAutofresh()).toBe(canAutofreshResult);
                    expect(autoRefreshFn).toHaveBeenCalledTimes(i + 1);
                }
            }

            const autoRefreshErrorFn = vi
                .fn()
                .mockRejectedValueOnce('unknown_rejection')
                .mockImplementationOnce(() => {
                    throw 'unknown_error';
                });

            // function throwing error
            patchSpecification('autoRefresh', autoRefreshErrorFn);

            for (let i = 0; i < 2; i++) {
                expect(await canAutofresh()).toBe(false);
                expect(autoRefreshErrorFn).toHaveBeenCalledTimes(i + 1);
            }
        });
    });
});
