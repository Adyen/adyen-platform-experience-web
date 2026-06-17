import svgr from 'vite-plugin-svgr';
import { mergeConfig } from 'vite';
import { resolve } from 'node:path';
import { preact } from '@preact/preset-vite';
import { getEnvironment } from '../../../../../../envs/getEnvs.ts';
import { getBaseEnvDefines } from '../../../../../../config/defines/base-env.ts';
import { realApiProxies } from '../../../../../../endpoints/realApiProxies.js';
import type { StorybookConfig } from '@storybook/preact-vite';

const root = '../../../../../..';
const rootDir = resolve(import.meta.dirname, root);

const findChunk = (id: string, mappings: Record<string, string | string[]>, fallback: string): string => {
    for (const [chunkName, patterns] of Object.entries(mappings)) {
        const list = Array.isArray(patterns) ? patterns : [patterns];
        if (list.some(p => id.includes(p))) return chunkName;
    }
    return fallback;
};

const config: StorybookConfig = {
    stories: [`${root}/packages/domains/*/preact/stories/**/*.stories.*`],
    staticDirs: [
        '../../../static',
        { from: resolve(rootDir, 'packages/shared/assets/src/datasets'), to: '/datasets' },
        { from: resolve(rootDir, 'packages/shared/assets/src'), to: '/src/assets' },
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
                alias: {
                    msw: resolve(rootDir, 'packages/tools/storybook/node_modules/msw'),
                    'msw-storybook-addon': resolve(rootDir, 'packages/tools/storybook/node_modules/msw-storybook-addon'),
                },
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
