import { useState, useCallback, useRef, useMemo, useEffect } from 'preact/hooks';
import { ALREADY_RESOLVED_PROMISE, EMPTY_OBJECT, isFunction, isNumber, tryResolve } from '../../utils';
import { AdyenErrorResponse } from '../../core/Http/types';

type MutationOptions<ResponseType> = {
    onSuccess?: (data: ResponseType) => void | Promise<void>;
    onError?: (error: Error | AdyenErrorResponse) => void | Promise<void>;
    onSettled?: (data: ResponseType | undefined, error: Error | AdyenErrorResponse | null) => void | Promise<void>;
    retry?: number | boolean;
    retryDelay?: number | ((retryAttempt: number) => number);
    shouldRetry?: (error: AdyenErrorResponse) => boolean;
};
type MutationStatus = 'idle' | 'loading' | 'success' | 'error';

const catchCallback = (reason: unknown) => {
    setTimeout(() => {
        throw reason;
    }, 0);
};

function useMutation<queryFn extends (...args: any[]) => any, ResponseType extends Awaited<ReturnType<queryFn>>>({
    queryFn,
    options,
}: {
    queryFn: queryFn | undefined;
    options?: MutationOptions<ResponseType>;
}) {
    const { retry = false, retryDelay = 1000, onSuccess, onError, onSettled, shouldRetry } = options || (EMPTY_OBJECT as NonNullable<typeof options>);

    const [data, setData] = useState<ResponseType | null>(null);
    const [error, setError] = useState<Error | AdyenErrorResponse | null>(null);
    const [status, setStatus] = useState<MutationStatus>('idle');

    // Use refs for mutable values that shouldn't trigger re-renders
    const mountedRef = useRef(true);
    const retryCountRef = useRef(1);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setStatus('idle');
        retryCountRef.current = 1;
    }, []);

    const mutate = useCallback(
        async (...variables: Parameters<queryFn>): Promise<ResponseType> => {
            try {
                setStatus('loading');
                setError(null);

                const result = await queryFn?.(...variables);

                // Only update state if component is still mounted
                if (mountedRef.current) {
                    setData(result);
                    setStatus('success');
                }

                ALREADY_RESOLVED_PROMISE.then(() => {
                    onSuccess && tryResolve(onSuccess, result).catch(catchCallback);
                    onSettled && tryResolve(onSettled, result, null).catch(catchCallback);
                });

                return result;
            } catch (error: any) {
                let maxRetries = 0;
                if (isNumber(retry) && (shouldRetry ? shouldRetry(error) : true)) {
                    maxRetries = Math.max(0, Math.floor(retry));
                } else {
                    maxRetries = 0;
                }

                if (maxRetries === retry) retryCountRef.current = 1;

                // Handle retries
                if (retryCountRef.current++ < maxRetries) {
                    const delay = isFunction(retryDelay) ? retryDelay(retryCountRef.current) : retryDelay ?? 1000;

                    await new Promise(resolve => setTimeout(resolve, delay));
                    return mutate(...variables);
                }

                // Only update state if component is still mounted
                if (mountedRef.current) {
                    setError(error);
                    setStatus('error');
                }

                // Run error callbacks
                ALREADY_RESOLVED_PROMISE.then(() => {
                    onError && tryResolve(onError, error).catch(catchCallback);
                    onSettled && tryResolve(onSettled, undefined, error).catch(catchCallback);
                });

                throw error;
            }
        },
        [queryFn, onSuccess, onSettled, retry, shouldRetry, retryDelay, onError]
    );

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    return useMemo(
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
}

export default useMutation;
