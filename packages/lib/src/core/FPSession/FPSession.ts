import setupSession from '../Services/sessions/setup-session';
import Storage from '../../utils/Storage';
import { sanitizeSession } from './utils';
import { Session, SessionConfiguration } from './types';

class FPSession {
    private readonly session: Session;
    private readonly storage: Storage<Session>;
    public readonly clientKey: string;
    public readonly sessionToken: string;
    public readonly loadingContext: string;
    public configuration?: SessionConfiguration;

    constructor(rawSession: Session, clientKey: string, loadingContext: string, sessionToken: string) {
        //If there isn't any id then sanitize will throw invalid session error
        const session = sanitizeSession(rawSession) as Session;
        if (!clientKey) throw new Error('No clientKey available');

        this.storage = new Storage('session');
        this.clientKey = clientKey;
        this.loadingContext = loadingContext;
        this.session = session;
        this.sessionToken = sessionToken;

        if (!this.session.sessionData) {
            this.session = this.getStoredSession();
        } else {
            this.storeSession();
        }
    }

    get id() {
        return this.session.id;
    }

    get data() {
        return this.session.sessionData;
    }

    /**
     * Updates the session.data with the latest data blob
     */
    private updateSessionData(latestData: string): void {
        this.session.sessionData = latestData;
        this.storeSession();
    }

    /**
     * Fetches data from a session
     */
    setupSession(options: Record<string, any>) {
        return setupSession(this, options).then(response => {
            if (response.configuration) {
                this.configuration = { ...response.configuration };
            }
            return response;
        });
    }

    /**
     * Gets the stored session but only if the current id and the stored id match
     */
    getStoredSession(): Session {
        const storedSession = this.storage.get();
        return this.id === storedSession?.id ? storedSession : this.session;
    }

    /**
     * Stores the session
     */
    storeSession(): void {
        this.storage.set({ id: this.session.id, sessionData: this.session.sessionData });
    }

    /**
     * Clears the stored session
     */
    removeStoredSession(): void {
        this.storage.remove();
    }
}

export default FPSession;
