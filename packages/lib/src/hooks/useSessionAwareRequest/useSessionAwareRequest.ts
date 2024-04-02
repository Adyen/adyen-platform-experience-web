import useAuthContext from '@src/core/Auth/useAuthContext';
import { http } from '@src/core/Services/requests/http';
import { HttpMethod, HttpOptions } from '@src/core/Services/requests/types';
import { ErrorTypes } from '@src/core/Services/requests/utils';
import { EMPTY_OBJECT } from '@src/utils/common';
import { useMemo } from 'preact/hooks';

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

function useSessionAwareRequest() {
    const { token, updateCore, isUpdatingToken } = useAuthContext();

    const httpProvider = useMemo(() => {
        const httpCall = getHttpCaller(token);
        return async <T>(request: Omit<HttpOptions, 'method'>, method: HttpMethod, data?: any): Promise<T> => {
            try {
                if (!isUpdatingToken) {
                    return await httpCall<T>(request, method, data);
                } else {
                    throw new Error();
                }
            } catch (e: any) {
                if (e.type === ErrorTypes.EXPIRED_TOKEN && !isUpdatingToken) {
                    await updateCore?.(EMPTY_OBJECT, true);
                }
                throw e;
            }
        };
    }, [token, updateCore, isUpdatingToken]);

    return { httpProvider } as const;
}

export default useSessionAwareRequest;
