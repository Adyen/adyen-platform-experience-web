import Core from '../core';
import { SetupEndpoint } from '../../types/api/endpoints';

interface AuthProviderBaseProps {
    children?: any;
    token: string;
    endpoints: SetupEndpoint;
    sessionSetupError?: Core['sessionSetupError'];
}

export interface AuthProviderProps extends AuthProviderBaseProps {
    updateCore?: Core['update'];
}

export interface AuthContextProps extends AuthProviderBaseProps {
    updateCore: () => any;
    isUpdatingToken?: boolean;
}
