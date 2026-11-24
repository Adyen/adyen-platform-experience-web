// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import AuthSession from './AuthSession';
import sessionReady from './utils/sessionReady';
import { checkComponentPermission, subscribeToSession } from '../setupConfig';
import { noop } from '@integration-components/utils';

describe('AuthSession', () => {
    let session: AuthSession;
    let sessionsCreated: number;

    const settle = async () => {
        for (let i = 0; i < 2; i++) await new Promise(resolve => setTimeout(resolve, 10));
    };

    const mountComponent = () => {
        const unmount = subscribeToSession(session, { onContextChange: noop, onUnsubscribe: noop });
        void checkComponentPermission(undefined, session);
        return unmount;
    };

    beforeEach(() => {
        sessionsCreated = 0;
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => Response.json({ endpoints: {} }))
        );
        session = new AuthSession();
        session.loadingContext = 'https://example.test/';
        session.onSessionCreate = async () => ({ id: `session-${++sessionsCreated}`, token: 'opaque-token' });
    });

    afterEach(() => vi.unstubAllGlobals());

    test('should reuse a session without a deadline across component mounts and session ready checks', async () => {
        const unmountFirst = mountComponent();
        await settle();
        expect(sessionsCreated).toBe(1);

        const unmountSecond = mountComponent();
        await settle();

        unmountFirst();
        unmountSecond();
        const unmountThird = mountComponent();
        await settle();

        await sessionReady(session);
        unmountThird();
        await sessionReady(session);
        await settle();

        expect(sessionsCreated).toBe(1);
        expect(session.context.isExpired).toBe(false);
    });
});
