// @vitest-environment jsdom
import { describe, expect, test, vi } from 'vitest';
import { createSessionRefreshController } from './refresh';
import { createEventEmitter } from '../../../reactive/eventEmitter';
import { getPromiseState } from '../../../../utils';
import { PromiseState } from '../../../../utils/types';
import { INTERNAL_EVT_SESSION_READY } from './constants';
import { ERR_SESSION_FACTORY_UNAVAILABLE, ERR_SESSION_INVALID, ERR_SESSION_REFRESH_ABORTED, EVT_SESSION_REFRESHED } from '../constants';
import type { SessionEventType, SessionSpecification } from '../types';
import type { SessionRefreshController } from './types';

vi.mock('../constants', async importOriginal => {
    const mod = await importOriginal<typeof import('../constants')>();
    return {
        ...mod,
        ERR_SESSION_FACTORY_UNAVAILABLE: 'Error<SESSION_FACTORY_UNAVAILABLE>',
        ERR_SESSION_INVALID: 'Error<SESSION_INVALID>',
        ERR_SESSION_REFRESH_ABORTED: 'Error<SESSION_REFRESH_ABORTED>',
    };
});

describe('createSessionRefreshController', () => {
    const _emitter = createEventEmitter<SessionEventType>();
    const _specification: SessionSpecification<any> = { onRefresh: () => {} };

    const afterRefresh = (refreshController: SessionRefreshController<any>, session?: any) => {
        expect(refreshController.refreshing).toBe(false);
        expect(refreshController.session).toBe(session);
        expect(refreshController.signal!.aborted).toBe(false);
    };

    const beforeRefresh = (refreshController: SessionRefreshController<any>) => {
        const actual: any[] = [];
        const expected: any[] = [];

        refreshController.on(INTERNAL_EVT_SESSION_READY, async ({ detail, timeStamp }) => {
            actual.push(refreshController.refreshing, refreshController.signal!.aborted, refreshController.session, timeStamp);
            expected.push(true, false, detail, Date.now());
            _emitter.emit(EVT_SESSION_REFRESHED);
        });

        refreshController.promise.catch(() => {});

        expect(refreshController.refreshing).toBe(false);
        expect(refreshController.session).toBeUndefined();
        expect(refreshController.signal).toBeUndefined();

        return [actual, expected] as const;
    };

    const duringRefresh = async (refreshController: SessionRefreshController<any>, sessionEventCapture: readonly [any[], any[]]) => {
        const [actual, expected] = sessionEventCapture;

        expect(refreshController.refreshing).toBe(true);
        expect(refreshController.signal).not.toBeUndefined();
        expect(refreshController.signal!.aborted).toBe(false);
        expect(await getPromiseState(refreshController.promise)).toBe(PromiseState.PENDING);

        if (actual.length > 0 && actual.length === expected.length) {
            // session event was dispatched and arrays have been populated

            // match all items except the last (timestamps)
            expect(actual.slice(0, -1)).toMatchObject(expected.slice(0, -1));

            // match the last items (timestamps)
            expect(actual[actual.length - 1]).toBeCloseTo(expected[expected.length - 1], -1);
        }
    };

    const _patchSpecification = <T extends keyof typeof _specification>(field: T, value: (typeof _specification)[T]) => {
        [_specification[field], value] = [value, _specification[field]];
        return () => void (_specification[field] = value);
    };

    const _refreshErrorAssertions = async (refreshController: SessionRefreshController<any>, error: any) => {
        const sessionEventCapture = beforeRefresh(refreshController);

        // initiate refresh once
        void refreshController.refresh();

        await duringRefresh(refreshController, sessionEventCapture);
        await expect(async () => refreshController.promise).rejects.toThrowError(error);
        expect(await getPromiseState(refreshController.promise)).toBe(PromiseState.REJECTED);

        afterRefresh(refreshController);
    };

    test('should create session refresh manager', async () => {
        const refreshController = createSessionRefreshController(_emitter, _specification);
        const unpatchRefresh = _patchSpecification('onRefresh', () => 'first_session');
        const sessionEventCapture = beforeRefresh(refreshController);

        // initiate refresh once
        void refreshController.refresh();

        await duringRefresh(refreshController, sessionEventCapture);
        expect(await refreshController.promise).toBe('first_session');
        expect(await getPromiseState(refreshController.promise)).toBe(PromiseState.FULFILLED);

        afterRefresh(refreshController, 'first_session');
        unpatchRefresh();
    });

    test('should throw unavailable session factory error if `onRefresh` is not callable', async () => {
        const refreshController = createSessionRefreshController(_emitter, _specification);
        const unpatchRefresh = _patchSpecification('onRefresh', 'non-callable' as any);
        await _refreshErrorAssertions(refreshController, ERR_SESSION_FACTORY_UNAVAILABLE);
        unpatchRefresh();
    });

    test('should throw invalid session error if session assertion fails', async () => {
        const refreshController = createSessionRefreshController(_emitter, _specification);
        const unpatchAssert = _patchSpecification('assert', undefinedSession => (undefinedSession as any)());
        await _refreshErrorAssertions(refreshController, ERR_SESSION_INVALID);
        unpatchAssert();
    });

    test('should throw refresh aborted error for pending refreshes on new refresh request', async () => {
        const refreshController = createSessionRefreshController(_emitter, _specification);
        const unpatchRefresh = _patchSpecification('onRefresh', () => 'first_session');
        const sessionEventCapture = beforeRefresh(refreshController);

        // call refresh() a few times
        const REFRESH_PROMISES = Array.from({ length: 3 }, () => refreshController.refresh()) as [Promise<any>, Promise<any>, Promise<any>];

        await duringRefresh(refreshController, sessionEventCapture);

        for (let i = 0; i < REFRESH_PROMISES.length; i++) {
            const promise = REFRESH_PROMISES[i]!;

            if (i === REFRESH_PROMISES.length - 1) {
                expect(await promise).toBe('first_session');
                expect(await getPromiseState(promise)).toBe(PromiseState.FULFILLED);
            } else {
                await expect(async () => promise).rejects.toThrowError(ERR_SESSION_REFRESH_ABORTED as any);
                expect(await getPromiseState(promise)).toBe(PromiseState.REJECTED);
            }
        }

        expect(await refreshController.promise).toBe('first_session');
        expect(await getPromiseState(refreshController.promise)).toBe(PromiseState.FULFILLED);

        afterRefresh(refreshController, 'first_session');
        unpatchRefresh();
    });
});
