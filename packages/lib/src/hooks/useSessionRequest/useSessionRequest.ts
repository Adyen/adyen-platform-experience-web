import { Core } from '@src/core';
import useAuthContext from '@src/core/Auth/useAuthContext';
import AdyenFPError from '@src/core/Errors/AdyenFPError';
import { http, httpGet, httpPost } from '@src/core/Services/requests/http';
import { HttpMethod, HttpOptions } from '@src/core/Services/requests/types';
import { useCallback } from 'preact/hooks';

export function useSessionRequest(core: Core) {
    const { token } = useAuthContext();

    const httpCall = useCallback(
        (request: Omit<HttpOptions, 'method'>, method: HttpMethod, data?: any) =>
            <T>(sessionToken: string) =>
                http<T>({ ...request, headers: { ...request.headers, Authorization: `Bearer ${sessionToken}` }, method }, data),
        []
    );

    const httpProvider = useCallback(
        async <T>(request: Omit<HttpOptions, 'method'>, method: HttpMethod, data?: any) => {
            const requestToSend = httpCall(request, method, data);
            try {
                return await requestToSend<T>(token);
            } catch (e: any) {
                if (e.type === AdyenFPError.errorTypes.EXPIRED_TOKEN) {
                    try {
                        await core?.update({}, true);
                        return await requestToSend<T>(token);
                    } catch (e) {
                        return Promise.resolve(e);
                    }
                }
                return Promise.resolve(e);
            }
        },
        [token]
    );

    return { httpProvider } as const;
}

export default useSessionRequest;
