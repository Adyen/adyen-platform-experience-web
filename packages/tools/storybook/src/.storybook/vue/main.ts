import type { StorybookConfig } from '@storybook/vue3-vite';
import { mergeConfig } from 'vite';
import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { getEnvironment } from '../../../../../../envs/getEnvs.ts';
import { realApiProxies } from '../../../../../../endpoints/realApiProxies.js';
import { getBaseEnvDefines } from '../../../../../../config/defines/base-env.ts';

const root = '../../../../../..';
const rootDir = resolve(import.meta.dirname, root);
const isKycCustomElement = (tag: string) => tag === 'adyen-business-financing' || tag === 'adyen-terms-of-service-management';

const config: StorybookConfig = {
    stories: [`${root}/packages/domains/*/vue/stories/**/*.stories.*`],
    staticDirs: [
        '../../../static',
        { from: resolve(rootDir, 'packages/shared/assets/src/datasets'), to: '/datasets' },
        { from: resolve(rootDir, 'packages/shared/assets/src'), to: '/src/assets' },
    ],
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
                    const result = vue({
                        template: {
                            compilerOptions: {
                                isCustomElement: isKycCustomElement,
                            },
                        },
                    });
                    const list = Array.isArray(result) ? result : [result];
                    return list.map(p => ({ ...(p as any), enforce: 'pre' as const }));
                })(),
            ],
            resolve: {
                alias: {
                    msw: resolve(rootDir, 'packages/tools/storybook/node_modules/msw'),
                    'msw-storybook-addon': resolve(rootDir, 'packages/tools/storybook/node_modules/msw-storybook-addon'),
                    vue: resolve(rootDir, 'packages/tools/storybook/node_modules/vue'),
                    'vue-i18n': resolve(rootDir, 'packages/tools/storybook/node_modules/vue-i18n'),
                },
            },
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
