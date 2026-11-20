/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDeferred } from '@integration-components/utils';
import { SetupContext } from './SetupContext';
import type { SessionObject, SetupResponse } from '../ConfigContext.types';
import { getCustomizedComponentEventPayloads } from '../EventDispatcher/eventDispatcher/core-events';
import { SessionContext } from './SessionContext';
import { AuthSessionSpecification } from './AuthSessionSpecification';
import type { HttpOptions } from '../Http/types';

const setupResponse: SetupResponse = {
    endpoints: {
        sendTrackEvent: { method: 'POST', url: 'https://analytics.test/track' },
        sendEngageEvent: { method: 'POST', url: 'https://analytics.test/engage' },
    },
} as unknown as SetupResponse;

const createSetupContext = () => {
    // The session context is only used for its `http` call, which stubs the setup
    // endpoint response and every subsequent track/engage call.
    const http = vi.fn().mockResolvedValueOnce(setupResponse).mockResolvedValue({});
    const setupContext = new SetupContext({ http } as never);

    return { http, setupContext };
};

describe('SetupContext endpoint base URLs', () => {
    afterEach(() => vi.unstubAllGlobals());

    const initialize = async (endpoints: Partial<SetupResponse['endpoints']>) => {
        const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValueOnce(Response.json({ endpoints }));
        fetch.mockImplementation(async () => Response.json({}));
        vi.stubGlobal('fetch', fetch);

        const session = new SessionContext<SessionObject, [HttpOptions]>({
            onRefresh: () => ({ id: 'session-id', token: 'session-token' }),
            deadline: () => new AbortController().signal,
            http: new AuthSessionSpecification().http,
        });
        const signal = new AbortController().signal;
        await session.refresh(signal);

        const setup = new SetupContext(session);
        setup.loadingContext = 'https://platform-components-external-test.adyen.com/platform-components-external/api/';
        await setup.refresh(signal);
        return { fetch, setup, signal };
    };

    it.each([
        {
            baseUrl: undefined,
            expected: 'https://platform-components-external-test.adyen.com/platform-components-external/api/v2/transactions/transaction-id',
        },
        {
            baseUrl: '',
            expected: 'https://platform-components-external-test.adyen.com/platform-components-external/api/v2/transactions/transaction-id',
        },
        {
            baseUrl: 'https://standalone-component-ui-test.adyen.com/api',
            expected: 'https://standalone-component-ui-test.adyen.com/api/v2/transactions/transaction-id',
        },
        {
            baseUrl: 'https://standalone-component-ui-test.adyen.com/api/',
            expected: 'https://standalone-component-ui-test.adyen.com/api/v2/transactions/transaction-id',
        },
    ])('resolves $baseUrl using the SDK API version', async ({ baseUrl, expected }) => {
        const { fetch, setup } = await initialize({
            getTransaction: { method: 'GET', url: '/transactions/{transactionId}', baseUrl },
        });

        await setup.endpoints.getTransaction!({}, { path: { transactionId: 'transaction-id' } });

        expect(String(fetch.mock.calls[0]?.[0])).toBe(
            'https://platform-components-external-test.adyen.com/platform-components-external/api/v1/setup'
        );
        expect(String(fetch.mock.calls[1]?.[0])).toBe(expected);
        expect(fetch.mock.calls[1]?.[1]).toMatchObject({
            method: 'GET',
            headers: { Authorization: 'Bearer session-token' },
        });
    });

    it.each([
        {
            baseUrl: 'https://standalone-component-ui-test.adyen.com/cashout-ui/api/{version}',
            expected: 'https://standalone-component-ui-test.adyen.com/cashout-ui/api/v2/transactions/transaction-id',
        },
        {
            baseUrl: 'https://standalone-component-ui-test.adyen.com/cashout-ui/api/{version}/',
            expected: 'https://standalone-component-ui-test.adyen.com/cashout-ui/api/v2/transactions/transaction-id',
        },
        {
            baseUrl: 'https://standalone-component-ui-test.adyen.com/cashout-ui/api/{version}/internal',
            expected: 'https://standalone-component-ui-test.adyen.com/cashout-ui/api/v2/internal/transactions/transaction-id',
        },
        {
            baseUrl: 'https://standalone-component-ui-test.adyen.com/{version}/cashout-ui/api/',
            expected: 'https://standalone-component-ui-test.adyen.com/v2/cashout-ui/api/transactions/transaction-id',
        },
    ])('replaces the {version} placeholder in $baseUrl with the SDK API version', async ({ baseUrl, expected }) => {
        const { fetch, setup } = await initialize({
            getTransaction: { method: 'GET', url: '/transactions/{transactionId}', baseUrl },
        });

        await setup.endpoints.getTransaction!({}, { path: { transactionId: 'transaction-id' } });

        expect(String(fetch.mock.calls[1]?.[0])).toBe(expected);
    });

    it('routes endpoints independently while preserving query parameters and default API versions', async () => {
        const { fetch, setup } = await initialize({
            getPayout: { method: 'GET', url: 'payouts', baseUrl: 'https://standalone-component-ui-test.adyen.com/cashout-ui/api/{version}' },
            getTransaction: { method: 'GET', url: '/transactions/{transactionId}' },
        });

        await setup.endpoints.getPayout!({}, { query: { balanceAccountId: 'account-id' } });
        await setup.endpoints.getTransaction!({}, { path: { transactionId: 'transaction-id' } });

        expect(String(fetch.mock.calls[1]?.[0])).toBe(
            'https://standalone-component-ui-test.adyen.com/cashout-ui/api/v1/payouts?balanceAccountId=account-id'
        );
        expect(String(fetch.mock.calls[2]?.[0])).toBe(
            'https://platform-components-external-test.adyen.com/platform-components-external/api/v2/transactions/transaction-id'
        );
    });

    it('uses the latest advertised base URL after setup refresh, including its removal', async () => {
        const { fetch, setup, signal } = await initialize({
            getTransaction: {
                method: 'GET',
                url: '/transactions/{transactionId}',
                baseUrl: 'https://standalone-component-ui-test.adyen.com/cashout-ui/api/{version}',
            },
        });
        const callEndpoint = () => setup.endpoints.getTransaction!({}, { path: { transactionId: 'transaction-id' } });
        await callEndpoint();

        for (const baseUrl of ['https://standalone-component-ui-beta.adyen.com/cashout-ui/api/{version}', undefined]) {
            fetch.mockResolvedValueOnce(
                Response.json({ endpoints: { getTransaction: { method: 'GET', url: '/transactions/{transactionId}', baseUrl } } })
            );
            await setup.refresh(signal);
            await callEndpoint();
        }

        expect(fetch.mock.calls.map(([url]) => String(url))).toEqual([
            'https://platform-components-external-test.adyen.com/platform-components-external/api/v1/setup',
            'https://standalone-component-ui-test.adyen.com/cashout-ui/api/v2/transactions/transaction-id',
            'https://platform-components-external-test.adyen.com/platform-components-external/api/v1/setup',
            'https://standalone-component-ui-beta.adyen.com/cashout-ui/api/v2/transactions/transaction-id',
            'https://platform-components-external-test.adyen.com/platform-components-external/api/v1/setup',
            'https://platform-components-external-test.adyen.com/platform-components-external/api/v2/transactions/transaction-id',
        ]);
    });
});

