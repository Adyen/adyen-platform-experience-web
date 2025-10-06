import { dirname } from 'path';
import { loadEnv } from 'vite';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);

export const envDir = dirname(filename);

const parseEnv = (env: Record<string, string | undefined>) => ({
    api: {
        session: {
            accountHolder: env.SESSION_ACCOUNT_HOLDER,
            apiKey: env.API_KEY,
            autoRefresh: env.SESSION_AUTO_REFRESH,
            maxAgeMs: env.SESSION_MAX_AGE_MS,
            permissions: env.SESSION_PERMISSIONS,
            url: env.SESSION_API_URL ?? '',
        },
    },
    app: {
        host: env.PLAYGROUND_HOST ?? '',
        port: parseInt(env.PLAYGROUND_PORT ?? ''),
        loadingContext: env.LOADING_CONTEXT,
        url: env.PLAYGROUND_URL ?? '',
        useCdn: env.USE_CDN,
        useTestCdn: env.USE_TEST_CDN,
    },
});

export type Environment = ReturnType<typeof parseEnv>;

export const getEnvironment = (mode: string): Environment => {
    const envVars = { ...process.env, ...loadEnv(mode, envDir, '') };
    return parseEnv(envVars);
};
