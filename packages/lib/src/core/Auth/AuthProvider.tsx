import { AuthContext } from '@src/core/Auth/AuthContext';
import { AuthProviderProps } from '@src/core/Auth/types';
import { toChildArray } from 'preact';

const AuthProvider = ({ token, endpoints, children }: AuthProviderProps) => {
    return <AuthContext.Provider value={{ token: token, endpoints: endpoints }}>{toChildArray(children)}</AuthContext.Provider>;
};

export default AuthProvider;
