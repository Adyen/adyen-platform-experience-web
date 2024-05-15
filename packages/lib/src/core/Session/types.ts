import { SetupEndpoint } from '../../types/api/endpoints';

export type SessionResponse = {
    id: string;
    token: string;
};

export type SessionSetupResponse = {
    endpoints: SetupEndpoint;
};
