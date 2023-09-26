import AdyenFPError from '../../Errors/AdyenFPError';
import { getRequestObject, handleFetchError, isAdyenErrorResponse } from './utils';
import { HttpOptions } from './types';

export function http<T>(options: HttpOptions, data?: any): Promise<T> {
    const { errorLevel = 'warn', loadingContext = '', path } = options;
    // const url = `${loadingContext}${path}`;

    const request = getRequestObject(options, data);

    //TODO - Get rid of the "api" prefix once we have defined a loadingContext from our BFF.
    const url = new URL(`${loadingContext}api/${path}`);

    if (options.params) {
        const searchParams = new URLSearchParams(Object.entries(options.params).filter(([param, value]) => value && param !== 'signal'));

        searchParams.forEach((value, param) => {
            const decodedValue = decodeURIComponent(value);
            if (decodedValue) url.searchParams.set(param, decodedValue);
        });
    }
    return (
        fetch(url, request)
            .then(async response => {
                const data = await response.json();

                if (response.ok) return data;

                if (isAdyenErrorResponse(data)) {
                    // If an errorHandler has been passed use this rather than the default handleFetchError
                    return options.errorHandler ? options.errorHandler(data) : handleFetchError(data.message, errorLevel);
                }

                const errorMessage = options.errorMessage || `Service at ${url} is not available`;
                return handleFetchError(errorMessage, errorLevel);
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

export function httpGet<T>(options: HttpOptions, data?: any): Promise<T> {
    return http<T>({ ...options, method: 'GET' }, data);
}

export function httpPost<T>(options: HttpOptions, data?: any): Promise<T> {
    return http<T>({ ...options, method: 'POST' }, data);
}
