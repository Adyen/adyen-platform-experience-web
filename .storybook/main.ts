import { StorybookConfig } from '@storybook/preact-vite';
import { mergeConfig } from 'vite';
import { checker } from 'vite-plugin-checker';
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
    staticDirs: ['../static'],
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
            plugins: [
                mode === 'development' &&
                    checker({
                        stylelint: {
                            lintCommand: 'stylelint src/**/*.scss',
                        },
                    }),
            ],
            build: {
                target: 'esnext',
                chunkSizeWarningLimit: 800,
                rollupOptions: {
                    output: {
                        manualChunks: (id: string) => {
                            if (id.includes('node_modules')) {
                                return findChunk(
                                    id,
                                    {
                                        'vendor-react': ['preact', 'preact/hooks'],
                                        'vendor-storybook': '@storybook',
                                        'vendor-testing': '@testing-library',
                                        'vendor-utils': 'classnames',
                                    },
                                    'vendor-other'
                                );
                            }

                            if (id.includes('/components/internal/')) {
                                return findChunk(
                                    id,
                                    {
                                        'components-formfields': '/FormFields/',
                                        'components-calendar': '/Calendar/',
                                    },
                                    'components-internal'
                                );
                            }

                            if (id.includes('/stories/')) {
                                return findChunk(
                                    id,
                                    {
                                        'stories-api': '/stories/api/',
                                        'stories-capital': '/stories/components/Capital/',
                                        'stories-disputes': '/stories/components/Disputes/',
                                        'stories-paybylink': '/stories/components/PayByLink/',
                                        'stories-mocked': '/stories/mocked/',
                                    },
                                    'stories-other'
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
