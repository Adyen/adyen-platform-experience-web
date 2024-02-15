import Core from '../core';
import { SetupEndpoint } from '@src/types/models/openapi/endpoints';

export interface AuthProviderProps {
    children?: any;
    token: string;
    endpoints: SetupEndpoint;
    updateCore?: Core['update'];
    sessionSetupError?: Core['sessionSetupError'];
}
