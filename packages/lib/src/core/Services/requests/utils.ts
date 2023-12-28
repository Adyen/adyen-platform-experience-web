import { AdyenErrorResponse, ErrorLevel, HttpOptions } from './types';
import AdyenFPError from '@src/core/Errors/AdyenFPError';

export const getErrorType = (errorCode: number): keyof typeof AdyenFPError.errorTypes => {
    switch (errorCode) {
        case 401:
            return 'EXPIRED_TOKEN';
        default:
            return 'NETWORK_ERROR';
    }
};

export const getRequestObject = (options: HttpOptions, sessionToken?: string, data?: any): RequestInit => {
    const { headers = [], method = 'GET' } = options;

    return {
        method,
        mode: 'cors',
        cache: 'default',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': method === 'POST' ? 'application/json' : 'text/plain',
            Authorization: `Bearer ${sessionToken}`,
            ...headers,
        },
        redirect: 'follow',
        signal: options.signal,
        referrerPolicy: 'no-referrer-when-downgrade',
        ...(data && { body: JSON.stringify(data) }),
    };
};

export function handleFetchError(message: string, level: ErrorLevel, type: keyof typeof AdyenFPError.errorTypes = 'NETWORK_ERROR') {
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
            throw new AdyenFPError(type, message);
    }
}

export function isAdyenErrorResponse(data: any): data is AdyenErrorResponse {
    return data && data.errorCode && data.type && data.detail && data.status;
}

export function parseSearchParams<T extends Record<string, any>>(parameters: T) {
    const params: Record<string, string> = {};
    for (const param in parameters) {
        if (parameters[param]) params[param] = String(parameters[param]);
    }
    return new URLSearchParams(params);
}
