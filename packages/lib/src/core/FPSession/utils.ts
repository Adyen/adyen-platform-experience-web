import { Session } from '../../types';

export function sanitizeSession(session: Session): Partial<Session> {
    if (!session || !session.id) throw new Error('Invalid session');

    return {
        id: session.id,
        ...(session.sessionData ? { sessionData: session.sessionData } : {}),
    };
}
