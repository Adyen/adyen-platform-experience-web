// @vitest-environment jsdom
import { describe, expect, test, vi } from 'vitest';
import { createSessionRefresher } from './refresher';
import { createEventEmitter } from '../../../reactive/eventEmitter';
import { getPromiseState } from '../../../../utils';
import { PromiseState } from '../../../../utils/types';
import { INTERNAL_EVT_SESSION_READY } from './constants';
import { ERR_SESSION_FACTORY_UNAVAILABLE, ERR_SESSION_INVALID, ERR_SESSION_REFRESH_ABORTED } from '../constants';
import type { SessionEventType, SessionSpecification } from '../types';
import type { SessionRefresher } from './types';

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
    const _emitter = createEventEmitter<SessionEventType>();
    const _specification: SessionSpecification<any> = { onRefresh: () => {} };

    const afterRefresh = (refresher: SessionRefresher<any>, sessionEventCapture: readonly [any[], any[]], session?: any) => {
        const [actual, expected] = sessionEventCapture;

        expect(refresher.refreshing).toBe(false);
        expect(refresher.session).toBe(session);
        expect(refresher.signal!.aborted).toBe(false);

        if (actual.length > 0 && actual.length === expected.length) {
            // session event was dispatched and arrays have been populated
            // match all items except the last (timestamps)
            expect(actual.slice(0, -1)).toMatchObject(expected.slice(0, -1));

            // match the last items (timestamps)
            expect(actual[actual.length - 1]).toBeCloseTo(expected[expected.length - 1], -1);
        }
    };

    const beforeRefresh = (refresher: SessionRefresher<any>, session?: any) => {
        const actual: any[] = [];
        const expected: any[] = [];

        refresher.on(INTERNAL_EVT_SESSION_READY, ({ timeStamp }) => {
            actual.push(refresher.refreshing, refresher.signal!.aborted, refresher.session, timeStamp);
            expected.push(true, false, session, Date.now());
        });

        refresher.promise.catch(() => {});

        expect(refresher.refreshing).toBe(false);
        expect(refresher.session).toBeUndefined();
        expect(refresher.signal).toBeUndefined();

        return [actual, expected] as const;
    };

    const duringRefresh = async (refresher: SessionRefresher<any>) => {
        expect(refresher.refreshing).toBe(true);
        expect(refresher.signal).not.toBeUndefined();
        expect(refresher.signal!.aborted).toBe(false);
        expect(await getPromiseState(refresher.promise)).toBe(PromiseState.PENDING);
    };

    const _patchSpecification = <T extends keyof typeof _specification>(field: T, value: (typeof _specification)[T]) => {
        [_specification[field], value] = [value, _specification[field]];
        return () => void (_specification[field] = value);
    };

    const _refreshErrorAssertions = async (refresher: SessionRefresher<any>, error: any) => {
        const sessionEventCapture = beforeRefresh(refresher);

        // initiate refresh once
        void refresher.refresh();

        await duringRefresh(refresher);
        await expect(async () => refresher.promise).rejects.toThrowError(error);
        expect(await getPromiseState(refresher.promise)).toBe(PromiseState.REJECTED);

        afterRefresh(refresher, sessionEventCapture);
    };

    test('should create session refresh manager', async () => {
        const SESSION = 'first_session';
        const refresher = createSessionRefresher(_emitter, _specification);
        const unpatchRefresh = _patchSpecification('onRefresh', () => SESSION);
        const sessionEventCapture = beforeRefresh(refresher, SESSION);

        // initiate refresh once
        void refresher.refresh();

        await duringRefresh(refresher);
        await refresher.promise;

        expect(refresher.session).toBe(SESSION);
        expect(await getPromiseState(refresher.promise)).toBe(PromiseState.FULFILLED);

        afterRefresh(refresher, sessionEventCapture, SESSION);
        unpatchRefresh();
    });

    test('should throw unavailable session factory error if `onRefresh` is not callable', async () => {
        const refresher = createSessionRefresher(_emitter, _specification);
        const unpatchRefresh = _patchSpecification('onRefresh', 'non-callable' as any);
        await _refreshErrorAssertions(refresher, ERR_SESSION_FACTORY_UNAVAILABLE);
        unpatchRefresh();
    });

    test('should throw invalid session error if session assertion fails', async () => {
        const refresher = createSessionRefresher(_emitter, _specification);
        const unpatchAssert = _patchSpecification('assert', undefinedSession => (undefinedSession as any)());
        await _refreshErrorAssertions(refresher, ERR_SESSION_INVALID);
        unpatchAssert();
    });

    test('should throw refresh aborted error for pending refreshes on new refresh request', async () => {
        const SESSION = 'first_session';
        const refresher = createSessionRefresher(_emitter, _specification);
        const unpatchRefresh = _patchSpecification('onRefresh', () => SESSION);
        const sessionEventCapture = beforeRefresh(refresher, SESSION);

        // call refresh() a few times
        const REFRESH_PROMISES = Array.from({ length: 3 }, () => refresher.refresh()) as [Promise<any>, Promise<any>, Promise<any>];

        await duringRefresh(refresher);

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

        afterRefresh(refresher, sessionEventCapture, SESSION);
        unpatchRefresh();
    });
});
