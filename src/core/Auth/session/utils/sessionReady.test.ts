import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { SETUP_ENDPOINT_PATH } from '../constants';
import { API_VERSION } from '../../../Http/constants';
import { EMPTY_OBJECT } from '../../../../utils';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import sessionReady from './sessionReady';
import AuthSession from '../AuthSession';

describe('sessionReady', () => {
    type WithAuthSession = { session: AuthSession };

    const LOADING_CONTEXT = 'http://test.example';
    const BASE_URL = `${LOADING_CONTEXT}/${API_VERSION}`;
    const endpoints = EMPTY_OBJECT;

    const mockServer = setupServer(http.post(`${BASE_URL}${SETUP_ENDPOINT_PATH}`, () => HttpResponse.json({ endpoints })));

    beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
    afterAll(() => mockServer.close());
    afterEach(() => mockServer.resetHandlers());

    beforeEach<WithAuthSession>(ctx => {
        ctx.session = new AuthSession();
        ctx.session.loadingContext = LOADING_CONTEXT;
        ctx.session.onSessionCreate = () => ({ id: 'xxxx', token: 'xxxx' });
    });

    it<WithAuthSession>('should start one-off subscription to auth session', async ({ session }) => {
        const subscribe = vi.spyOn(session, 'subscribe');
        const readyPromise = sessionReady(session);

        // session.subscribe called once (immediately)
        expect(subscribe).toHaveBeenCalledOnce();

        await readyPromise;

        // session.subscribe not called again (called only once)
        expect(subscribe).toHaveBeenCalledTimes(1);
    });

    it<WithAuthSession>('should unsubscribe from auth session after ready promise settles', async ({ session }) => {
        const unsubscribe = vi.fn();

        vi.spyOn(session, 'subscribe').mockImplementationOnce((...args: any[]) => {
            const originalUnsubscribe = session.subscribe(...args);
            unsubscribe.mockImplementationOnce(originalUnsubscribe);
            return unsubscribe;
        });

        const readyPromise = sessionReady(session);

        // unsubscribe not called yet until session ready promise is settled
        expect(unsubscribe).not.toHaveBeenCalled();

        await readyPromise;

        // unsubscribe called only once after session ready promise is settled
        expect(unsubscribe).toHaveBeenCalledOnce();
    });
});
