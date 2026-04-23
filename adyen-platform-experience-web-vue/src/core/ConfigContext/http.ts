import { HttpMethod } from '../Http/types';
import { API_VERSION } from './constants';
import { SETUP_ENDPOINT_PATH } from './session/constants';
import type { SetupResponse, EndpointParams } from './types';

const normalizeLoadingContext = (loadingContext: string) => loadingContext?.replace?.(/([^/])$/, '$1/');
const normalizeUrl = (url: string) => url?.replace(/^([^/])/, '/$1');

function buildUrl(loadingContext: string, path: string, params?: EndpointParams, apiVersion: string = API_VERSION): URL {
    const baseUrl = normalizeLoadingContext(loadingContext);
    const url = new URL(`${baseUrl}${apiVersion}${normalizeUrl(path)}`);

    if (params?.query) {
        for (const [key, value] of Object.entries(params.query)) {
            if (Array.isArray(value)) {
                value.forEach(v => url.searchParams.append(key, v));
            } else if (value != null) {
                url.searchParams.set(key, value);
            }
        }
    }

    return url;
}

function resolvePath(path: string, pathParams?: Record<string, string>): string {
    if (!pathParams) return path;
    let resolved = path;
    for (const [key, value] of Object.entries(pathParams)) {
        resolved = resolved.replace(`{${key}}`, value);
    }
    return resolved;
}

export async function authenticatedHttp<T>(options: {
    method: HttpMethod;
    loadingContext: string;
    path: string;
    token: string;
    body?: any;
    contentType?: string;
    keepalive?: boolean;
    signal?: AbortSignal;
    params?: EndpointParams;
    apiVersion?: string;
}): Promise<T> {
    const { method, loadingContext, path, token, body, contentType, keepalive, signal, params, apiVersion } = options;

    const resolvedPath = resolvePath(path, params?.path);
    const url = buildUrl(loadingContext, resolvedPath, params, apiVersion);

    const headers: Record<string, string> = {
        Accept: 'application/json, text/plain, */*',
        Authorization: `Bearer ${token}`,
    };

    const effectiveContentType = contentType?.toLowerCase() ?? 'application/json';
    if (effectiveContentType !== 'multipart/form-data') {
        headers['Content-Type'] = effectiveContentType;
    }

    if (process.env.VITE_VERSION) {
        headers['SDK-Version'] = process.env.VITE_VERSION;
    }

    const requestInit: RequestInit = {
        method,
        mode: 'cors',
        cache: 'default',
        credentials: 'same-origin',
        headers,
        redirect: 'follow',
        referrerPolicy: 'no-referrer-when-downgrade',
        keepalive,
        signal,
    };

    if (method === 'POST' && body) {
        requestInit.body = effectiveContentType === 'application/json' ? JSON.stringify(body) : String(body);
    }

    const response = await fetch(url, requestInit);

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const error = new Error(errorBody?.detail || `Request to ${url} failed with status ${response.status}`);
        (error as any).status = response.status;
        (error as any).errorCode = errorBody?.errorCode;
        throw error;
    }

    if (response.status === 204) {
        return null as T;
    }

    const responseContentType = response.headers.get('Content-Type')?.split(';', 1)[0];

    if (responseContentType === 'application/json') {
        const text = await response.clone().text();
        if (!text) return null as T;
        return await response.json();
    }

    const blob = await response.blob();
    const disposition = response.headers.get('Content-Disposition') ?? '';
    const filename = disposition.replace(/^[^]*?filename[^;\n]*=\s*(?:UTF-\d['"]*)?(?:(['"])([^]*?)\1|([^;\n]*))?[^]*?$/, '$2$3');
    return { blob, filename: decodeURIComponent(filename) } as T;
}

export async function fetchSetup(loadingContext: string, token: string, signal?: AbortSignal): Promise<SetupResponse> {
    return authenticatedHttp<SetupResponse>({
        method: 'POST',
        loadingContext,
        path: SETUP_ENDPOINT_PATH,
        token,
        signal,
    });
}
