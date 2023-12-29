import { httpPost } from '../requests/http';
import { SessionSetupResponse } from '@src/core/Session/types';
import { API_VERSION } from './constants';

function setupSession(token: string, options?: Record<string, any>): Promise<SessionSetupResponse> {
    const path = `${API_VERSION}/setup`;

    return httpPost<SessionSetupResponse>(
        {
            path,
            errorLevel: 'fatal',
            errorMessage: 'ERROR: Invalid ClientKey',
            ...(options ?? {}),
            loadingContext: 'https://loop-platform-components-external.intapplb-np.nlzwo1o.adyen.com/platform-components-external/',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
        {}
    );
}

export default setupSession;
