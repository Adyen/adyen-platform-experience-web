import { afterAll, afterEach, beforeAll, describe, expect, expectTypeOf, test, vi } from 'vitest';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { type DelayedEndpoints, provisionDelayedEndpoints } from './delayedEndpoints';

vi.mock('msw', async importOriginal => ({
    ...(await importOriginal<typeof import('msw')>()),
    delay: vi.fn().mockResolvedValue(undefined),
}));

describe('provisionDelayedEndpoints', () => {
    const endpoints = { list: 'https://example.test/items', details: 'https://example.test/items/:id' };
    const listResolver = vi.fn(() => HttpResponse.json(['item']));
    const server = setupServer(
        http.get(endpoints.list, listResolver),
        http.post(endpoints.list, () => new HttpResponse(null, { status: 201 })),
        http.get(endpoints.details, () => HttpResponse.json({ id: '123' }))
    );

    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
    afterEach(() => {
        server.resetHandlers();
        vi.clearAllMocks();
    });
    afterAll(() => server.close());

    test.each([undefined, {}])('should leave the worker unchanged for %j delays', delayedEndpoints => {
        const worker = { use: vi.fn() };
        provisionDelayedEndpoints(worker, endpoints, delayedEndpoints);
        expect(worker.use).not.toHaveBeenCalled();
    });

    test('should delay selected endpoints for all methods and preserve their responses', async () => {
        provisionDelayedEndpoints(server, endpoints, { list: 20, details: 40 });

        const [list, created, details] = await Promise.all([
            fetch(endpoints.list),
            fetch(endpoints.list, { method: 'POST' }),
            fetch('https://example.test/items/123'),
        ]);

        expect(await list.json()).toEqual(['item']);
        expect(created.status).toBe(201);
        expect(await details.json()).toEqual({ id: '123' });
        expect(vi.mocked(delay).mock.calls).toEqual(expect.arrayContaining([[20], [20], [40]]));
        expect(delay).toHaveBeenCalledTimes(3);
    });

    test('should wait for the delay before resolving the existing response', async () => {
        let finishDelay!: () => void;
        vi.mocked(delay).mockImplementationOnce(() => new Promise<void>(resolve => (finishDelay = resolve)));
        provisionDelayedEndpoints(server, endpoints, { list: 1000 });

        const response = fetch(endpoints.list);
        await vi.waitFor(() => expect(delay).toHaveBeenCalledWith(1000));
        expect(listResolver).not.toHaveBeenCalled();

        finishDelay();
        expect(await (await response).json()).toEqual(['item']);
        expect(listResolver).toHaveBeenCalledOnce();
    });

    test('should not delay endpoints that were not selected', async () => {
        provisionDelayedEndpoints(server, endpoints, { list: 1000 });

        const response = await fetch('https://example.test/items/123');

        expect(await response.json()).toEqual({ id: '123' });
        expect(delay).not.toHaveBeenCalled();
    });

    test('should only accept delays for keys in the endpoint map', () => {
        expectTypeOf<DelayedEndpoints<typeof endpoints>>().toEqualTypeOf<{ list?: number; details?: number }>();
    });
});
