import setupSession from '../Services/sessions/setup-session';
import Storage from '../../utils/Storage';
import { sanitizeSession } from './utils';
import { SessionResponse, SessionSetupResponse } from './types';

class Session {
    private readonly session: SessionResponse;
    private readonly storage: Storage<SessionResponse>;
    public readonly loadingContext: string;
    public readonly token: string;
    public configuration?: SessionSetupResponse;

    constructor(rawSession: SessionResponse, loadingContext: string) {
        //If there isn't any id then sanitize will throw invalid session error
        const session = sanitizeSession(rawSession) as Session;

        this.storage = new Storage('session');
        this.loadingContext = loadingContext;
        this.token = rawSession.token;
        this.session = session;

        if (!this.session.token) {
            this.session = this.getStoredSession();
        } else {
            this.storeSession();
        }
    }

    get id() {
        return this.session.id;
    }

    get data() {
        return this.session.token;
    }

    /**
     * Updates the session.data with the latest data blob
     */
    private updateSessionData(latestData: string): void {
        this.session.token = latestData;
        this.storeSession();
    }

    /**
     * Fetches data from a session
     */
    setupSession(options: Record<string, any>) {
        return setupSession(this, options)
            .then(response => {
                if (response.endpoints) {
                    this.configuration = { ...response };
                }
                return response;
            })
            .catch(e => {
                throw e;
            });
    }

    /**
     * Gets the stored session but only if the current id and the stored id match
     */
    getStoredSession(): SessionResponse {
        const storedSession = this.storage.get();
        return this.id === storedSession?.id ? storedSession : this.session;
    }

    /**
     * Stores the session
     */
    storeSession(): void {
        this.storage.set({ id: this.session.id, token: this.session.token });
    }

    /**
     * Clears the stored session
     */
    removeStoredSession(): void {
        this.storage.remove();
    }
}

export default Session;
