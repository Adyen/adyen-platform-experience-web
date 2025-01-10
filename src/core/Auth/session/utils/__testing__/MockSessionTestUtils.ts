import { afterAll, afterEach, beforeAll, SpyInstance, TestContext, vi } from 'vitest';
import { SETUP_ENDPOINT_PATH } from '../../constants';
import { API_VERSION } from '../../../../Http/constants';
import { EMPTY_OBJECT } from '../../../../../utils';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import AuthSession from '../../AuthSession';
import { SetupEndpoint } from '../../../../../types/api/endpoints';

export type MockSessionContext = {
    session: AuthSession;
    subscribe: SpyInstance<Parameters<AuthSession['subscribe']>, ReturnType<AuthSession['subscribe']>>;
    unsubscribes: ReturnType<(typeof vi)['fn']>[];
    untilRefreshed: (checkpointIntervalMs?: number) => Promise<void>;
};

export type SetupEndpoints = Partial<SetupEndpoint>;

export const LOADING_CONTEXT = 'http://mock.test.example';
export const BASE_URL = `${LOADING_CONTEXT}/${API_VERSION}`;
export const SETUP_ENDPOINT = `${BASE_URL}${SETUP_ENDPOINT_PATH}`;

export function createMockServerContext() {
    const _serveEndpoints = (endpoints: SetupEndpoints) => () => HttpResponse.json({ endpoints });
    const useEndpoints = (endpoints: SetupEndpoints) => mockServer.use(http.post(SETUP_ENDPOINT, _serveEndpoints(endpoints)));
    const mockServer = setupServer(http.post(SETUP_ENDPOINT, _serveEndpoints(EMPTY_OBJECT)));

    const initializeServer = () => {
        beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
        afterEach(() => mockServer.resetHandlers());
        afterAll(() => mockServer.close());
    };

    return { initializeServer, mockServer, useEndpoints };
}

export async function createMockSessionContext<Ctx extends TestContext & MockSessionContext>(ctx?: Ctx): Promise<MockSessionContext> {
    const session = new AuthSession();
    const untilRefreshed = createUntilRefreshedFunc(session);

    session.loadingContext = LOADING_CONTEXT;
    session.onSessionCreate = () => ({ id: 'xxxx', token: 'xxxx' });

    // wait for pending session refresh
    await untilRefreshed();

    // mock session subscriptions
    const { subscribe, unsubscribes } = mockSessionSubscriptions(session);

    if (ctx !== undefined) {
        ctx.session = session;
        ctx.subscribe = subscribe;
        ctx.unsubscribes = unsubscribes;
        ctx.untilRefreshed = untilRefreshed;
    }

    return { session, subscribe, unsubscribes, untilRefreshed };
}

export function createUntilRefreshedFunc(session: AuthSession) {
    let untilRefreshedPromise: Promise<void>;

    return function untilRefreshed(checkpointIntervalMs = 50) {
        if (untilRefreshedPromise === undefined) {
            untilRefreshedPromise = new Promise<void>(resolve =>
                (function _checkpoint() {
                    session.context.refreshing ? setTimeout(_checkpoint, checkpointIntervalMs) : resolve();
                })()
            );
            untilRefreshedPromise.finally(() => (untilRefreshedPromise = undefined!));
        }
        return untilRefreshedPromise;
    };
}

export function mockSessionSubscriptions(session: AuthSession) {
    const originalSubscribe = session.subscribe;
    const subscribe = vi.spyOn(session, 'subscribe');
    const unsubscribes: MockSessionContext['unsubscribes'] = [];

    subscribe.mockImplementation((...args: any[]) => {
        const originalUnsubscribe = originalSubscribe(...args);
        const unsubscribe = vi.fn().mockImplementationOnce(originalUnsubscribe);
        unsubscribes.push(unsubscribe);
        return unsubscribe;
    });

    return { subscribe, unsubscribes };
}
