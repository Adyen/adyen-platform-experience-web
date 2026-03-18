import { dirname, resolve } from 'path';
import { loadEnv } from 'vite';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);

// Point to project root (parent of envs/ directory)
const envDir = resolve(dirname(filename), '..');

const parseEnv = (env: Record<string, string | undefined>) => {
    // Interpolate shell-style variables like $PLAYGROUND_HOST:$PLAYGROUND_PORT
    const interpolate = (value: string | undefined): string | undefined => {
        if (!value) return value;
        return value.replace(/\$PLAYGROUND_HOST/g, env.PLAYGROUND_HOST ?? 'localhost').replace(/\$PLAYGROUND_PORT/g, env.PLAYGROUND_PORT ?? '5173');
    };

    return {
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
            host: env.PLAYGROUND_HOST ?? 'localhost',
            port: parseInt(env.PLAYGROUND_PORT ?? '5173'),
            loadingContext: env.LOADING_CONTEXT,
            url: interpolate(env.PLAYGROUND_URL) ?? `http://${env.PLAYGROUND_HOST ?? 'localhost'}:${env.PLAYGROUND_PORT ?? '5173'}/`,
            useCdn: env.USE_CDN,
            useTestCdn: env.USE_TEST_CDN,
        },
    };
};

export type Environment = ReturnType<typeof parseEnv>;

export const getEnvironment = (mode: string): Environment => {
    const envVars = { ...process.env, ...loadEnv(mode, envDir, '') };
    return parseEnv(envVars);
};
