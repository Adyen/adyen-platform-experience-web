import { SetupEndpoint } from '../../types/models/openapi/endpoints';

export type SessionResponse = {
    id: string;
    token: string;
};

export type SessionSetupResponse = {
    endpoints: SetupEndpoint;
};
