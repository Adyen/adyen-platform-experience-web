import { httpPost } from '../requests/http';
import { SessionSetupResponse } from '../../FPSession/types';
import { API_VERSION } from './constants';

function setupSession(sessionToken: string, options?: Record<string, any>): Promise<SessionSetupResponse> {
    const path = `${API_VERSION}/setup`;

    return httpPost<SessionSetupResponse>(
        {
            path,
            errorLevel: 'fatal',
            errorMessage: 'ERROR: Invalid ClientKey',
            ...(options ?? {}),
            loadingContext: 'https://loop-platform-components-external.intapplb-np.nlzwo1o.adyen.com/platform-components-external/',
        },
        {},
        sessionToken
    );
}

export default setupSession;
