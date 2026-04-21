import { StorybookConfig } from '@storybook/preact-vite';
import { mergeConfig } from 'vite';
import { resolve } from 'node:path';
import { preact } from '@preact/preset-vite';
import svgr from 'vite-plugin-svgr';
import { getEnvironment } from '../../../../envs/getEnvs.ts';
import { realApiProxies } from '../../../../endpoints/realApiProxies.js';

// Inlined env defines. Importing config/build-env-defines.ts would pull its
// transitive src/ imports through Storybook's loader; only the runtime env vars
// are needed here, so we compute them directly.
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

const findChunk = (id: string, mappings: Record<string, string | string[]>, fallback: string): string => {
    for (const [chunkName, patterns] of Object.entries(mappings)) {
        const list = Array.isArray(patterns) ? patterns : [patterns];
        if (list.some(p => id.includes(p))) return chunkName;
    }
    return fallback;
};

const config: StorybookConfig = {
    stories: [
        // Transitional root-level glob; removed in 03-02 once every story lives under packages/domains/*/stories/.
        '../../../../stories/**/*.stories.*',
        // Framework-scoped: excludes Vue stories.
        '../../../../packages/domains/*/stories/preact/**/*.stories.*',
    ],
    staticDirs: ['../static', { from: resolve(rootDir, 'src/assets/datasets'), to: '/datasets' }],
    framework: {
        name: '@storybook/preact-vite',
        options: {},
    },
    async viteFinal(config) {
        const mode = process.env.VITE_MODE ?? 'development';
        const { api } = getEnvironment(mode);

        return mergeConfig(config, {
            define: getStorybookDefines(mode),
            json: {
                stringify: true,
            },
            plugins: [
                // react / react-dom / react/jsx-runtime -> preact aliases + Preact JSX transform + Prefresh HMR.
                preact(),
                svgr({
                    svgrOptions: { jsxRuntime: 'automatic', exportType: 'default' },
                    esbuildOptions: { jsx: 'automatic' },
                    include: '**/*.svg?component',
                }),
            ],
            resolve: {
                // Mirrors root vite.config.ts. Workaround for IEX-2797: shared packages in
                // packages/shared/* don't declare their inter-package deps, so pnpm doesn't
                // symlink them and Vite can't resolve transitive imports without aliases.
                // Drop this block once the shared packages declare workspace:* deps correctly.
                alias: {
                    '@integration-components/hooks-preact': resolve(rootDir, 'packages/shared/hooks-preact/src'),
                    '@integration-components/core': resolve(rootDir, 'packages/shared/core/src'),
                    '@integration-components/types': resolve(rootDir, 'packages/shared/types/src'),
                    '@integration-components/utils': resolve(rootDir, 'packages/shared/utils/src'),
                    '@integration-components/style': resolve(rootDir, 'packages/shared/style/src'),
                    '@integration-components/sdk-internal': resolve(rootDir, 'packages/shared/lib/src'),
                    '@integration-components/reports': resolve(rootDir, 'packages/domains/reports'),
                    '@integration-components/testing': resolve(rootDir, 'packages/shared/testing/src'),
                    // Force a single copy of msw-storybook-addon across the tool package and repo root.
                    // pnpm otherwise creates separate virtual paths (one per resolved peer); each copy
                    // has its own module-scoped `api` variable, so initialize() and getWorker() read
                    // different state -> "[MSW] Failed to retrieve the worker" in the built preview.
                    'msw-storybook-addon': resolve(rootDir, 'node_modules/msw-storybook-addon'),
                },
                dedupe: ['msw-storybook-addon', 'msw', 'msw/browser'],
            },
            css: {
                preprocessorOptions: {
                    scss: {
                        api: 'modern-compiler',
                        silenceDeprecations: ['legacy-js-api'],
                        loadPaths: [resolve(rootDir, 'src'), resolve(rootDir, 'node_modules')],
                    },
                },
            },
            server: {
                proxy: realApiProxies(api, mode),
            },
            build: {
                target: 'esnext',
                chunkSizeWarningLimit: 800,
                rollupOptions: {
                    output: {
                        // Merge small chunks to reduce HTTP requests.
                        experimentalMinChunkSize: 10_000,
                        // Vendor-only manual chunking. Splitting app code (components, stories)
                        // triggers TDZ errors under Vite 7 / Rollup 4; let Rollup default-chunk it.
                        manualChunks: (id: string) => {
                            if (id.includes('node_modules')) {
                                return findChunk(
                                    id,
                                    {
                                        'vendor-react': ['preact', 'preact/hooks'],
                                        'vendor-storybook': '@storybook',
                                        'vendor-testing': '@testing-library',
                                        'vendor-utils': 'classnames',
                                        'vendor-kyc': '@adyen/kyc-components',
                                    },
                                    'vendor-other'
                                );
                            }
                        },
                    },
                },
            },
        });
    },
};

export default config;
