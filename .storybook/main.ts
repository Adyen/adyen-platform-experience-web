import { StorybookConfig } from '@storybook/preact-vite';
import { mergeConfig } from 'vite';
import { checker } from 'vite-plugin-checker';
import { getEnvironment } from '../envs/getEnvs';
import { realApiProxies } from '../endpoints/realApiProxies';

const config: StorybookConfig = {
    stories: ['../stories/**/*.stories.*'],
    staticDirs: ['../static'],
    addons: ['@storybook/addon-essentials'],
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
