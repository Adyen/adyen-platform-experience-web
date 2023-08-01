import { StorybookConfig } from '@storybook/preact-vite';
import { mergeConfig } from 'vite';
import { realApiProxies } from '../src/endpoints/apis/realApiProxies';
import { getEnvironment } from '../../../envs/getEnvs';

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
        });
    },
};

export default config;
