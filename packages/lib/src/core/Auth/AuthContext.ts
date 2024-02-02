import { AuthProviderProps } from '@src/core/Auth/types';
import { createContext } from 'preact';
import { SetupEndpoint } from '@src/types/models/openapi/endpoints';

export const AuthContext = createContext<AuthProviderProps>({
    token: '',
    endpoints: {} as SetupEndpoint,
});
