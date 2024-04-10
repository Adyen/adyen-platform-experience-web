import { AuthContextProps } from '@src/core/Auth/types';
import { createContext } from 'preact';
import { EMPTY_OBJECT, noop } from '@src/utils/common';

export const AuthContext = createContext<AuthContextProps>({
    token: '',
    endpoints: EMPTY_OBJECT,
    updateCore: noop,
});
