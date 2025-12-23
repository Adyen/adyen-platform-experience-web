import { ExternalComponentType } from '../../components/types';
import { components as SetupResource } from '../../types/api/resources/SetupResource';
import { AuthSession } from './session/AuthSession';
import type { HttpOptions } from '../Http/types';
import { EndpointData, EndpointName, EndpointsOperations, SetupEndpoint } from '../../types/api/endpoints';
import type { DeepReadonly, Promised } from '../../utils/types';

export type _Params<T extends Record<string, any>> = T['parameters'];
type _ExcludedHttpOptions = 'loadingContext' | 'path' | 'method' | 'params' | 'apiVersion';
type _SetupHttpOptions = Omit<HttpOptions, _ExcludedHttpOptions>;

type IsEmptyParameters<T> = T extends {
    query?: never;
    header?: never;
    path?: never;
    cookie?: never;
}
    ? true
    : false;
export type _HasParameter<Parameter extends keyof any, T> = Parameter extends keyof T ? true : false;
export type _RequiresParameter<T> = _HasParameter<'parameters', T>;

type WithNeverBody = {
    requestBody?: never;
};
export type _HasRequestBody<Parameter extends keyof any, T> = Parameter extends keyof T ? (T extends WithNeverBody ? false : true) : false;
export type _RequiresRequestBody<T> = _HasRequestBody<'requestBody', T>;

type ContentTypes<Operation> = Operation extends { requestBody?: { content: infer Content } } ? keyof Content : never;

type RequestBodyContent<Path extends keyof EndpointsOperations> = EndpointsOperations[Path] extends { requestBody?: { content: infer Content } }
    ? Content
    : never;

type RequestBodyTypes<Path extends keyof EndpointsOperations> =
    RequestBodyContent<Path> extends never ? undefined : RequestBodyContent<Path>[keyof RequestBodyContent<Path>];

type ParametersIfRequired<Endpoint extends EndpointName> =
    _RequiresParameter<EndpointsOperations[Endpoint]> extends true
        ? IsEmptyParameters<EndpointsOperations[Endpoint]['parameters']> extends true
            ? []
            : [_Params<EndpointsOperations[Endpoint]>]
        : [];

type RequestBodyIfRequired<Endpoint extends EndpointName> =
    _RequiresRequestBody<EndpointsOperations[Endpoint]> extends true ? [RequestBodyTypes<Endpoint>] : [];

type _EndpointHttpCallable<Endpoint extends EndpointName> = (
    options: _RequiresRequestBody<EndpointsOperations[Endpoint]> extends true
        ? _SetupHttpOptions & { contentType: ContentTypes<EndpointsOperations[Endpoint]>; body: RequestBodyIfRequired<Endpoint>[0] }
        : _SetupHttpOptions,
    ...args: [...ParametersIfRequired<Endpoint>]
) => Promise<EndpointSuccessResponse<Endpoint>>;

export type EndpointHttpCallable<Endpoint extends EndpointName> = Endpoint extends Endpoint ? _EndpointHttpCallable<Endpoint> : never;
export type EndpointHttpCallables<Endpoint extends EndpointName = EndpointName> = NonNullable<SetupContextObject['endpoints'][Endpoint]>;

export type EndpointSuccessResponse<Endpoint extends EndpointName> = Endpoint extends Endpoint ? EndpointData<Endpoint> : never;

export interface ConfigProviderProps {
    children?: any;
    session: AuthSession;
    type: ExternalComponentType;
}

export interface SessionObject {
    readonly id: string;
    readonly token: string;
}

export type SessionRequest = (signal: AbortSignal) => Promised<SessionObject>;

export interface SetupResponse extends Omit<SetupResource['schemas']['SetupResponse'], 'endpoints' | 'endpointTypesExposure'> {
    endpoints: SetupEndpoint;
}

export interface SetupContextObject {
    readonly endpoints: {
        [K in EndpointName]?: EndpointHttpCallable<K>;
    };
    readonly extraConfig: DeepReadonly<Omit<SetupResponse, 'endpoints'>>;
}
