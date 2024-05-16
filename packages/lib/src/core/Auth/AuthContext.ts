import { AuthContextProps } from './types';
import { createContext } from 'preact';
import { EMPTY_OBJECT, noop } from '../../utils/common';

export const AuthContext = createContext<AuthContextProps>({
    token: '',
    endpoints: EMPTY_OBJECT,
    updateCore: noop,
});
