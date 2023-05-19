// @ts-strict-ignore
import { loadEnv } from 'vite';
import { resolve } from 'node:path';

export const envDir = resolve(__dirname);

const parseEnv = (env: Record<string, string>) => ({
    lemApi: {
        url: env.LEM_API_URL ?? '',
        version: env.LEM_API_VERSION ?? '',
        username: env.WS_USER ?? '',
        password: env.VITE_BASIC_PASS ?? '',
    },
    BTLApi: {
        url: env.BTL_API_URL ?? '',
        version: env.LEM_API_VERSION ?? '',
        username: env.WS_USER ?? '',
        password: env.VITE_BASIC_PASS ?? '',
        balancePlatform: env.VITE_BALANCE_PLATFORM ?? '',
        apiKey: env.VITE_API_KEY ?? '',
    },
    BCLApi: {
        url: env.BCL_API_URL ?? '',
        version: env.KYC_API_VERSION ?? '',
        username: env.WS_USER ?? '',
        password: env.VITE_BASIC_PASS ?? '',
        balancePlatform: env.VITE_BALANCE_PLATFORM ?? '',
        apiKey: env.VITE_API_KEY ?? '',
    },
    playground: {
        host: env.PLAYGROUND_HOST ?? '',
        port: parseInt(env.PLAYGROUND_PORT),
        clientKey: env.VITE_API_KEY ?? '',
        apiUrl: env.VITE_API_URL ?? '',
    },
    mockServer: {
        port: parseInt(env.MOCK_SERVER_PORT),
    },
});

export type Environment = ReturnType<typeof parseEnv>;

export const getEnvironment = (mode: string): Environment => {
    const envVars = { ...process.env, ...loadEnv(mode, envDir, '') };
    const environment = parseEnv(envVars);
    return environment;
};
