import Session from '../../Session/Session';
import { httpPost } from '../requests/http';
import { SessionSetupResponse } from '../../Session/types';

function setupSession(session: Session, options?: Record<string, any>): Promise<SessionSetupResponse> {
    const path = `/setup`;

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
