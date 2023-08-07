import { StorybookConfig } from '@storybook/preact-vite';
import { mergeConfig } from 'vite';
import { realApiProxies } from '../src/endpoints/apis/realApiProxies';
import { getEnvironment } from '../../../envs/getEnvs';
import { preact } from '@preact/preset-vite';
import { checker } from 'vite-plugin-checker';

const config: StorybookConfig = {
    stories: ['../src/stories/**/*.stories.*'],
    addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
    framework: {
        name: '@storybook/preact-vite',
        options: {},
    },
    staticDirs: [{ from: '../../../mocks', to: '/static' }],
    async viteFinal(config) {
        const { lemApi, BTLApi, BCLApi, playground, mockServer } = getEnvironment('development');
        return mergeConfig(config, {
            server: {
                proxy: realApiProxies(lemApi, BTLApi, BCLApi),
            },
            plugins: [
                (process.env.VITE_MODE === 'mocked' || process.env.VITE_MODE === 'development') &&
                    checker({
                        stylelint: {
                            lintCommand: 'stylelint ../lib/src/**/*.scss',
                        },
                    }),
            ],
        });
    },
};

export default config;
