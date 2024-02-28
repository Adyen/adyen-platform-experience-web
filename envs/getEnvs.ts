import { loadEnv } from 'vite';
import { resolve } from 'node:path';

export const envDir = resolve(__dirname);

export const enum ENVIRONMENTS {
    TEST = 'TEST',
    LOOP = 'LOOP',
}

const parseEnv = (env: Record<string, string | undefined>, environment: ENVIRONMENTS) => ({
    apiConfigs: {
        platformComponentsApi: {
            url: env[`${environment}_API_URL`],
            version: env[`${environment}_API_VERSION`],
            apiKey: env[`${environment}_API_KEY`],
        },
        sessionApi: {
            url: env[`${environment}_SESSION_API_URL`],
            apiKey: env[`${environment}_API_KEY`],
            accountHolder: env[`${environment}_SESSION_ACCOUNT_HOLDER`],
            permissions: env[`${environment}_SESSION_PERMISSIONS`],
        },
    },
    playground: {
        host: env.PLAYGROUND_HOST ?? '',
        port: parseInt(env.PLAYGROUND_PORT ?? ''),
        clientKey: env.VITE_API_KEY ?? '',
        playgroundUrl: env.PLAYGROUND_URL ?? '',
        loadingContext: env.LOADING_CONTEXT,
    },
    mockServer: {
        port: parseInt(env.MOCK_SERVER_PORT ?? ''),
    },
});

export type Environment = ReturnType<typeof parseEnv>;

export const getEnvironment = (mode: string, environment: ENVIRONMENTS = ENVIRONMENTS.TEST): Environment => {
    const envVars = { ...process.env, ...loadEnv(mode, envDir, '') };
    return parseEnv(envVars, environment);
};
