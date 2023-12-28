import { AuthProviderProps } from '@src/core/Auth/types';
import { createContext } from 'preact';

export const AuthContext = createContext<AuthProviderProps>({
    sessionToken: '',
    endpoints: [],
});
