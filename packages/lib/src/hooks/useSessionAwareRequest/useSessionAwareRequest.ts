import { Core } from '@src/core';
import useAuthContext from '@src/core/Auth/useAuthContext';
import { http } from '@src/core/Services/requests/http';
import { HttpMethod, HttpOptions } from '@src/core/Services/requests/types';
import { ErrorTypes } from '@src/core/Services/requests/utils';
import { useCallback, useMemo } from 'preact/hooks';

const getHttpCaller = (() => {
    let token: string;
    let caller: <T>(request: Omit<HttpOptions, 'method'>, method: HttpMethod, data?: any) => ReturnType<typeof http<T>>;
    return (sessionToken: string) => {
        if (sessionToken !== token) {
            token = sessionToken;
            caller = <T>(request: Omit<HttpOptions, 'method'>, method: HttpMethod, data?: any) =>
                http<T>({ ...request, headers: { ...request.headers, Authorization: `Bearer ${token}` }, method }, data);
        }
        return caller;
    };
})();
export function useSessionAwareRequest(core: Core) {
    const { token } = useAuthContext();

    const httpCall = useMemo(() => {
        return getHttpCaller(token);
    }, [token]);

    const httpProvider = useCallback(async <T>(request: Omit<HttpOptions, 'method'>, method: HttpMethod, data?: any) => {
        try {
            return await httpCall<T>(request, method, data);
        } catch (e: any) {
            if (e.type === ErrorTypes.EXPIRED_TOKEN) {
                try {
                    await core?.update({}, true);
                    return await httpCall<T>(request, method, data);
                } catch (e) {
                    return Promise.resolve(e);
                }
            }
            return Promise.resolve(e);
        }
    }, []);

    return { httpProvider } as const;
}

export default useSessionAwareRequest;
