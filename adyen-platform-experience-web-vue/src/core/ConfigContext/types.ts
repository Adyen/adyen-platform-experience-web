export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH';

export interface SetupEndpointResponse {
    method: string;
    url: string;
    versions: number[];
}

export type SetupEndpoint = Record<string, SetupEndpointResponse>;

export interface SetupResponse {
    endpoints: SetupEndpoint;
    [key: string]: unknown;
}

export type EndpointCallable = (request?: EndpointRequestOptions, params?: EndpointParams) => Promise<any>;

export interface EndpointRequestOptions {
    body?: any;
    contentType?: string;
    keepalive?: boolean;
    signal?: AbortSignal;
}

export interface EndpointParams {
    path?: Record<string, string>;
    query?: Record<string, string | string[]>;
}

export interface ConfigContextValue {
    readonly endpoints: Record<string, EndpointCallable | undefined>;
    readonly extraConfig: Record<string, unknown>;
    readonly hasError: boolean;
    readonly refreshing: boolean;
    refresh: () => Promise<void>;
}

export interface ConfigProviderProps {
    session: { id: string; token: string } | null;
    loadingContext: string;
    onError?: (error: Error) => void;
}
