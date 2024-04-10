import { API_VERSION } from '@src/core/Services/sessions/constants';
import { getErrorType, getRequestObject, handleFetchError, isAdyenErrorResponse } from './utils';
import { HttpOptions } from './types';
import { normalizeLoadingContext, normalizeUrl } from '@src/core/utils';

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
        const error = { level: errorLevel } as Parameters<typeof handleFetchError>[0];
        let errorPassThrough = false;

        try {
            /**
             * There can be network error, abort, cors errors etc.
             */
            const res = await fetch(url, request); // (1)

            if (res.ok) {
                /**
                 *  Response has no content body or body is not valid json this will fail
                 *  We don't want to interfere the error so this will be propagated to the user
                 *  We might need relabel the error like malformed content so that, user can distinguish from other errors
                 */
                errorPassThrough = true;
                return await res.json(); // (!)
            }

            error.type = getErrorType(res.status);
            /**
             *  Response has no content body or body is not valid json this will fail
             *  We will handle this error since we have the errorCode
             */
            const response = await res.json(); // (2)

            error.message = options.errorMessage || `Service at ${url} is not available`;
            error.errorCode = String(response.status);
            error.requestId = response?.requestId;

            if (isAdyenErrorResponse(response)) {
                if (options.errorHandler) {
                    /**
                     *  This will throw if the logic of consumer for the errorHanler results an error
                     *  We don't want to interfere the error so this will be propagated to the user
                     */
                    errorPassThrough = true;
                    options.errorHandler(response); // (!)
                }

                error.message = response.detail;
                error.errorCode = response.errorCode;
            }
        } catch (ex) {
            if (errorPassThrough) {
                /**
                 * This is the point that we are throwing an error for the places that we labeled as errorPassThrough
                 */
                throw ex;
            }
            error.message = options.errorMessage || `Call to ${url} failed. Error= ${ex}`;
        }

        /**
         * This will throw an error if the level is error
         * @see {handleFetchError}
         */
        handleFetchError(error);
    })();
}

export function httpGet<T>(options: Omit<HttpOptions, 'method'>): Promise<T> {
    return http<T>({ ...options, method: 'GET' });
}

export function httpPost<T>(options: Omit<HttpOptions, 'method'>, data?: any): Promise<T> {
    return http<T>({ ...options, method: 'POST' }, data);
}
