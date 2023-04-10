import { httpPost } from '../http';
import Session from '../../FPSession';
import { SessionSetupResponse } from '../../../types';
import { API_VERSION } from './constants';

/**
 */
function setupSession(session: Session, options): Promise<SessionSetupResponse> {
    const path = `${API_VERSION}/sessions/${session.id}/setup?clientKey=${session.clientKey}`;
    const data = {
        sessionData: session.data,
    };

    return httpPost<SessionSetupResponse>(
        {
            loadingContext: session.loadingContext,
            path,
            errorLevel: 'fatal',
            errorMessage: 'ERROR: Invalid ClientKey',
            ...(options ?? {}),
        },
        data
    );
}

export default setupSession;
