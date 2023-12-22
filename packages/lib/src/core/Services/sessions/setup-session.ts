import { httpPost } from '../requests/http';
import Session from '../../FPSession';
import { SessionSetupResponse } from '../../FPSession/types';
import { API_VERSION } from './constants';

function setupSession(session: Session, options?: Record<string, any>): Promise<SessionSetupResponse> {
    const path = `${API_VERSION}/setup`;
    const data = {
        sessionData: session.data,
    };

    return httpPost<SessionSetupResponse>(
        {
            path,
            errorLevel: 'fatal',
            errorMessage: 'ERROR: Invalid ClientKey',
            ...(options ?? {}),
            loadingContext: 'https://loop-platform-components-external.intapplb-np.nlzwo1o.adyen.com/platform-components-external/',
        },
        {},
        session.sessionToken
    );
}

export default setupSession;
