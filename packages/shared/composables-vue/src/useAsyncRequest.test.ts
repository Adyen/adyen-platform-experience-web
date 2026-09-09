/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test, vi } from 'vitest';
import { createApp, h, type App } from 'vue';
import { createDeferred } from '@integration-components/utils';
import { useAsyncRequest } from './useAsyncRequest';

describe('useAsyncRequest', () => {
    let app: App | undefined;
    let target: HTMLDivElement | undefined;

    afterEach(() => {
        app?.unmount();
        target?.remove();
    });

    const mountRequest = <TData>() => {
        let result!: ReturnType<typeof useAsyncRequest<TData>>;
        app = createApp({
            setup() {
                result = useAsyncRequest<TData>();
                return () => h('div');
            },
        });
        target = document.createElement('div');
        app.mount(target);
        return result;
    };

    test('keeps only the latest request result', async () => {
        const first = createDeferred<string>();
        const second = createDeferred<string>();
        const request = mountRequest<string>();
        let firstSignal!: AbortSignal;

        const firstExecution = request.execute(signal => {
            firstSignal = signal;
            return first.promise;
        });
        const secondExecution = request.execute(() => second.promise);

        expect(firstSignal.aborted).toBe(true);
        expect(request.isLoading.value).toBe(true);

        second.resolve('current');
        await secondExecution;
        expect(request.data.value).toBe('current');
        expect(request.isLoading.value).toBe(false);

        first.resolve('stale');
        await firstExecution;
        expect(request.data.value).toBe('current');
    });

    test('retries eligible failures and clears the previous error', async () => {
        const transientError = new Error('transient');
        const shouldRetry = vi.fn().mockReturnValue(true);
        const handler = vi.fn().mockRejectedValueOnce(transientError).mockResolvedValueOnce('recovered');
        const request = mountRequest<string>();

        const value = await request.execute(handler, { retries: 1, shouldRetry });

        expect(value).toBe('recovered');
        expect(handler).toHaveBeenCalledTimes(2);
        expect(shouldRetry).toHaveBeenCalledWith(transientError, 0);
        expect(request.error.value).toBeUndefined();
        expect(request.isLoading.value).toBe(false);
    });

    test('exposes terminal failures and aborts on demand', async () => {
        const failure = new Error('failed');
        const request = mountRequest<string>();

        await request.execute(vi.fn().mockRejectedValue(failure));

        expect(request.error.value).toBe(failure);
        expect(request.isLoading.value).toBe(false);

        const pending = createDeferred<string>();
        let signal!: AbortSignal;
        const execution = request.execute(currentSignal => {
            signal = currentSignal;
            return pending.promise;
        });

        request.abort();
        expect(signal.aborted).toBe(true);
        expect(request.isLoading.value).toBe(false);

        pending.resolve('ignored');
        await execution;
        expect(request.data.value).toBeUndefined();
    });
});
