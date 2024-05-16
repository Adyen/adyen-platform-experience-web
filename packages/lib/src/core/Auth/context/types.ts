import Core from '../../core';
import { AuthSession, AuthSessionSetupContext } from '../session';

export interface AuthProviderProps extends Partial<Pick<Core, 'loadingContext' | 'onSessionCreate'>> {
    children?: any;
}

export interface AuthContextProps {
    endpoints: AuthSessionSetupContext['endpoints'];
    hasError: AuthSessionSetupContext['hasError'];
    http: AuthSession['http'];
    initializing: AuthSession['initializing'];
    isExpired: AuthSession['isExpired'];
}
