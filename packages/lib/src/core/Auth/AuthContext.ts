import { AuthContextProps, AuthProviderProps, SESSION_ACTIONS } from '@src/core/Auth/types';
import { createContext } from 'preact';
import { useReducer } from 'preact/hooks';

const defaultSessionCreate = () => Promise.resolve({ token: '', id: '', clientKey: '' });

export const AuthContext = createContext<AuthContextProps>({
    sessionToken: '',
    clientKey: '',
    onSessionCreate: defaultSessionCreate,
    modifyAuthContext: () => {},
});
