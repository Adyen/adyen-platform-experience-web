import { Core } from '@src/core';
import useAuthContext from '@src/core/Auth/useAuthContext';
import AdyenFPError from '@src/core/Errors/AdyenFPError';
import { http, httpGet, httpPost } from '@src/core/Services/requests/http';
import { HttpMethod, HttpOptions } from '@src/core/Services/requests/types';
import { useCallback } from 'preact/hooks';

//TODO: use this inside http code
export function useSessionRequest(core: Core) {
    const { sessionToken } = useAuthContext();

    const httpCall = useCallback(
        (request: HttpOptions, method?: HttpMethod, data?: any) =>
            <T>(sessionToken: string) => {
                switch (method) {
                    case 'GET':
                        return httpGet<T>(request, sessionToken);
                    case 'POST':
                        return httpPost<T>(request, data, sessionToken);
                    default:
                        return http<T>(request, data, sessionToken);
                }
            },
        []
    );

    const httpProvider = useCallback(
        async <T>(request: HttpOptions, method?: HttpMethod, data?: any) => {
            const requestToSend = httpCall(request, method, data);
            try {
                return await requestToSend<T>(sessionToken);
            } catch (e: any) {
                if (e.type === AdyenFPError.errorTypes.EXPIRED_TOKEN) {
                    try {
                        await core?.update({}, true);
                        return await requestToSend<T>(sessionToken);
                    } catch (e) {
                        return Promise.resolve(e);
                    }
                }
                return Promise.resolve(e);
            }
        },
        [sessionToken]
    );

    return { httpProvider } as const;
}

export default useSessionRequest;
