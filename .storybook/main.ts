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
            },
        });
    },
};

export default config;
