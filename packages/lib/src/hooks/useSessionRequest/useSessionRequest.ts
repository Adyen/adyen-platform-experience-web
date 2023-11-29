import { Core } from '@src/core';
import { SESSION_ACTIONS } from '@src/core/Auth/types';
import useAuthContext from '@src/core/Auth/useAuthContext';
import AdyenFPError from '@src/core/Errors/AdyenFPError';
import { httpGet, httpPost } from '@src/core/Services/requests/http';
import { HttpOptions } from '@src/core/Services/requests/types';
import { useCallback, useEffect } from 'preact/hooks';

export function useSessionRequest(core: any): any {
    const { sessionToken, clientKey, onSessionCreate, modifyAuthContext } = useAuthContext();

    useEffect(() => {
        console.log('session token ', sessionToken);
    }, [sessionToken]);

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
                    let { token, id, clientKey } = await onSessionCreate();
                    let sessionToken = 'new-token';
                    clientKey = 'new-client-key';
                    modifyAuthContext({ type: SESSION_ACTIONS.SET_SESSION_TOKEN, payload: sessionToken });
                    modifyAuthContext({ type: SESSION_ACTIONS.SET_CLIENT_KEY, payload: clientKey });
                    //TODO: update core's session and it should automatically update the component
                    // core?.update({sessionToken, clientKey})
                    return await requestToSend(sessionToken);

                    //TODO: Add setupcall
                    //TODO: store new endpoints
                } catch (e) {
                    console.log('new error ', e);
                }
                // }
            }
        },
        [sessionToken, onSessionCreate]
    );

    return { httpProvider };
}

export default useSessionRequest;
