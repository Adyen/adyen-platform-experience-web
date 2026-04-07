import { getEnvironment } from '../envs/getEnvs';
import version from './version';

export const getBuildEnvDefines = (mode: string) => {
    const { ADYEN_BUILD_ID, ADYEN_FP_VERSION, COMMIT_BRANCH, COMMIT_HASH } = version();
    const isDevelopment = mode === 'development';
    const isTestEnv = process.env.TEST_ENV === '1';
    const { api, app } = getEnvironment(mode);
    const { session } = api;
    const localAssets = app.useCdn == 'true' ? null : isDevelopment || isTestEnv;
    const testCdnAssets = isDevelopment || app.useTestCdn ? true : null;

    return {
        'process.env.VITE_APP_PORT': JSON.stringify(app.port || null),
        'process.env.VITE_APP_URL': JSON.stringify(process.env.DEPLOY_PRIME_URL?.replace('main--', '') || app.url || null),
        'process.env.VITE_APP_LOADING_CONTEXT': JSON.stringify(isDevelopment ? app.loadingContext || null : null),
        'process.env.VITE_LOCAL_ASSETS': JSON.stringify(localAssets),
        'process.env.VITE_BUILD_ID': JSON.stringify(ADYEN_BUILD_ID),
        'process.env.VITE_COMMIT_BRANCH': JSON.stringify(COMMIT_BRANCH),
        'process.env.VITE_COMMIT_HASH': JSON.stringify(COMMIT_HASH),
        'process.env.VITE_MODE': JSON.stringify(process.env.VITE_MODE ?? mode),
        'process.env.VITE_VERSION': JSON.stringify(ADYEN_FP_VERSION),
        'process.env.SESSION_ACCOUNT_HOLDER': JSON.stringify(session.accountHolder || null),
        'process.env.SESSION_AUTO_REFRESH': JSON.stringify(isDevelopment ? session.autoRefresh === 'true' || null : undefined),
        'process.env.SESSION_MAX_AGE_MS': JSON.stringify(isDevelopment ? session.maxAgeMs || null : undefined),
        'process.env.SESSION_PERMISSIONS': JSON.stringify(session.permissions || null),
        'process.env.TEST_ENV': JSON.stringify(process.env.TEST_ENV),
        'process.env.USE_CDN': JSON.stringify(app.useCdn ?? null),
        'process.env.VITE_TEST_CDN_ASSETS': JSON.stringify(testCdnAssets),
    };
};
