import { StorybookConfig } from '@storybook/preact-vite';
import { mergeConfig } from 'vite';
import { getEnvironment } from '../envs/getEnvs.ts';
import { realApiProxies } from '../endpoints/realApiProxies.js';

const findChunk = (id: string, mappings: Record<string, string | string[]>, fallback: string): string => {
    for (const [chunkName, patterns] of Object.entries(mappings)) {
        const list = Array.isArray(patterns) ? patterns : [patterns];
        if (list.some(p => id.includes(p))) return chunkName;
    }
    return fallback;
};

const config: StorybookConfig = {
    stories: ['../stories/**/*.stories.*'],
    staticDirs: ['../static', { from: '../src/assets/datasets', to: '/datasets' }],
    framework: {
        name: '@storybook/preact-vite',
        options: {},
    },
    async viteFinal(config) {
        const mode = process.env.VITE_MODE ?? 'development';
        const { api } = getEnvironment(mode);

        return mergeConfig(config, {
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
                        // Only split vendor (node_modules) chunks. Splitting application code
                        // (components/internal, stories) causes circular dependency TDZ errors
                        // with Vite 7 / Rollup 4 and is left to Rollup's default chunking.
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
