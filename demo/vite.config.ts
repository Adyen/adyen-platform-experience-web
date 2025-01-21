// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig, UserConfig } from 'vite';
import version from '../config/version';

import { realApiProxies } from './endpoints/realApiProxies';
import { getEnvironment } from './envs/getEnvs';
const currentVersion = version();

export default defineConfig(async ({ mode }): Promise<UserConfig> => {
    const { apiConfigs, demo } = getEnvironment(mode);
    return {
        root: '.',
        base: '',
        json: {
            stringify: true,
        },
        define: {
            'process.env.VITE_VERSION': JSON.stringify(currentVersion.ADYEN_FP_VERSION),
            'process.env.VITE_COMMIT_HASH': JSON.stringify(currentVersion.COMMIT_HASH),
            'process.env.VITE_COMMIT_BRANCH': JSON.stringify(currentVersion.COMMIT_BRANCH),
            'process.env.VITE_ADYEN_BUILD_ID': JSON.stringify(currentVersion.ADYEN_BUILD_ID),
            'process.env.VITE_LOADING_CONTEXT': JSON.stringify(mode === 'development' || mode === 'local-env' ? demo.loadingContext || null : null),
            'process.env.VITE_MODE': JSON.stringify(process.env.VITE_MODE ?? mode),
            'process.env.VITE_PLAYGROUND_PORT': JSON.stringify(demo.port || null),
            'process.env.DEPLOYED_URL': JSON.stringify(process.env.DEPLOY_PRIME_URL || null),
            'process.env.VITE_PLAYGROUND_URL': JSON.stringify(process.env.DEPLOY_PRIME_URL?.replace('main--', '') || demo.playgroundUrl || null),
            'process.env.E2E_TEST': JSON.stringify(process.env.E2E_TEST),
            'process.env.SESSION_ACCOUNT_HOLDER': JSON.stringify(apiConfigs.sessionApi.accountHolder || null),
            'process.env.SESSION_ACCOUNT_HOLDER_WITH_OFFER': JSON.stringify(apiConfigs.sessionApi.accountHolderWithOffer || null),
            'process.env.SESSION_PERMISSIONS': JSON.stringify(apiConfigs.sessionApi.permissions || null),
        },
        server: {
            host: demo.host,
            port: demo.port,
            https: false,
            proxy: realApiProxies(apiConfigs, mode),
        },
    };
});
