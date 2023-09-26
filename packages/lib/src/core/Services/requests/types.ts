export type FetchErrorLevel = 'silent' | 'info' | 'warn' | 'error' | 'fatal';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH';

export interface HttpOptions {
    path: string;
    accept?: string;
    contentType?: string;
    errorMessage?: string;
    headers?: HeadersInit;
    loadingContext?: string;
    clientKey?: string;
    method?: HttpMethod;
    errorLevel?: FetchErrorLevel;
    errorHandler?: (response: any) => any;
    params?: Record<string, string>;
}

export type ErrorLevel = 'silent' | 'info' | 'warn' | 'error' | 'fatal';

export type AdyenErrorResponse = {
    errorCode: string;
    message: string;
    errorType: string;
    status: number;
};
