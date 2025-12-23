import { afterAll, afterEach, beforeAll, Mock, MockInstance, TestContext, vi } from 'vitest';
import { createAbortable } from '../../../../primitives/async/abortable';
import { SetupEndpoint } from '../../../../types/api/endpoints';
import { SETUP_ENDPOINT_PATH } from '../constants';
import { API_VERSION } from '../../../Http/constants';
import { EMPTY_OBJECT } from '../../../../utils';
import { Core } from '../../../index';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import AuthSession from '../AuthSession';

type SessionSubscribe = AuthSession['subscribe'];
type SessionUnsubscribe = ReturnType<SessionSubscribe>;

const DeadlineAbortables = new WeakMap<any, ReturnType<typeof createAbortable>>();

vi.mock('../AuthSessionSpecification', async () => {
    const module = await vi.importActual<typeof import('../AuthSessionSpecification')>('../AuthSessionSpecification');
    const AuthSessionSpecification = class extends module.default {
        public readonly deadline = (session: any) => DeadlineAbortables.get(session)!.signal;
    };
    return { AuthSessionSpecification, default: AuthSessionSpecification };
});

export interface MockSessionContext {
    core: Core<any, any>;
    expireSession(): void;
    refreshSession(...args: Parameters<AuthSession['refresh']>): Promise<void>;
    session: AuthSession;
    subscribe: MockInstance<SessionSubscribe>;
    unsubscribes: Mock<SessionUnsubscribe>[];
    untilSessionRefreshed(): Promise<void>;
}

export type SetupEndpoints = Partial<SetupEndpoint>;

export const LOADING_CONTEXT = 'https://o_O.mocked';
export const BASE_URL = `${LOADING_CONTEXT}/${API_VERSION}`;
export const SETUP_ENDPOINT = `${BASE_URL}${SETUP_ENDPOINT_PATH}`;

/**
 * Utility for creating a mock server context to use alongside with session-aware test suites. The `/setup` endpoint is
 * mocked by default in this server context and returns an empty record of endpoints. The `useEndpoints()` function
 * returned from this utility, can be used to temporarily override the default endpoints returned from `/setup` as
 * needed for a given test case.
 *
 * This utility returns an object with the following:
 *  - `initializeServer()`
 *      > Should be called from within a test suite to initialize the mock server. It configures test hooks for
 *      starting the mock server, resetting temporary handlers, and closing the mock server at the end of the suite.
 *
 *  - `mockServer`
 *      > The underlying mock server instance. Could be useful for temporarily setting up additional handlers for
 *      endpoints as needed for a given test case.
 *
 *  - `useEndpoints()`
 *      > Should be called with a record of `/setup` endpoints to override the default empty record. Useful for
 *      temporarily provisioning a set of endpoints for a given test case.
 *
 * @example
 * ```ts
 * describe('my test suite', () => {
 *   const { initializeServer, mockServer, useEndpoints } = createMockServerContext();
 *
 *   // initialize the mock server
 *   initializeServer();
 *
 *   test('setup should return endpoints', () => {
 *      const ENDPOINTS = { ... };
 *
 *      // override setup endpoints for this test case
 *      useEndpoints(ENDPOINTS);
 *
 *      mockServer.use(
 *          // add some additional handlers
 *          http.get(`${BASE_URL}/getBalanceAccounts`, () => HttpResponse.json({ ... }))
 *       );
 *   });
 * });
 * ```
 */
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

/**
 * Utility for creating a mock session context to use for session-aware test cases. If a test context is provided, it
 * is augmented with the created mock session context data, which can be very useful for extending test cases with
 * fixtures that can be used for session-aware testing. The mock session context should always be used alongside a
 * mock server context ({@link createMockServerContext}).
 *
 * @example
 * ```ts
 * describe('my test suite', () => {
 *   createMockServerContext().initializeServer();
 *
 *   beforeEach<MockSessionContext>(async ctx => {
 *      await createMockSessionContext(ctx);
 *   });
 *
 *   it<MockSessionContext>('subscribe to session', async ({ session, subscribe }) => {
 *      session.subscribe(() => { ... });
 *
 *      // session.subscribe() called once
 *      expect(subscribe).toHaveBeenCalledOnce();
 *   });
 * });
 * ```
 *
 * @param ctx Optional test context for which to augment with mock session context data
 */
