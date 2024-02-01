import { AuthContext } from '@src/core/Auth/AuthContext';
import { AuthProviderProps } from '@src/core/Auth/types';
import { toChildArray } from 'preact';

const AuthProvider = ({ token, endpoints, children, updateCore }: AuthProviderProps) => {
    return <AuthContext.Provider value={{ token, endpoints, updateCore }}>{toChildArray(children)}</AuthContext.Provider>;
};

export default AuthProvider;
