import type { HttpOptions } from '../../Services/requests/types';
import type { EndpointName, EndpointsOperations, SetupEndpoint } from '../../../types/api/endpoints';

type _Params<T extends Record<string, any>> = T['parameters'];
type _ExcludedHttpOptions = 'loadingContext' | 'path' | 'method' | 'params';
type _SetupHttpOptions = Omit<HttpOptions, _ExcludedHttpOptions>;

type _HasParameter<Parameter extends keyof any, T> = Parameter extends keyof T ? true : false;
type _RequiresParameter<T> = _HasParameter<'parameters', T>;

export type EndpointHttpCallable = <Endpoint extends EndpointName, Operation extends EndpointsOperations[Endpoint]>(
    ...args: EndpointHttpParameters<Endpoint, Operation>
) => Promise<EndpointSuccessResponse<Operation>>;

export type EndpointHttpCallableParametric<Endpoint extends EndpointName, Operation extends EndpointsOperations[Endpoint]> = (
    ...args: EndpointHttpParameters<Endpoint, Operation>
) => Promise<EndpointSuccessResponse<Operation>>;

export type EndpointHttpParameters<
    Endpoint extends EndpointName,
    Operation extends EndpointsOperations[Endpoint]
> = _RequiresParameter<Operation> extends true
    ? [options: _SetupHttpOptions, params: _RequiresParameter<Operation> extends true ? _Params<Operation> : never]
    : [options: _SetupHttpOptions];

export type EndpointSuccessResponse<Operation extends Record<string, any>> = Operation['responses'][200]['content']['application/json'];

export interface SessionObject {
    readonly id: string;
    readonly token: string;
}

export interface SetupResponse {
    readonly endpoints: SetupEndpoint;
}

export interface SetupContext extends Omit<SetupResponse, 'endpoints'> {
    readonly endpoints: {
        [K in EndpointName]?: EndpointHttpCallableParametric<K, EndpointsOperations[K]>;
    };
}
