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
            loadingContext: 'https://platform-components-external-test.adyen.com/platform-components-external/api/',
            path,
            headers: {
                Authorization: `Bearer ${session.token}`,
                token: session.token,
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:3030',
                origin: 'http://localhost:3030',
            },
        },
        {}
    );
}

export default setupSession;
