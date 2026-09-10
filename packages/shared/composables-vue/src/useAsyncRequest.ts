import { ref } from 'vue';
import { useAbortController } from './useAbortController';
import { AdyenErrorResponse } from '@integration-components/core';

type AsyncRequestOptions = {
    retries?: number;
    shouldRetry?: (error: AdyenErrorResponse, attempt: number) => boolean;
};

export function useAsyncRequest<TData>() {
    const data = ref<TData>();
    const error = ref<AdyenErrorResponse>();
    const isLoading = ref(false);
    const { abort, createSignal } = useAbortController();

    const abortRequest = () => {
        abort();
        isLoading.value = false;
    };

    const execute = async (request: (signal: AbortSignal) => Promise<TData>, options: AsyncRequestOptions = {}) => {
        const signal = createSignal();
        const retries = options.retries ?? 0;
        let attempt = 0;

        isLoading.value = true;
        error.value = undefined;

        try {
            while (!signal.aborted) {
                try {
                    const result = await request(signal);
                    if (!signal.aborted) {
                        data.value = result;
                    }
                    return result;
                } catch (requestError) {
                    const typedError = requestError as AdyenErrorResponse;
                    if (signal.aborted) return;

                    if (attempt < retries && options.shouldRetry?.(typedError, attempt)) {
                        attempt += 1;
                        continue;
                    }

                    error.value = typedError;
                    return;
                }
            }
        } finally {
            if (!signal.aborted) {
                isLoading.value = false;
            }
        }
    };

    return { abort: abortRequest, data, error, execute, isLoading } as const;
}

export default useAsyncRequest;
