import adyenFPError from '@src/core/Errors/AdyenFPError';
import { AdyenErrorResponse, ErrorLevel, HttpOptions } from './types';
import AdyenFPError from '@src/core/Errors/AdyenFPError';

export const getRequestObject = (options: HttpOptions, data?: any, sessionToken?: string): RequestInit => {
    const { headers = [], method = 'GET' } = options;
    const params = method === 'GET' ? data : sessionToken ? { ...data, session: sessionToken } : data;

    return {
        method,
        mode: 'cors',
        cache: 'default',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': method === 'POST' ? 'application/json' : 'text/plain',
            'X-Api-Key': options.clientKey,
            Authorization: `Bearer_${sessionToken}`,
            ...headers,
        },
        redirect: 'follow',
        signal: options.signal,
        referrerPolicy: 'no-referrer-when-downgrade',
        ...(params && { body: JSON.stringify(params) }),
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
