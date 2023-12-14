import useAuthContext from '@src/core/Auth/useAuthContext';
import AdyenFPError from '@src/core/Errors/AdyenFPError';
import { httpGet } from '@src/core/Services/requests/http';
import { HttpOptions } from '@src/core/Services/requests/types';
import { useCallback } from 'preact/hooks';

export function useSessionRequest(core: any): any {
    const { sessionToken, clientKey } = useAuthContext();

    const httpCall = useCallback(
        (request: HttpOptions) => (sessionToken: string) => {
            if (request) {
                return httpGet(request, sessionToken);
            }
        },
        []
    );

    const httpProvider = useCallback(
        async (request: HttpOptions) => {
            const requestToSend = httpCall(request);

            try {
                const data = await requestToSend(sessionToken);
                // return data;
                throw new AdyenFPError('EXPIRED_TOKEN', 'test');
            } catch (e: any) {
                console.log('on error ', e.type);
                // TODO: make this e.type
                // if(e.message === 'EXPIRED_TOKEN') {
                // TODO: add new sessionToken to context
                try {
                    //TODO: update core's session and it should automatically update all the components
                    core?.core.update({}, true);
                    return await requestToSend(sessionToken);
                } catch (e) {
                    console.log('new error ', e);
                    // return e;
                }
                // }
            }
        },
        [sessionToken, clientKey]
    );

    return { httpProvider };
}

export default useSessionRequest;
