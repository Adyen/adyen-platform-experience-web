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
    method: HttpMethod;
    errorLevel?: FetchErrorLevel;
    errorHandler?: (response: any) => any;
    params?: URLSearchParams;
    signal?: AbortSignal;
}

export type ErrorLevel = 'silent' | 'info' | 'warn' | 'error' | 'fatal';

export type AdyenErrorResponse = {
    errorCode: string;
    detail: string;
    type: string;
    status: number;
};

export type FunctionOrStringLiteral = `/${string}` | ((...params: any) => `/${string}`);
