import svgr from 'vite-plugin-svgr';
import { mergeConfig } from 'vite';
import { resolve } from 'node:path';
import { preact } from '@preact/preset-vite';
import { getEnvironment } from '../../../../envs/getEnvs.ts';
import { getBaseEnvDefines } from '../../../../config/defines/base-env.ts';
import { realApiProxies } from '../../../../endpoints/realApiProxies.js';
import type { StorybookConfig } from '@storybook/preact-vite';

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
        // Transitional root-level glob; removed in 03-02 once every story lives under packages/domains/*/preact/stories/.
        '../../../../stories/**/*.stories.*',
        // Framework-scoped under {domain}/preact/ — the preact/vue split is at the top level of each domain.
        '../../../../packages/domains/*/preact/stories/**/*.stories.*',
    ],
    staticDirs: [
        '../static',
        { from: resolve(rootDir, 'src/assets/datasets'), to: '/datasets' },
        { from: resolve(rootDir, 'src/assets'), to: '/src/assets' },
    ],
    framework: {
        name: '@storybook/preact-vite',
        options: {},
    },
    async viteFinal(config) {
        const mode = process.env.VITE_MODE ?? 'development';
        const { api } = getEnvironment(mode);

        return mergeConfig(config, {
            define: getBaseEnvDefines(mode),
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
                // Force a single copy of msw-storybook-addon across the tool package and repo root.
                // pnpm otherwise creates separate virtual paths (one per resolved peer); each copy
                // has its own module-scoped `api` variable, so initialize() and getWorker() read
                // different state -> "[MSW] Failed to retrieve the worker" in the built preview.
                alias: {
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
