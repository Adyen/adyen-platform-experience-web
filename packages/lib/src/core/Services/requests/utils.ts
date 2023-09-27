import { AdyenErrorResponse, ErrorLevel, HttpOptions } from './types';
import AdyenFPError from '@src/core/Errors/AdyenFPError';

export const getRequestObject = (options: HttpOptions, data?: any): RequestInit => {
    const { headers = [], method = 'GET' } = options;

    return {
        method,
        mode: 'cors',
        cache: 'default',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': method === 'POST' ? 'application/json' : 'text/plain',
            'X-Api-Key': options.clientKey,
            ...headers,
        },
        redirect: 'follow',
        signal: options.signal,
        referrerPolicy: 'no-referrer-when-downgrade',
        ...(data && { body: JSON.stringify(data) }),
    };
};

export function handleFetchError(message: string, level: ErrorLevel) {
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
            throw new AdyenFPError('NETWORK_ERROR', message);
    }
}

export function isAdyenErrorResponse(data: any): data is AdyenErrorResponse {
    return data && data.errorCode && data.errorType && data.message && data.status;
}
