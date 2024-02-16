import { loadEnv } from 'vite';
import { resolve } from 'node:path';

export const envDir = resolve(__dirname);

export const enum ENVIRONMENTS {
    LOCAL = 'local',
    TEST = 'test',
}

const getPlatformApiUrl = (env: Record<string, string | undefined>, environment: ENVIRONMENTS) => {
    switch (environment) {
        case ENVIRONMENTS.LOCAL:
            return env.VITE_API_URL;
        case ENVIRONMENTS.TEST:
            return env.LOOP_API_URL;
    }
};

const parseEnv = (env: Record<string, string | undefined>, environment: ENVIRONMENTS) => ({
    apiConfigs: {
        platformComponentsApi: {
            url: getPlatformApiUrl(env, environment),
            version: env.LOOP_API_VERSION ?? '',
            apiKey: env.VITE_API_KEY ?? '',
        },
        sessionApi: {
            url: env.SESSION_API_URL ?? '',
            token: env.SESSION_AUTH_TOKEN ?? '',
            username: env.SESSION_USERNAME,
            password: env.SESSION_PASSWORD,
            accountHolder: env.SESSION_ACCOUNT_HOLDER,
            permissions: env.SESSION_PERMISSIONS,
        },
    },
    playground: {
        host: env.PLAYGROUND_HOST ?? '',
        port: parseInt(env.PLAYGROUND_PORT ?? ''),
        clientKey: env.VITE_API_KEY ?? '',
        apiUrl: env.VITE_API_URL ?? '',
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
