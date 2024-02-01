import { Core } from '@src/core';

export interface AuthProviderProps {
    children?: any;
    token: string;
    endpoints: Record<
        string,
        {
            method: string;
            url: string;
        }
    >;
    updateCore?: Core['update'];
}
