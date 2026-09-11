/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, h, nextTick, ref, type App } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { createDeferred } from '@integration-components/utils';
import { useDownload } from './useDownload';

vi.mock('@integration-components/core/vue', () => ({
    useConfigContext: vi.fn(),
}));

describe.sequential('useDownload', () => {
    let app: App | undefined;
    let target: HTMLDivElement | undefined;

    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        app?.unmount();
        target?.remove();
    });

    const mountDownload = (downloadTransactions?: ReturnType<typeof vi.fn>) => {
        const enabled = ref(false);
        const query = ref({ query: { balanceAccountId: 'BA1' } });
        const onSuccess = vi.fn();
        let result!: ReturnType<typeof useDownload>;

        vi.mocked(useConfigContext).mockReturnValue({
            endpoints: downloadTransactions ? { downloadTransactions } : {},
        } as unknown as ReturnType<typeof useConfigContext>);

        app = createApp({
            setup() {
                result = useDownload(
                    'downloadTransactions',
                    () => query.value,
                    () => enabled.value,
                    onSuccess
                );
                return () => h('div');
            },
        });
        target = document.createElement('div');
        app.mount(target);

        return { enabled, onSuccess, query, result };
    };

    test('downloads with the current query and exposes request state', async () => {
        const request = createDeferred<{ blob: Blob; filename: string }>();
        const downloadTransactions = vi.fn().mockReturnValue(request.promise);
        const { enabled, onSuccess, result } = mountDownload(downloadTransactions);

        enabled.value = true;
        await nextTick();

        expect(result.isFetching.value).toBe(true);
        expect(result.error.value).toBeUndefined();
        expect(downloadTransactions).toHaveBeenCalledOnce();
        expect(downloadTransactions.mock.lastCall?.[0]?.signal).toBeInstanceOf(AbortSignal);
        expect(downloadTransactions.mock.lastCall?.[1]).toEqual({ query: { balanceAccountId: 'BA1' } });

        const response = { blob: new Blob(['transactions']), filename: 'transactions.csv' };
        request.resolve(response);

        await vi.waitFor(() => expect(result.isFetching.value).toBe(false));
        expect(onSuccess).toHaveBeenCalledWith(response);
    });

    test('exposes download failures', async () => {
        const failure = new Error('Download failed');
        const downloadTransactions = vi.fn().mockRejectedValue(failure);
        const { enabled, onSuccess, result } = mountDownload(downloadTransactions);

        enabled.value = true;

        await vi.waitFor(() => expect(downloadTransactions).toHaveBeenCalledOnce());
        await vi.waitFor(() => expect(result.isFetching.value).toBe(false));
        expect(result.error.value).toBe(failure);
        expect(onSuccess).not.toHaveBeenCalled();
    });

    test('aborts stale and unmounted requests', async () => {
        const firstRequest = createDeferred<{ blob: Blob }>();
        const secondRequest = createDeferred<{ blob: Blob }>();
        const downloadTransactions = vi.fn().mockReturnValueOnce(firstRequest.promise).mockReturnValueOnce(secondRequest.promise);
        const { enabled, onSuccess, result } = mountDownload(downloadTransactions);

        enabled.value = true;
        await nextTick();
        const firstSignal = downloadTransactions.mock.calls[0]?.[0]?.signal as AbortSignal;

        enabled.value = false;
        await nextTick();
        enabled.value = true;
        await nextTick();

        expect(firstSignal.aborted).toBe(true);
        const secondSignal = downloadTransactions.mock.calls[1]?.[0]?.signal as AbortSignal;

        app?.unmount();
        app = undefined;

        expect(secondSignal.aborted).toBe(true);
        firstRequest.resolve({ blob: new Blob(['stale']) });
        secondRequest.reject(new Error('aborted'));
        await Promise.allSettled([firstRequest.promise, secondRequest.promise]);
        expect(onSuccess).not.toHaveBeenCalled();
        expect(result.error.value).toBeUndefined();
    });

    test('does not request a download without an endpoint', async () => {
        const { enabled, result } = mountDownload();

        enabled.value = true;
        await nextTick();

        expect(result.isFetching.value).toBe(false);
        expect(result.error.value).toBeUndefined();
    });
});
