// @vitest-environment jsdom
import { describe, expect, test, vi } from 'vitest';
import { createSessionRefreshManager } from './refresh';
import { createEventEmitter } from '../../../reactive/eventEmitter';
import { ALREADY_RESOLVED_PROMISE, getPromiseState } from '../../../../utils';
import { PromiseState } from '../../../../utils/types';
import { ERR_SESSION_FACTORY_UNAVAILABLE, ERR_SESSION_INVALID, ERR_SESSION_REFRESH_ABORTED } from '../constants';
import type { SessionEventType, SessionSpecification } from '../types';
import type { SessionRefreshManager } from './types';

const afterRefresh = (refreshManager: SessionRefreshManager<any>, session?: any) => {
    expect(refreshManager.refreshing).toBe(false);
    expect(refreshManager.session).toBe(session);
    expect(refreshManager.signal.aborted).toBe(false);
};

const beforeRefresh = (refreshManager: SessionRefreshManager<any>) => {
    expect(refreshManager.refreshing).toBe(false);
    expect(refreshManager.session).toBeUndefined();
    expect(refreshManager.signal).toBeUndefined();
};

const doRefresh = async (refreshManager: SessionRefreshManager<any>) => {
    const actual: any[] = [];
    const expected: any[] = [];

    refreshManager.on('session', ({ detail, timeStamp }) => {
        actual.push(refreshManager.refreshing, refreshManager.signal.aborted, refreshManager.session, timeStamp);
        expected.push(true, false, detail, Date.now());
    });

    refreshManager.promise.catch(() => {});

    // initiate refresh once
    refreshManager.refresh();

    expect(refreshManager.refreshing).toBe(true);
    expect(refreshManager.signal).not.toBeUndefined();
    expect(refreshManager.signal.aborted).toBe(false);
    expect(await getPromiseState(refreshManager.promise)).toBe(PromiseState.PENDING);

    // wait for 'session' event to be dispatched
    await ALREADY_RESOLVED_PROMISE;

    if (actual.length > 0 && actual.length === expected.length) {
        // session event was dispatched and arrays have been populated

        // match all items except the last (timestamps)
        expect(actual.slice(0, -1)).toMatchObject(expected.slice(0, -1));

        // match the last items (timestamps)
        expect(actual[actual.length - 1]).toBeCloseTo(expected[expected.length - 1], -1);
    }
};

vi.mock('../constants', async importOriginal => {
    const mod = await importOriginal<typeof import('../constants')>();
    return {
        ...mod,
        ERR_SESSION_FACTORY_UNAVAILABLE: 'Error<SESSION_FACTORY_UNAVAILABLE>',
        ERR_SESSION_INVALID: 'Error<SESSION_INVALID>',
        ERR_SESSION_REFRESH_ABORTED: 'Error<SESSION_REFRESH_ABORTED>',
    };
});

describe('createSessionRefreshManager', () => {
    const _emitter = createEventEmitter<SessionEventType>();
    const _specification: SessionSpecification<any> = { onRefresh: () => {} };

    const _patchSpecification = <T extends keyof typeof _specification>(field: T, value: (typeof _specification)[T]) => {
        [_specification[field], value] = [value, _specification[field]];
        return () => void (_specification[field] = value);
    };

    const _refreshErrorAssertions = async (refreshManager: SessionRefreshManager<any>, error: any) => {
        beforeRefresh(refreshManager);

        await doRefresh(refreshManager);
        await expect(async () => refreshManager.promise).rejects.toThrowError(error);
        expect(await getPromiseState(refreshManager.promise)).toBe(PromiseState.REJECTED);

        afterRefresh(refreshManager);
    };

    test('should create session refresh manager', async () => {
        const refreshManager = createSessionRefreshManager(_emitter, _specification);
        const unpatchRefresh = _patchSpecification('onRefresh', () => 'first_session');

        beforeRefresh(refreshManager);

        await doRefresh(refreshManager);
        expect(await refreshManager.promise).toBe('first_session');
        expect(await getPromiseState(refreshManager.promise)).toBe(PromiseState.FULFILLED);

        afterRefresh(refreshManager, 'first_session');
        unpatchRefresh();
    });

    test('should throw unavailable session factory error if `onRefresh` is not callable', async () => {
        const refreshManager = createSessionRefreshManager(_emitter, _specification);
        const unpatchRefresh = _patchSpecification('onRefresh', 'non-callable' as any);
        await _refreshErrorAssertions(refreshManager, ERR_SESSION_FACTORY_UNAVAILABLE);
        unpatchRefresh();
    });

    test('should throw invalid session error if session assertion fails', async () => {
        const refreshManager = createSessionRefreshManager(_emitter, _specification);
        const unpatchAssert = _patchSpecification('assert', undefinedSession => (undefinedSession as any)());
        await _refreshErrorAssertions(refreshManager, ERR_SESSION_INVALID);
        unpatchAssert();
    });
});
