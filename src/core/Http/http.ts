import { API_VERSION } from './constants';
import { normalizeLoadingContext, normalizeUrl } from '../utils';
import { getErrorType, getRequestObject, handleFetchError, isAdyenErrorResponse } from './utils';
import { HttpOptions } from './types';
import { onErrorHandler } from '../types';

const errorHandlerHelper = (errorHandler?: onErrorHandler, error?: any) => {
    // Always throws
    try {
        errorHandler?.(error);
    } catch {
        throw error;
    }
};

export async function http<T>(options: HttpOptions, data?: any): Promise<T> {
    const { errorLevel, loadingContext = '', path } = options;
    const request = getRequestObject(options, data);
    const url = new URL(`${normalizeLoadingContext(loadingContext)}${API_VERSION}${normalizeUrl(path)}`);

    if (options.params) {
        options.params.forEach((value, param) => {
            const decodedValue = decodeURIComponent(value);
            if (decodedValue) url.searchParams.append(param, decodedValue);
        });
    }

    return (async () => {
        // Boolean flag:
        // Indicates whether a resulting exception will be propagated to the caller (unhandled).
        // If set to `true`, the resulting exception will be propagated (unhandled).
        let errorPassThrough = false;

        const error = { level: errorLevel } as Parameters<typeof handleFetchError>[0];

        try {
            // The `fetch()` could fail and thus throw an exception due to several causes,
            // including but not limited to: fetch signal aborted, CORS errors, network errors
            // (e.g device is offline or poor connection), etc.
            const res = await fetch(url, request); // (!)

            if (res.ok) {
                try {
                    const contentType = res.headers.get('Content-Type')?.split(';', 1)[0];

                    //TODO: when backend is ready double check this logic
                    switch (contentType) {
                        case 'application/json':
                            // This could throw an exception in one of these two cases:
                            //   (1) if response has no body content
                            //   (2) if response body content is not valid JSON
                            return await res.json(); // (!!)
                        default:
                            return await res.blob();
                    }
                } catch (ex) {
                    // If it does throw an exception, the exception will be propagated to the caller (unhandled).
                    errorPassThrough = true;

                    // Consider transforming the exception before propagating it to the caller,
                    // thus making it easier for the caller to differentiate it from other errors.
                    throw ex;
                }
            }

            error.type = getErrorType(res.status);

            // This could throw an exception in one of these two cases:
            //   (1) if response has no body content
            //   (2) if response body content is not valid JSON
            //
            // If it does throw an exception, the exception will be handled,
            // since we have the `errorCode` (HTTP status code).
            const response = await res.json(); // (!)

            error.message = options.errorMessage || `Service at ${url} not available`;
            error.errorCode = String(response.status);
            error.requestId = response?.requestId;

            if (isAdyenErrorResponse(response)) {
                error.message = response.detail;
                error.errorCode = response.errorCode;
            }
            errorHandlerHelper(options.errorHandler, error);
        } catch (ex) {
            if (errorPassThrough) {
                // Since the `errorPassThrough` flag is set to `true`,
                // The exception will be propagated to the caller (unhandled)
                errorHandlerHelper(options.errorHandler, ex);
                throw ex;
            }

            errorHandlerHelper(options.errorHandler, ex);

            error.message = options.errorMessage || `Call to ${url} failed. Error: ${ex}`;
        }

        // Handle the resulting error
        // This could throw an exception, depending on the `errorLevel`
        // If it does throw an exception, the exception will be propagated to the caller (unhandled).
        handleFetchError(error); // (!!)
    })();
}

export function httpGet<T>(options: Omit<HttpOptions, 'method'>): Promise<T> {
    return http<T>({ ...options, method: 'GET' });
}

export function httpPost<T>(options: Omit<HttpOptions, 'method'>, data?: any): Promise<T> {
    return http<T>({ ...options, method: 'POST' }, data);
}
