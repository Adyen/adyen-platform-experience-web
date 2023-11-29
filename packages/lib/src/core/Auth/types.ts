import { Dispatch } from 'preact/hooks';

export enum SESSION_ACTIONS {
    SET_SESSION_TOKEN = 'SET_SESSION_TOKEN',
    SET_CLIENT_KEY = 'SET_CLIENT_KEY',
}
export interface AuthProviderProps {
    children?: any;
    sessionToken: string;
    clientKey: string;
    onSessionCreate: () => Promise<{ token: string; id: string; clientKey: string }>;
}

export type AuthContextProps = AuthProviderProps & { modifyAuthContext: Dispatch<{ type: SESSION_ACTIONS; payload: string }> };