describe('SetupContext.sendAnalyticsEvent', () => {
    it('queues core events until the setup endpoint resolves', () => {
        const { http, setupContext } = createSetupContext();
        setupContext.analyticsEnabled = true;

        const payload = new URLSearchParams({ data: 'initiated-core-event' });
        setupContext.sendAnalyticsEvent(payload);

        expect(setupContext.analyticsPayload).toEqual([payload]);
        // Nothing is sent yet: no session call has happened at all.
        expect(http).not.toHaveBeenCalled();
    });

    it('flushes queued events through sendTrackEvent once setup resolves', async () => {
        const { http, setupContext } = createSetupContext();
        setupContext.analyticsEnabled = true;

        const payload = new URLSearchParams({ data: 'initiated-core-event' });
        setupContext.sendAnalyticsEvent(payload);

        await setupContext.refresh(new AbortController().signal);

        // setup endpoint + engage profile + track event
        await vi.waitFor(() => expect(http).toHaveBeenCalledTimes(3));
        expect(setupContext.analyticsPayload).toBeUndefined();
        expect(http.mock.calls[2]?.[1]).toMatchObject({ body: payload, method: 'POST' });
    });

    it('retains component configuration events during setup and sends them only once after readiness', async () => {
        const setup = createDeferred<SetupResponse>();
        const profile = createDeferred<object>();
        const http = vi.fn().mockReturnValueOnce(setup.promise).mockReturnValueOnce(profile.promise).mockResolvedValue({});
        const setupContext = new SetupContext({ http } as never);
        setupContext.analyticsEnabled = true;

        const refresh = setupContext.refresh(new AbortController().signal);
        await vi.waitFor(() => expect(http).toHaveBeenCalledTimes(1));

        const payloads = getCustomizedComponentEventPayloads({
            componentName: 'transactions',
            appearance: { titles: 'hidden' },
            componentProps: { pagination: { defaultLimit: 25 } },
            locale: 'en-US',
        }).filter(payload => payload !== null);
        expect(payloads).toHaveLength(2);

        payloads.forEach(payload => setupContext.sendAnalyticsEvent(payload));

        expect(setupContext.analyticsPayload).toEqual(payloads);
        expect(http).toHaveBeenCalledTimes(1);

        setup.resolve(setupResponse);
        await refresh;
        await vi.waitFor(() => expect(http).toHaveBeenCalledTimes(2));
        expect(http).toHaveBeenNthCalledWith(2, expect.any(Function), expect.objectContaining({ path: 'https://analytics.test/engage' }));
        expect(setupContext.analyticsPayload).toEqual(payloads);

        profile.resolve({});
        await vi.waitFor(() => expect(http).toHaveBeenCalledTimes(4));

        for (const [index, payload] of payloads.entries()) {
            expect(http).toHaveBeenNthCalledWith(
                index + 3,
                expect.any(Function),
                expect.objectContaining({
                    path: 'https://analytics.test/track',
                    method: 'POST',
                    body: payload,
                })
            );
        }
        expect(setupContext.analyticsPayload).toBeUndefined();

        http.mockResolvedValueOnce(setupResponse);
        await setupContext.refresh(new AbortController().signal);
        await vi.waitFor(() => expect(http).toHaveBeenCalledTimes(6));

        const trackedPayloads = http.mock.calls
            .filter(([, options]) => options.path === 'https://analytics.test/track')
            .map(([, options]) => options.body);
        expect(trackedPayloads).toEqual(payloads);
    });

    it('sends events immediately once the setup endpoints are live', async () => {
        const { http, setupContext } = createSetupContext();
        setupContext.analyticsEnabled = true;

        await setupContext.refresh(new AbortController().signal);
        await vi.waitFor(() => expect(http).toHaveBeenCalledTimes(2)); // setup + engage

        const payload = new URLSearchParams({ data: 'updated-theme-event' });
        setupContext.sendAnalyticsEvent(payload);

        await vi.waitFor(() => expect(http).toHaveBeenCalledTimes(3));
        expect(setupContext.analyticsPayload).toBeUndefined();
        expect(http.mock.calls[2]?.[1]).toMatchObject({ body: payload });
    });

    it('re-queues events that fail to send so the next refresh retries them', async () => {
        const http = vi.fn().mockResolvedValueOnce(setupResponse).mockResolvedValueOnce({}).mockRejectedValue(new Error('network down'));
        const setupContext = new SetupContext({ http } as never);
        setupContext.analyticsEnabled = true;

        const payload = new URLSearchParams({ data: 'initiated-core-event' });
        setupContext.sendAnalyticsEvent(payload);

        await setupContext.refresh(new AbortController().signal);

        await vi.waitFor(() => expect(http).toHaveBeenCalledTimes(3));
        expect(setupContext.analyticsPayload).toEqual([payload]);

        // A later refresh retries the failed payload.
        http.mockResolvedValueOnce(setupResponse).mockResolvedValue({});
        await setupContext.refresh(new AbortController().signal);

        await vi.waitFor(() => expect(setupContext.analyticsPayload).toBeUndefined());
    });

    it('ignores events when analytics is disabled', () => {
        const { http, setupContext } = createSetupContext();
        setupContext.analyticsEnabled = false;

        setupContext.sendAnalyticsEvent(new URLSearchParams({ data: 'initiated-core-event' }));

        expect(setupContext.analyticsPayload).toBeUndefined();
        expect(http).not.toHaveBeenCalled();
    });
});
