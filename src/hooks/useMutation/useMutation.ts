import { useState, useCallback, useRef, useMemo, useEffect } from 'preact/hooks';

type MutationOptions<ResponseType> = {
    onSuccess?: (data: ResponseType) => void | Promise<void>;
    onError?: (error: Error) => void | Promise<void>;
    onSettled?: (data: ResponseType | undefined, error: Error | null) => void | Promise<void>;
    retry?: number | boolean;
    retryDelay?: number | ((retryAttempt: number) => number);
};
type MutationStatus = 'idle' | 'loading' | 'success' | 'error';

function useMutation<queryFn extends (...args: any) => any, ResponseType extends Awaited<ReturnType<queryFn>>>({
    queryFn,
    options,
}: {
    queryFn: queryFn | undefined;
    options?: MutationOptions<ResponseType>;
}) {
    const { retry = false, retryDelay = 1000, onSuccess, onError, onSettled } = options || {};

    const [data, setData] = useState<ResponseType | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [status, setStatus] = useState<MutationStatus>('idle');

    // Use refs for mutable values that shouldn't trigger re-renders
    const mountedRef = useRef(true);
    const retryCountRef = useRef(0);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setStatus('idle');
        retryCountRef.current = 0;
    }, []);

    const mutate = useCallback(
        async (...variables: Parameters<queryFn>): Promise<ResponseType> => {
            if (!queryFn) {
                throw new Error('Query function is required');
            }

            try {
                setStatus('loading');
                setError(null);

                const result = await queryFn(...[...variables]);

                // Only update state if component is still mounted
                if (mountedRef.current) {
                    setData(result);
                    setStatus('success');
                }

                // Run success callbacks
                await onSuccess?.(result);
                await onSettled?.(result, null);

                return result;
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));

                const maxRetries = typeof retry === 'number' ? retry : retry ? 3 : 0;
                // Handle retries
                if (retryCountRef.current < maxRetries) {
                    retryCountRef.current += 1;
                    const delay = typeof retryDelay === 'function' ? retryDelay(retryCountRef.current) : retryDelay ?? 1000;

                    await new Promise(resolve => setTimeout(resolve, delay));
                    return mutate(...[...variables]);
                }

                // Only update state if component is still mounted
                if (mountedRef.current) {
                    setError(error);
                    setStatus('error');
                }

                // Run error callbacks
                await onError?.(error);
                await onSettled?.(undefined, error);

                throw error;
            }
        },
        [queryFn, retry, retryDelay, onSuccess, onError, onSettled]
    );

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const mutationResult = useMemo(
        () => ({
            data,
            error,
            status,
            isIdle: status === 'idle',
            isLoading: status === 'loading',
            isSuccess: status === 'success',
            isError: status === 'error',
            mutate,
            reset,
        }),
        [data, error, status, mutate, reset]
    );

    return mutationResult;
}

export default useMutation;
