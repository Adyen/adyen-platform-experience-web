import type { StorybookConfig } from '@storybook/vue3-vite';
import { mergeConfig } from 'vite';
import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { getEnvironment } from '../../../../../../envs/getEnvs';
import { realApiProxies } from '../../../../../../endpoints/realApiProxies.js';
import { getBaseEnvDefines } from '../../../../../../config/defines/base-env';

const root = '../../../../../..';
const rootDir = resolve(import.meta.dirname, root);

const config: StorybookConfig = {
    // Framework-scoped under {domain}/vue/ — the preact/vue split is at the top level
    // of each domain. Phase 1 ships a single placeholder smoke under
    // packages/domains/reports/vue/stories/. Real domain Vue stories land in 04-03.
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
            // Force @vitejs/plugin-vue into the `pre` phase so SFCs are
            // compiled to JS before Storybook's vue-component-meta docgen
            // plugin runs. The docgen plugin appends metadata to whatever it
            // receives; if it runs on the raw SFC first, plugin-vue then re-
            // parses a corrupted source and fails with "Element is missing
            // end tag".
            plugins: [
                ...(() => {
                    const result = vue();
                    const list = Array.isArray(result) ? result : [result];
                    return list.map(p => ({ ...(p as any), enforce: 'pre' as const }));
                })(),
            ],
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
