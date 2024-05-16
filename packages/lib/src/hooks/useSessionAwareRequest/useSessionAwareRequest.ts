import useAuthContext from '../../core/Auth/useAuthContext';
import { http } from '../../core/Services/requests/http';
import { HttpMethod, HttpOptions } from '../../core/Services/requests/types';
import { ErrorTypes } from '../../core/Services/requests/utils';
import { EMPTY_OBJECT, noop } from '../../utils/common';
import { useMemo, useRef } from 'preact/hooks';

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
    const cachedResolve = useRef<(value: unknown) => void>(noop);

    const httpProvider = useMemo(() => {
        let resolve: (value: unknown) => void = noop;
        const promise = new Promise(_resolve => {
            resolve = _resolve;
        });

        cachedResolve.current(promise);

        cachedResolve.current = resolve;

        const httpCall = getHttpCaller(token);

        return async <T>(request: Omit<HttpOptions, 'method'>, method: HttpMethod, data?: any): Promise<T> => {
            try {
                return await (isUpdatingToken ? promise : Promise.resolve()).then(() => httpCall<T>({ ...request }, method, data));
            } catch (e: any) {
                if (e.type === ErrorTypes.EXPIRED_TOKEN && !isUpdatingToken) {
                    await updateCore();
                    resolve(token);
                }
                throw e;
            }
        };
    }, [token, updateCore, isUpdatingToken]);

    return { httpProvider } as const;
}

export default useSessionAwareRequest;
