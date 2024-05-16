import { createContext } from 'preact';
import { asyncNoop, EMPTY_OBJECT } from '../../../primitives/utils';
import { AuthContextProps } from './types';

export const AuthContext = createContext<AuthContextProps>({
    endpoints: EMPTY_OBJECT,
    hasError: false,
    http: asyncNoop,
    initializing: false,
    isExpired: undefined,
});
