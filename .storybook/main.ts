import { StorybookConfig } from '@storybook/preact-vite';
import { mergeConfig } from 'vite';
import { checker } from 'vite-plugin-checker';
import { getEnvironment } from '../envs/getEnvs.ts';
import { realApiProxies } from '../endpoints/realApiProxies.js';

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
                            // Split vendor dependencies
                            if (id.includes('node_modules')) {
                                if (id.includes('preact') || id.includes('preact/hooks')) {
                                    return 'vendor-react';
                                }
                                if (id.includes('@storybook')) {
                                    return 'vendor-storybook';
                                }
                                if (id.includes('@testing-library')) {
                                    return 'vendor-testing';
                                }
                                if (id.includes('classnames')) {
                                    return 'vendor-utils';
                                }
                                return 'vendor-other';
                            }
                            // Split component groups
                            if (id.includes('/components/internal/')) {
                                if (id.includes('/FormFields/')) {
                                    return 'components-formfields';
                                }
                                if (id.includes('/Calendar/')) {
                                    return 'components-calendar';
                                }
                                return 'components-internal';
                            }
                            if (id.includes('/stories/')) {
                                if (id.includes('/stories/api/')) {
                                    return 'stories-api';
                                }
                                if (id.includes('/stories/components/Capital/')) {
                                    return 'stories-capital';
                                }
                                if (id.includes('/stories/components/Disputes/')) {
                                    return 'stories-disputes';
                                }
                                if (id.includes('/stories/components/PayByLink/')) {
                                    return 'stories-paybylink';
                                }
                                if (id.includes('/stories/mocked/')) {
                                    return 'stories-mocked';
                                }
                                return 'stories-other';
                            }
                        },
                    },
                },
            },
        });
    },
};

export default config;
