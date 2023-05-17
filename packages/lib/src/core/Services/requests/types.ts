export type FetchErrorLevel = 'silent' | 'info' | 'warn' | 'error' | 'fatal';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH';

export interface HttpOptions {
    accept?: string;
    contentType?: string;
    errorMessage?: string;
    headers?: HeadersInit;
    loadingContext?: string;
    clientKey?: string;
    method?: HttpMethod;
    path: string;
    errorLevel?: FetchErrorLevel;
    errorHandler?: (response: any) => any;
}

export type ErrorLevel = 'silent' | 'info' | 'warn' | 'error' | 'fatal';

export type AdyenErrorResponse = {
    errorCode: string;
    message: string;
    errorType: string;
    status: number;
};
