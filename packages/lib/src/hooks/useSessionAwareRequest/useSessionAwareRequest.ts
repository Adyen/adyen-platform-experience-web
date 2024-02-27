import useAuthContext from '@src/core/Auth/useAuthContext';
import { http } from '@src/core/Services/requests/http';
import { HttpMethod, HttpOptions } from '@src/core/Services/requests/types';
import { ErrorTypes } from '@src/core/Services/requests/utils';
import { useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '@src/utils/common';

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
    const { token, updateCore } = useAuthContext();

    const httpProvider = useMemo(() => {
        const httpCall = getHttpCaller(token);
        return async <T>(request: Omit<HttpOptions, 'method'>, method: HttpMethod, data?: any): Promise<T> => {
            try {
                return await httpCall<T>(request, method, data);
            } catch (e: any) {
                if (e.type === ErrorTypes.EXPIRED_TOKEN) {
                    //TODO - Check if we can get rid of the eslint-disable below once we define how we want to handle errors
                    // eslint-disable-next-line no-useless-catch
                    try {
                        await updateCore?.(EMPTY_OBJECT, true);
                        return await httpCall<T>(request, method, data);
                    } catch (error) {
                        throw error;
                    }
                }
                throw e;
            }
        };
    }, [token, updateCore]);

    return { httpProvider } as const;
}

export default useSessionAwareRequest;
