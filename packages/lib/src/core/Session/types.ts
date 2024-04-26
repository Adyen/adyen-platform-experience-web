import { SetupEndpoint } from '@src/types/api/endpoints';

export type SessionResponse = {
    id: string;
    token: string;
};

export type SessionSetupResponse = {
    endpoints: SetupEndpoint;
};
