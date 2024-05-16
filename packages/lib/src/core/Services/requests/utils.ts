import { AdyenErrorResponse, ErrorLevel, HttpOptions } from './types';
import AdyenPlatformExperienceError from '../../Errors/AdyenPlatformExperienceError';

export const enum ErrorTypes {
    /** Network error. */
    NETWORK_ERROR = 'NETWORK_ERROR',

    /** Shopper canceled the current transaction. */
    CANCEL = 'CANCEL',

    /** Implementation error. The method or parameter are incorrect or are not supported. */
    IMPLEMENTATION_ERROR = 'IMPLEMENTATION_ERROR',

    /** Generic error. */
    ERROR = 'ERROR',

    /** Token expired */
    EXPIRED_TOKEN = 'EXPIRED_TOKEN',
}

export const getErrorType = (errorCode: number): ErrorTypes => {
    switch (errorCode) {
        case 401:
            return ErrorTypes.EXPIRED_TOKEN;
        default:
            return ErrorTypes.NETWORK_ERROR;
    }
};

export const getRequestObject = (options: HttpOptions, data?: any): RequestInit => {
    const { headers = [], method = 'GET' } = options;

    return {
        method,
        mode: 'cors',
        cache: 'default',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            ...headers,
        },
        redirect: 'follow',
        signal: options.signal,
        referrerPolicy: 'no-referrer-when-downgrade',
        ...(method === 'POST' && data && { body: JSON.stringify(data) }),
    };
};

export function handleFetchError({
    message,
    level,
    errorCode,
    type = ErrorTypes.NETWORK_ERROR,
    requestId,
}: {
    message: string;
    level: ErrorLevel | undefined;
    errorCode?: string;
    type?: ErrorTypes;
    requestId?: string;
}) {
    switch (level) {
        case 'silent': {
            break;
        }
        case 'info':
        case 'warn':
            console[level](message);
            break;
        case 'error':
        default:
            throw new AdyenPlatformExperienceError(type, requestId, message, errorCode);
    }
}

export function isAdyenErrorResponse(data: any): data is AdyenErrorResponse {
    return data && data.errorCode && data.type && (data.detail || data.invalidFields) && data.status;
}

export function parseSearchParams<T extends Record<string, any>>(parameters: T) {
    const params = new URLSearchParams();

    for (const param of Object.keys(parameters)) {
        const value = parameters[param];
        if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
                value.forEach(item => params.append(param, item));
            } else {
                // For non-array values, just set the key and value normally
                params.set(param, String(value));
            }
        }
    }

    return params;
}
