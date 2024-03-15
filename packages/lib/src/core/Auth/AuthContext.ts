import { AuthProviderProps } from '@src/core/Auth/types';
import { createContext } from 'preact';
import { EMPTY_OBJECT } from '@src/utils/common';

export const AuthContext = createContext<AuthProviderProps>({
    token: '',
    endpoints: EMPTY_OBJECT,
});
