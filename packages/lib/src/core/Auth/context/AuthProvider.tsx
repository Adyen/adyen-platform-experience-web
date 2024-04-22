import { toChildArray } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { EMPTY_OBJECT } from '@src/utils/common';
import { AuthContext } from './AuthContext';
import { AuthProviderProps } from './types';

const AuthProvider = ({ token, endpoints, children, updateCore, sessionSetupError }: AuthProviderProps) => {
    const [isUpdatingToken, setIsUpdatingToken] = useState<boolean>();
    const currentToken = useRef<string>('');

    useEffect(() => {
        if (currentToken.current !== token) {
            currentToken.current = token;
            setIsUpdatingToken(false);
        }
    }, [token]);

    const update = async () => {
        setIsUpdatingToken(true);
        if (updateCore) {
            await updateCore(EMPTY_OBJECT, true);
        }
    };

    return (
        <AuthContext.Provider value={{ token, endpoints, updateCore: update, sessionSetupError, isUpdatingToken }}>
            {toChildArray(children)}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
