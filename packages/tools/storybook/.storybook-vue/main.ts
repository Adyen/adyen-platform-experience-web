import vue from '@vitejs/plugin-vue';
import { mergeConfig } from 'vite';
import { resolve } from 'node:path';
import { getEnvironment } from '../../../../envs/getEnvs.ts';
import { getBaseEnvDefines } from '../../../../config/defines/base-env.ts';
import { realApiProxies } from '../../../../endpoints/realApiProxies.js';
import type { StorybookConfig } from '@storybook/vue3-vite';

const rootDir = resolve(import.meta.dirname, '../../../..');

const config: StorybookConfig = {
    // Framework-scoped under {domain}/vue/ — the preact/vue split is at the top level
    // of each domain. Phase 1 ships a single placeholder smoke under
    // packages/domains/reports/vue/stories/. Real domain Vue stories land in 04-03.
    stories: ['../../../../packages/domains/*/vue/stories/**/*.stories.*'],
    staticDirs: ['../static'],
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
