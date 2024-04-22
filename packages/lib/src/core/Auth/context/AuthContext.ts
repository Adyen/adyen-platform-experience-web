import { createContext } from 'preact';
import { EMPTY_OBJECT, noop } from '@src/utils/common';
import { AuthContextProps } from './types';

export const AuthContext = createContext<AuthContextProps>({
    token: '',
    endpoints: EMPTY_OBJECT,
    updateCore: noop,
});
