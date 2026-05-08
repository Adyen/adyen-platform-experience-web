import vue from '@vitejs/plugin-vue';
import { mergeConfig } from 'vite';
import { resolve } from 'node:path';
import { getEnvironment } from '../../../../../../envs/getEnvs.ts';
import { getBaseEnvDefines } from '../../../../../../config/defines/base-env.ts';
import { realApiProxies } from '../../../../../../endpoints/realApiProxies.js';
import type { StorybookConfig } from '@storybook/vue3-vite';

const root = '../../../../../..';
const rootDir = resolve(import.meta.dirname, root);

const config: StorybookConfig = {
    // Framework-scoped under {domain}/vue
    // The framework split is at the top level of each domain.
    stories: [`${root}/packages/domains/*/vue/stories/**/*.stories.*`],
    staticDirs: ['../../../static'],
    framework: {
        name: '@storybook/vue3-vite',
        options: {},
    },
    async viteFinal(config) {
        const mode = process.env.VITE_MODE ?? 'development';
        const { api } = getEnvironment(mode);

        return mergeConfig(config, {
            define: getBaseEnvDefines(mode),
            plugins: [vue()],
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
        });
    },
};

export default config;
