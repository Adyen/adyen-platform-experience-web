import type { StorybookConfig } from '@storybook/vue3-vite';
import { mergeConfig } from 'vite';
import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { getEnvironment } from '../../../../envs/getEnvs.ts';
import { realApiProxies } from '../../../../endpoints/realApiProxies.js';

// Inlined env-variable defines. See the equivalent block in storybook-preact
// main.ts for the rationale (avoids transitive directory imports).
const getStorybookDefines = (mode: string) => {
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
        'process.env.VITE_MODE': JSON.stringify(process.env.VITE_MODE ?? mode),
        'process.env.SESSION_ACCOUNT_HOLDER': JSON.stringify(session.accountHolder || null),
        'process.env.SESSION_AUTO_REFRESH': JSON.stringify(isDevelopment ? session.autoRefresh === 'true' || null : undefined),
        'process.env.SESSION_MAX_AGE_MS': JSON.stringify(isDevelopment ? session.maxAgeMs || null : undefined),
        'process.env.SESSION_PERMISSIONS': JSON.stringify(session.permissions || null),
        'process.env.TEST_ENV': JSON.stringify(process.env.TEST_ENV),
        'process.env.USE_CDN': JSON.stringify(app.useCdn ?? null),
        'process.env.VITE_TEST_CDN_ASSETS': JSON.stringify(testCdnAssets),
    };
};

const rootDir = resolve(import.meta.dirname, '../../../..');

const config: StorybookConfig = {
    // Framework-scoped under {domain}/vue/ — the preact/vue split is at the top level
    // of each domain. Phase 1 ships a single placeholder smoke under
    // packages/domains/reports/vue/stories/. Real domain Vue stories land in 04-03.
    stories: ['../../../../packages/domains/*/vue/stories/**/*.stories.*'],
    staticDirs: ['../static'],
    framework: {
        name: '@storybook/vue3-vite',
        options: {},
    },
    async viteFinal(config) {
        const mode = process.env.VITE_MODE ?? 'development';
        const { api } = getEnvironment(mode);

        return mergeConfig(config, {
            define: getStorybookDefines(mode),
            plugins: [vue()],
            resolve: {
                // Mirrors root vite.config.ts. Required today because preview.ts imports
                // @integration-components/testing/msw, which transitively pulls @integration-components/core,
                // which imports @integration-components/utils — and the shared packages don't declare
                // their inter-package workspace deps, so pnpm can't symlink them. Drop once IEX-2797
                // fixes the shared package.json files.
                alias: {
                    '@integration-components/hooks-preact': resolve(rootDir, 'packages/shared/hooks-preact/src'),
                    '@integration-components/core': resolve(rootDir, 'packages/shared/core/src'),
                    '@integration-components/types': resolve(rootDir, 'packages/shared/types/src'),
                    '@integration-components/utils': resolve(rootDir, 'packages/shared/utils/src'),
                    '@integration-components/style': resolve(rootDir, 'packages/shared/style/src'),
                    '@integration-components/testing': resolve(rootDir, 'packages/shared/testing/src'),
                },
            },
            css: {
                preprocessorOptions: {
                    scss: {
                        loadPaths: [resolve(rootDir, 'node_modules')],
                    },
                },
            },
            server: {
                proxy: realApiProxies(api, mode),
            },
        });
    },
};

export default config;