export async function createMockSessionContext<Ctx extends TestContext & MockSessionContext>(ctx?: Ctx): Promise<MockSessionContext> {
    const abortable = createAbortable();
    const authSession = { id: 'xxxx', token: 'xxxx' };
    const onSessionCreate = () => authSession;

    DeadlineAbortables.set(authSession, abortable);

    const core = new Core({ onSessionCreate });
    const session = new AuthSession();

    session.loadingContext = LOADING_CONTEXT;
    session.onSessionCreate = onSessionCreate;

    const untilSessionRefreshed = createUntilSessionRefreshedFunc(session);
    const expireSession = (): void => void abortable.refresh(true);

    const refreshSession: MockSessionContext['refreshSession'] = async (...args) => {
        session.refresh(...args);
        await untilSessionRefreshed();
    };

    // wait for any pending session refresh
    await untilSessionRefreshed();

    // initially mark session as expired
    expireSession();

    // mock session subscriptions
    const { subscribe, unsubscribes } = mockSessionSubscriptions(session);

    // bind mock session to core instance
    vi.spyOn(core, 'session', 'get').mockReturnValue(session);

    if (ctx !== undefined) {
        ctx.core = core;
        ctx.session = session;
        ctx.subscribe = subscribe;
        ctx.unsubscribes = unsubscribes;
        ctx.expireSession = expireSession;
        ctx.refreshSession = refreshSession;
        ctx.untilSessionRefreshed = untilSessionRefreshed;
    }

    return { core, expireSession, refreshSession, session, subscribe, unsubscribes, untilSessionRefreshed };
}

/**
 * This higher-order function takes an `AuthSession` instance and returns an `untilSessionRefreshed()` function, which
 * when called, returns a `promise` that only gets settled in either of these cases:
 *  - if there is no pending refresh for the `AuthSession` instance, then it gets settled almost immediately
 *  - if there is a pending refresh, then it gets settled when the pending refresh is completed
 *
 * @example
 * ```ts
 * const session = new AuthSession();
 * const untilSessionRefreshed = createUntilSessionRefreshedFunc(session);
 *
 * // wait for any pending session refresh
 * await untilSessionRefreshed();
 * ```
 *
 * @param session The auth session instance for which to wait for refreshes
 */
export function createUntilSessionRefreshedFunc(session: AuthSession) {
    const subscribe = session.subscribe.bind(session);
    let refreshedPromise: Promise<void>;
    let unsubscribe: () => void;

    return function untilSessionRefreshed() {
        if (refreshedPromise === undefined) {
            refreshedPromise = new Promise<void>(resolve => {
                unsubscribe = subscribe(() => void (session.context.refreshing || resolve()));
            });
            refreshedPromise.finally(() => {
                refreshedPromise = undefined!;
                unsubscribe?.();
            });
        }
        return refreshedPromise;
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
 *
 *  - `unsubscribes`
 *      > An array of mocked `unsubscribe` functions (retaining original unsubscribe logic), one for each call to the
 *      `.subscribe()` method, in chronological order. Thus, if the `.subscribe()` method has been called 10 times
 *      since after mocking the `AuthSession` instance, this array should have 10 elements (1 for each returned
 *      mocked `unsubscribe` function).
 *
 * @example
 * ```ts
 * const session = new AuthSession();
 * const sessionSubscriptionCallback = () => { ... };
 * const { subscribe, unsubscribes } = mockSessionSubscriptions(session);
 *
 * // session.subscribe() not called yet, hence no unsubscribes
 * expect(subscribe).not.toHaveBeenCalled();
 * expect(unsubscribes).toHaveLength(0);
 *
 * // create a subscription by calling session.subscribe()
 * const unsubscribe = session.subscribe(sessionSubscriptionCallback);
 * const unsubscribe_0 = unsubscribes[0]!;
 *
 * expect(subscribe).toHaveBeenCalledOnce();
 * expect(subscribe).toHaveBeenLastCalledWith(sessionSubscriptionCallback);
 * expect(subscribe).toHaveLastReturnedWith(unsubscribe);
 *
 * expect(unsubscribe_0).toBe(unsubscribe);
 * expect(unsubscribe_0).not.toHaveBeenCalled();
 *
 * // cancel the subscription
 * unsubscribe();
 *
 * expect(unsubscribe_0).toHaveBeenCalledOnce();
 *
 * // call unsubscribe() a couple more times (redundant)
 * unsubscribe();
 * unsubscribe();
 *
 * expect(unsubscribe_0).toHaveBeenCalledTimes(3);
 * ```
 *
 * @param session The auth session instance for which to mock subscriptions
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
