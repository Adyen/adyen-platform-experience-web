// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { getMySessionToken } from './sessionRequest';

describe('getMySessionToken', () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: 'test-id', token: 'test-token' })));

    beforeEach(() => {
        // Simulates opening Storybook on a host other than the configured app URL (e.g. 127.0.0.1 vs localhost)
        vi.stubEnv('VITE_APP_URL', 'http://configured-host.test:3030/');
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        fetchMock.mockClear();
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
    });

    test('should request the session from the current page origin', async () => {
        await getMySessionToken();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [requestUrl] = fetchMock.mock.calls[0] as unknown as [URL | string];
        expect(new URL(requestUrl).href).toBe(new URL('/api/authe/api/v1/sessions', window.location.origin).href);
    });

    test('should keep the configured app URL as the allowed origin', async () => {
        await getMySessionToken();

        const [, init] = fetchMock.mock.calls[0] as unknown as [URL | string, RequestInit];
        expect(JSON.parse(init.body as string).allowOrigin).toBe('http://configured-host.test:3030');
    });
});
