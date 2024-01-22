import Session from '@src/core/Session';
import { httpPost } from '../requests/http';
import { SessionSetupResponse } from '@src/core/Session/types';
import { API_VERSION } from './constants';

function setupSession(session: Session, options?: Record<string, any>): Promise<SessionSetupResponse> {
    const path = `/platform-components-external/api/${API_VERSION}/setup`;

    return httpPost<SessionSetupResponse>(
        {
            errorLevel: 'fatal',
            errorMessage: 'ERROR: Invalid ClientKey',
            ...(options ?? {}),
            loadingContext: session.loadingContext,
            path,
            headers: {
                Authorization: `Bearer ${session.token}`,
            },
        },
        {}
    );
}

export default setupSession;
