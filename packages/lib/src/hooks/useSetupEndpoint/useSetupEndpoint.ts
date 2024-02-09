import useAuthContext from '@src/core/Auth/useAuthContext';
import useSessionAwareRequest from '@src/hooks/useSessionAwareRequest/useSessionAwareRequest';
import { EndpointName, EndpointsOperations } from '@src/types/models/openapi/endpoints';
import useCoreContext from '@src/core/Context/useCoreContext';
import { parseSearchParams } from '@src/core/Services/requests/utils';
import { useCallback } from 'preact/hooks';
import { HttpMethod, HttpOptions } from '@src/core/Services/requests/types';
import { EMPTY_OBJECT } from '@src/utils/common';

type Params<T extends Record<any, any>> = T['parameters'];

type ExcludedHttpOptions = 'loadingContext' | 'path' | 'method' | 'params';

export type SetupHttpOptions = Omit<HttpOptions, ExcludedHttpOptions>;

type FunctionParams<Endpoint extends EndpointName, Operation extends EndpointsOperations[Endpoint]> = RequiresParameter<Operation> extends true
    ? [options: SetupHttpOptions, params: RequiresParameter<Operation> extends true ? Params<Operation> : never]
    : [options: SetupHttpOptions];

type HasParameter<Parameter extends keyof any, T> = Parameter extends keyof T ? true : false;

type RequiresParameter<T> = HasParameter<'parameters', T>;

export type SuccessResponse<Operation extends Record<any, any>> = Operation['responses'][200]['content']['application/json'];

export const useSetupEndpoint = <Endpoint extends EndpointName, Operation extends EndpointsOperations[Endpoint]>(endpoint: Endpoint) => {
    const { endpoints } = useAuthContext();
    const { loadingContext } = useCoreContext();

    const { httpProvider } = useSessionAwareRequest();

    const httpRequest = useCallback(
        async (...args: FunctionParams<Endpoint, Operation>): Promise<SuccessResponse<Operation>> => {
            const requestOptions = args[0];
            const params = args[1] || EMPTY_OBJECT;

            const operation = endpoints[endpoint];

            const pathParam = (params as any).path;

            let path = operation.url!;
            console.log('<<<<<<<<<<<<<path>>>>>>>>>>>>', path);

            if (pathParam) {
                const pathParamKey = Object.keys(pathParam)[0]!;
                path = path.replace(`{${pathParamKey}}`, pathParam[pathParamKey]);
            }

            return httpProvider<SuccessResponse<Operation>>(
                { loadingContext, path, ...requestOptions, ...parseSearchParams(params) },
                (operation.method as HttpMethod) ?? 'GET'
            );
        },
        [endpoint, endpoints, httpProvider, loadingContext]
    );

    return httpRequest;
};
