import { AuthContext } from '@src/core/Auth/AuthContext';
import { AuthProviderProps } from '@src/core/Auth/types';
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

    const update = async (...args: any) => {
        setIsUpdatingToken(true);
        if (updateCore) {
            await updateCore(...args);
        }
    };

    return (
        <AuthContext.Provider value={{ token, endpoints, updateCore: update, sessionSetupError, isUpdatingToken }}>
            {toChildArray(children)}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
