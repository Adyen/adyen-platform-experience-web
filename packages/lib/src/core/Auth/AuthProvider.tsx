import { AuthContext } from '@src/core/Auth/AuthContext';
import { AuthProviderProps } from '@src/core/Auth/types';
import { EMPTY_OBJECT } from '@src/utils/common';
import { toChildArray } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

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
