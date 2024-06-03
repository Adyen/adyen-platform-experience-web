import Session from './Session';
import { httpPost } from '../Http/http';
import { SessionSetupResponse } from './types';

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
