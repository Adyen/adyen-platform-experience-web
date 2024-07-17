import { AuthSession } from './session/AuthSession';
import type { HttpOptions } from '../Http/types';
import type { EndpointName, EndpointsOperations, SetupEndpoint } from '../../types/api/endpoints';
import type { Promised } from '../../utils/types';

type _Params<T extends Record<string, any>> = T['parameters'];
type _ExcludedHttpOptions = 'loadingContext' | 'path' | 'method' | 'params';
type _SetupHttpOptions = Omit<HttpOptions, _ExcludedHttpOptions>;

type _HasParameter<Parameter extends keyof any, T> = Parameter extends keyof T ? true : false;
type _RequiresParameter<T> = _HasParameter<'parameters', T>;

type _EndpointHttpCallable<Endpoint extends EndpointName> = _RequiresParameter<EndpointsOperations[Endpoint]> extends true
    ? (options: _SetupHttpOptions, params: _Params<EndpointsOperations[Endpoint]>) => Promise<EndpointSuccessResponse<Endpoint>>
    : (options: _SetupHttpOptions) => Promise<EndpointSuccessResponse<Endpoint>>;

export type EndpointHttpCallable<Endpoint extends EndpointName> = Endpoint extends Endpoint ? _EndpointHttpCallable<Endpoint> : never;
export type EndpointHttpCallables<Endpoint extends EndpointName = EndpointName> = NonNullable<SetupContext['endpoints'][Endpoint]>;

export type EndpointSuccessResponse<Endpoint extends EndpointName> = Endpoint extends Endpoint
    ? EndpointsOperations[Endpoint]['responses'][200]['content']['application/json']
    : never;

export interface AuthProviderProps {
    children?: any;
    session: AuthSession;
}

export interface SessionObject {
    readonly id: string;
    readonly token: string;
}

export type SessionRequest = () => Promised<SessionObject>;

export interface SetupResponse {
    readonly endpoints: SetupEndpoint;
}

export interface SetupContext extends Omit<SetupResponse, 'endpoints'> {
    readonly endpoints: {
        [K in EndpointName]?: EndpointHttpCallable<K>;
    };
}
