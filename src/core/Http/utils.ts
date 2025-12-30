import { isNullish } from '../../utils';
import { AdyenErrorResponse, ErrorLevel, HttpOptions } from './types';
import AdyenPlatformExperienceError, { InvalidField } from '../Errors/AdyenPlatformExperienceError';

const FILENAME_EXTRACTION_REGEX = /^[^]*?filename[^;\n]*=\s*(?:UTF-\d['"]*)?(?:(['"])([^]*?)\1|([^;\n]*))?[^]*?$/;

export const enum ErrorTypes {
    /** HTTP error. */
    HTTP_ERROR = 'HTTP_ERROR',

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
            return ErrorTypes.HTTP_ERROR;
    }
};

export const getResponseContentType = (response: Response): string | undefined => response.headers.get('Content-Type')?.split(';', 1)[0];

export const getResponseDownloadFilename = (response: Response): string | undefined => {
    const disposition = response.headers.get('Content-Disposition') ?? '';
    const filename = disposition.replace(FILENAME_EXTRACTION_REGEX, '$2$3');
    return decodeURIComponent(filename);
};

export const getRequestBodyForContentType = (body: any, contentType?: string) => {
    switch (contentType) {
        case 'application/json':
            return JSON.stringify(body);
        case 'multipart/form-data':
            return body instanceof FormData ? body : new FormData();
        default:
            return String(body);
    }
};

export const getRequestObject = (options: HttpOptions): RequestInit => {
    const { headers = [], method = 'GET' } = options;
    const SDKVersion = !options.versionless && process.env.VITE_VERSION;
    const contentType = options.skipContentType ? undefined : (options.contentType?.toLowerCase() ?? 'application/json');

    return {
        method,
        mode: 'cors',
        cache: 'default',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json, text/plain, */*',
            ...headers,

            // Skip Content-Type header for multipart/form-data requests
            // The browser will automatically set the content-type for such requests
            ...(contentType && contentType !== 'multipart/form-data' && { 'Content-Type': contentType }),

            ...(SDKVersion && { 'SDK-Version': SDKVersion }),
        },
        redirect: 'follow',
        signal: options.signal,
        referrerPolicy: 'no-referrer-when-downgrade',
        ...(method === 'POST' && options.body && { body: getRequestBodyForContentType(options.body, contentType) }),
    };
};

export function handleFetchError({
    message,
    level,
    errorCode,
    type = ErrorTypes.NETWORK_ERROR,
    requestId,
    invalidFields,
}: {
    message: string;
    level: ErrorLevel | undefined;
    errorCode?: string;
    type?: ErrorTypes;
    requestId?: string;
    status?: number;
    invalidFields?: InvalidField[];
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
            throw new AdyenPlatformExperienceError(type, requestId, message, errorCode, invalidFields);
    }
}

export function isAdyenErrorResponse(data: any): data is AdyenErrorResponse {
    return data && data.errorCode && data.type && (data.detail || data.invalidFields) && data.status;
}

export function parseSearchParams<T extends Record<string, any>>(parameters: T) {
    const params = new URLSearchParams();

    for (const param of Object.keys(parameters)) {
        const value = parameters[param];
        if (!isNullish(value)) {
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
