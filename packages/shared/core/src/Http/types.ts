export type ErrorLevel = 'silent' | 'info' | 'warn' | 'error' | 'fatal';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH';

export interface HttpOptions {
    path: string;
    accept?: string;
    contentType?: string;
    errorMessage?: string;
    headers?: HeadersInit;
    keepalive?: boolean;
    loadingContext?: string;
    clientKey?: string;
    method: HttpMethod;
    errorLevel?: ErrorLevel;
    errorHandler?: (response: any) => any;
    params?: URLSearchParams;
    signal?: AbortSignal;
    origin?: string;
    body?: any;
    apiVersion?: number;
    versionless?: boolean;
    skipContentType?: boolean;
}

export type AdyenErrorResponse = {
    errorCode: string;
    detail: string;
    type: string;
    invalidFields?: any[];
    status: number;
    requestId: string;
};
