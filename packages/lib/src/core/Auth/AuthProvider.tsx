import { AuthContext } from '@src/core/Auth/AuthContext';
import { AuthProviderProps, SESSION_ACTIONS } from '@src/core/Auth/types';
import { toChildArray } from 'preact';
import { useReducer } from 'preact/hooks';

const AuthProvider = ({ sessionToken, clientKey, children, endpoints }: AuthProviderProps) => {
    return (
        <AuthContext.Provider value={{ sessionToken: sessionToken, clientKey: clientKey, endpoints: endpoints }}>
            {toChildArray(children)}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
