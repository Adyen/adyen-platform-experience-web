import { SessionResponse } from './types';

export function sanitizeSession(session: SessionResponse): Partial<SessionResponse> {
    if (!session || !session.id || !session.token) throw new Error('Invalid session');

    return {
        id: session.id,
        token: session.token,
    };
}
