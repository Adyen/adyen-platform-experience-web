import { StorybookConfig } from '@storybook/preact-vite';
import { mergeConfig } from 'vite';
import { realApiProxies } from '../src/endpoints/apis/realApiProxies';
import { getEnvironment } from '../../../envs/getEnvs';
import { checker } from 'vite-plugin-checker';

const config: StorybookConfig = {
    stories: ['../src/stories/**/*.stories.*'],
    addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
    framework: {
        name: '@storybook/preact-vite',
        options: {},
    },
    async viteFinal(config) {
        const { apiConfigs } = getEnvironment(process.env.VITE_MODE ?? 'development');

        return mergeConfig(config, {
            server: {
                proxy: realApiProxies(apiConfigs),
            },
            plugins: [
                process.env.VITE_MODE &&
                    ['mocked', 'development'].includes(process.env.VITE_MODE) &&
                    checker({
                        stylelint: {
                            lintCommand: 'stylelint ../src/**/*.scss',
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
