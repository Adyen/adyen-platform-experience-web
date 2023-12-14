import { AuthContextProps, AuthProviderProps, SESSION_ACTIONS } from '@src/core/Auth/types';
import { createContext } from 'preact';
import { useReducer } from 'preact/hooks';

export const AuthContext = createContext<AuthContextProps>({
    sessionToken: '',
    clientKey: '',
    endpoints: [],
});
