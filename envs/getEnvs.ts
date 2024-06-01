import { loadEnv } from 'vite';
import { resolve } from 'node:path';

export const envDir = resolve(__dirname);

const parseEnv = (env: Record<string, string | undefined>) => ({
    apiConfigs: {
        platformComponentsApi: {
            url: env.PLATFORM_API_URL,
            apiKey: env.API_KEY ?? '',
        },
        sessionApi: {
            url: env.SESSION_API_URL ?? '',
            apiKey: env.API_KEY,
            accountHolder: env.SESSION_ACCOUNT_HOLDER,
            permissions: env.SESSION_PERMISSIONS,
            maxAgeMs: env.SESSION_MAX_AGE_MS,
        },
    },
    playground: {
        host: env.PLAYGROUND_HOST ?? '',
        port: parseInt(env.PLAYGROUND_PORT ?? ''),
        clientKey: env.API_KEY ?? '',
        playgroundUrl: env.PLAYGROUND_URL ?? '',
        loadingContext: env.LOADING_CONTEXT,
    },
    mockServer: {
        port: parseInt(env.MOCK_SERVER_PORT ?? ''),
    },
});

export type Environment = ReturnType<typeof parseEnv>;

export const getEnvironment = (mode: string): Environment => {
    const envVars = { ...process.env, ...loadEnv(mode, envDir, '') };
    return parseEnv(envVars);
};
