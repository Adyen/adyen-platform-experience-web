import { Dispatch } from 'preact/hooks';

export enum SESSION_ACTIONS {
    SET_SESSION_TOKEN = 'SET_SESSION_TOKEN',
    SET_CLIENT_KEY = 'SET_CLIENT_KEY',
    SET_ENDPOINTS = 'SET_ENDPOINTS',
}
export interface AuthProviderProps {
    children?: any;
    sessionToken: string;
    clientKey: string;
    endpoints: string[];
}

export type AuthContextProps = AuthProviderProps;
