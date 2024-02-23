import { API_VERSION } from '@src/core/Services/sessions/constants';
import AdyenFPError from '../../Errors/AdyenFPError';
import { getErrorType, getRequestObject, handleFetchError, isAdyenErrorResponse } from './utils';
import { HttpOptions } from './types';
import { normalizeLoadingContext, normalizeUrl } from '@src/core/utils';

export function http<T>(options: HttpOptions, data?: any): Promise<T> {
    const { errorLevel = 'warn', loadingContext = '', path } = options;

    const request = getRequestObject(options, data);

    //TODO - Get rid of the "api" prefix once we have defined a loadingContext from our BFF.
    const url = new URL(`${normalizeLoadingContext(loadingContext)}api/${API_VERSION}${normalizeUrl(path)}`);

    if (options.params) {
        options.params.forEach((value, param) => {
            const decodedValue = decodeURIComponent(value);
            if (decodedValue) url.searchParams.append(param, decodedValue);
        });
    }

    return (
        fetch(url, request)
            .then(async response => {
                if (response.ok) return await response.json();

                const errorType = getErrorType(response.status);

                if (isAdyenErrorResponse(response)) {
                    // If an errorHandler has been passed use this rather than the default handleFetchError
                    return options.errorHandler ? options.errorHandler(response) : handleFetchError(response.detail, errorLevel, errorType);
                }

                const errorMessage = options.errorMessage || `Service at ${url} is not available`;
                return handleFetchError(errorMessage, errorLevel, errorType);
            })
            /**
             * Catch block handles Network error, CORS error, or exception throw by the `handleFetchError`
             * inside the `then` block
             */
            .catch(error => {
                /**
                 * If error is instance of AdyenFPError, which means that it was already
                 * handled by the `handleFetchError` on the `then` block, then we just throw it.
                 * There is no need to create it again
                 */
                if (error instanceof AdyenFPError) {
                    throw error;
                }

                const errorMessage = options.errorMessage || `Call to ${url} failed. Error= ${error}`;
                handleFetchError(errorMessage, errorLevel);
            })
    );
}

export function httpGet<T>(options: Omit<HttpOptions, 'method'>): Promise<T> {
    return http<T>({ ...options, method: 'GET' });
}

export function httpPost<T>(options: Omit<HttpOptions, 'method'>, data?: any): Promise<T> {
    return http<T>({ ...options, method: 'POST' }, data);
}
