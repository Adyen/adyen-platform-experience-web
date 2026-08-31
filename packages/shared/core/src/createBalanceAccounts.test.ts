import { describe, expect, test, vi } from 'vitest';
import { createBalanceAccounts } from './createBalanceAccounts';

const createController = (getBalanceAccounts: ReturnType<typeof vi.fn>) => ({
    getSnapshot: vi.fn(() => ({
        contextValue: {
            endpoints: { getBalanceAccounts },
        },
    })),
});

describe('createBalanceAccounts', () => {
    test('owns initial loading and reloads after a Core refresh', async () => {
        const getBalanceAccounts = vi
            .fn()
            .mockResolvedValueOnce({ data: [{ id: 'BA_1' }] })
            .mockResolvedValueOnce({ data: [{ id: 'BA_2' }] });
        const service = createBalanceAccounts(createController(getBalanceAccounts) as never, new AbortController().signal);
        const listener = vi.fn();
        service.subscribe(listener);

        await vi.waitFor(() => expect(service.getSnapshot()).toEqual({ accounts: [{ id: 'BA_1' }], error: undefined, loading: false }));

        service.reload();

        await vi.waitFor(() => expect(service.getSnapshot()).toEqual({ accounts: [{ id: 'BA_2' }], error: undefined, loading: false }));
        expect(getBalanceAccounts).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenCalled();
    });

    test('aborts stale loads and stops publishing when its domain scope aborts', async () => {
        let resolveInitialLoad!: (response: { data: { id: string }[] }) => void;
        const initialLoad = new Promise<{ data: { id: string }[] }>(resolve => {
            resolveInitialLoad = resolve;
        });
        let initialSignal: AbortSignal | undefined;
        const getBalanceAccounts = vi
            .fn()
            .mockImplementationOnce(({ signal }) => {
                initialSignal = signal;
                return initialLoad;
            })
            .mockResolvedValueOnce({ data: [{ id: 'BA_2' }] });
        const abortController = new AbortController();
        const service = createBalanceAccounts(createController(getBalanceAccounts) as never, abortController.signal);

        service.reload();
        expect(initialSignal?.aborted).toBe(true);
        await vi.waitFor(() => expect(service.getSnapshot().accounts).toEqual([{ id: 'BA_2' }]));

        resolveInitialLoad({ data: [{ id: 'BA_1' }] });
        await Promise.resolve();
        expect(service.getSnapshot().accounts).toEqual([{ id: 'BA_2' }]);

        abortController.abort();
        expect(getBalanceAccounts.mock.calls[1]?.[0].signal.aborted).toBe(true);
    });
});
