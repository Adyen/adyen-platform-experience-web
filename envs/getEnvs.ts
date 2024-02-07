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
        BCLApi: {
            url: env.BCL_API_URL ?? '',
            version: env.KYC_API_VERSION ?? '',
            balancePlatform: env.VITE_BALANCE_PLATFORM ?? '',
            apiKey: env.VITE_API_KEY ?? '',
        },
        BTLApi: {
            url: env.BTL_API_URL ?? '',
            version: env.LEM_API_VERSION ?? '',
            balancePlatform: env.VITE_BALANCE_PLATFORM ?? '',
            apiKey: env.VITE_API_KEY ?? '',
        },
        platformComponentsApi: {
            url: getPlatformApiUrl(env, environment),
            version: env.LOOP_API_VERSION ?? '',
            apiKey: env.VITE_API_KEY ?? '',
        },
        sessionApi: {
            url: env.SESSION_API_URL ?? '',
            token: env.SESSION_AUTH_TOKEN ?? '',
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
    envIds: {
        legalEntities: {
            individual: env.VITE_ORG_LEGAL_ENTITY_ID,
            organization: env.VITE_IND_LEGAL_ENTITY_ID,
            soleProprietorship: env.VITE_SOLE_PROPRIETORSHIP_LEGAL_ENTITY_ID,
        },
        transaction: {
            defaultId: env.VITE_DEFAULT_TRANSACTION_ID,
        },
        balanceAccount: {
            defaultId: env.VITE_DEFAULT_BALANCE_ACCOUNT_ID,
        },
        accountHolder: {
            defaultId: env.VITE_DEFAULT_ACCOUNT_HOLDER_ID,
        },
    },
});

export type Environment = ReturnType<typeof parseEnv>;

export const getEnvironment = (mode: string, environment: ENVIRONMENTS = ENVIRONMENTS.TEST): Environment => {
    const envVars = { ...process.env, ...loadEnv(mode, envDir, '') };
    return parseEnv(envVars, environment);
};
