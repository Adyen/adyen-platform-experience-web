import { afterAll, afterEach, beforeAll, Mock, SpyInstance, TestContext, vi } from 'vitest';
import { SetupEndpoint } from '../../../../types/api/endpoints';
import { SETUP_ENDPOINT_PATH } from '../constants';
import { API_VERSION } from '../../../Http/constants';
import { EMPTY_OBJECT } from '../../../../utils';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import AuthSession from '../AuthSession';

type SessionSubscribe = AuthSession['subscribe'];
type SessionUnsubscribe = ReturnType<SessionSubscribe>;

export interface MockSessionContext {
    session: AuthSession;
    subscribe: SpyInstance<Parameters<SessionSubscribe>, SessionUnsubscribe>;
    unsubscribes: Mock<Parameters<SessionUnsubscribe>, ReturnType<SessionUnsubscribe>>[];
    untilRefreshed: (checkpointIntervalMs?: number) => Promise<void>;
}

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

/**
 * This utility helps to create test spies for subscriptions to an `AuthSession` instance created by calling its
 * `.subscribe()` method. The spying functionality is introduced only as an addition to the original logic for
 * managing auth session subscriptions. Hence within any test context, the behavior of the `.subscribe()` method,
 * as well as that of any `unsubscribe` cleanup function it returns, is retained.
 *
 * This utility returns an object with the following:
 *  - `subscribe`
 *      > A test spy for the `.subscribe()` method of the `AuthSession` instance. Use this test spy when you need
 *      to create assertions for calls to the `.subscribe()` method.
 *      >
 *      > ```ts
 *      > const session = new AuthSession();
 *      > const sessionSubscriptionCallback = () => { ... };
 *      > const { subscribe } = mockSessionSubscriptions(session);
 *      >
 *      > // session.subscribe() not called yet
 *      > expect(subscribe).not.toHaveBeenCalled();
 *      >
 *      > // create a subscription by calling session.subscribe()
 *      > const unsubscribe = session.subscribe(sessionSubscriptionCallback);
 *      >
 *      > expect(subscribe).toHaveBeenCalledOnce();
 *      > expect(subscribe).toHaveBeenLastCalledWith(sessionSubscriptionCallback);
 *      > expect(subscribe).toHaveLastReturnedWith(unsubscribe);
 *      > ```
 *
 *  - `unsubscribes`
 *      > An array of mocked `unsubscribe` functions (retaining original unsubscribe logic), one for each call to the
 *      `.subscribe()` method, in chronological order. Thus, if the `.subscribe()` method has been called 10 times
 *      since after mocking the `AuthSession` instance, this array should have 10 elements (1 for each returned
 *      mocked `unsubscribe` function).
 *      >
 *      > ```ts
 *      > const session = new AuthSession();
 *      > const { unsubscribes } = mockSessionSubscriptions(session);
 *      >
 *      > // session.subscribe() not called yet, hence no unsubscribes
 *      > expect(unsubscribes).toHaveLength(0);
 *      >
 *      > // create a subscription by calling session.subscribe()
 *      > const unsubscribe = session.subscribe(() => { ... });
 *      > const unsubscribe_0 = unsubscribes[0]!;
 *      >
 *      > expect(unsubscribe_0).toStrictEqual(unsubscribe);
 *      > expect(unsubscribe_0).not.toHaveBeenCalled();
 *      >
 *      > // cancel the subscription
 *      > unsubscribe();
 *      >
 *      > expect(unsubscribe_0).toHaveBeenCalledOnce();
 *      >
 *      > // call unsubscribe() a couple more times (redundant)
 *      > unsubscribe();
 *      > unsubscribe();
 *      >
 *      > expect(unsubscribe_0).toHaveBeenCalledTimes(3);
 *      > ```
 *
 * @param session The auth session instance to mock subscriptions for
 */
export function mockSessionSubscriptions(session: AuthSession) {
    const originalSubscribe = session.subscribe;
    const subscribe = vi.spyOn(session, 'subscribe');
    const unsubscribes: MockSessionContext['unsubscribes'] = [];

    subscribe.mockImplementation((...args: any[]) => {
        const originalUnsubscribe = originalSubscribe(...args);
        const unsubscribe = vi.fn(originalUnsubscribe);
        unsubscribes.push(unsubscribe);
        return unsubscribe;
    });

    return { subscribe, unsubscribes };
}
