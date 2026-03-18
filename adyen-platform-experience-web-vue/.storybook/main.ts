import { StorybookConfig } from '@storybook/vue3-vite';
import { fileURLToPath, URL } from 'node:url';
import { getEnvironment } from '../envs/getEnvs.ts';
import { realApiProxies } from '../../endpoints/realApiProxies';

const config: StorybookConfig = {
    stories: ['../stories/**/*.stories.*'],
    staticDirs: ['../../static'],
    framework: {
        name: '@storybook/vue3-vite',
        options: {},
    },
    async viteFinal(config) {
        const mode = process.env.VITE_MODE ?? 'development';
        const { api, app } = getEnvironment(mode);

        const removeInspect = (plugins: any[]): any[] =>
            plugins.flat(Infinity).filter((p: any) => !(p && typeof p === 'object' && p.name === 'vite-plugin-inspect'));
        config.plugins = removeInspect(config.plugins ?? []);

        config.resolve = {
            ...config.resolve,
            alias: {
                ...(config.resolve?.alias as Record<string, string>),
                '@': fileURLToPath(new URL('../src', import.meta.url)),
            },
        };

        config.server = {
            ...config.server,
            proxy: { ...config.server?.proxy, ...realApiProxies(api, mode) },
        };

        config.define = {
            ...config.define,
            'process.env.VITE_APP_PORT': JSON.stringify(app.port || null),
            'process.env.VITE_APP_URL': JSON.stringify(app.url || null),
            'process.env.VITE_APP_LOADING_CONTEXT': JSON.stringify(app.loadingContext || null),
            'process.env.VITE_LOCAL_ASSETS': JSON.stringify(process.env.USE_CDN === 'true' ? null : true),
            'process.env.VITE_VERSION': JSON.stringify('1.0.0'),
            'process.env.SESSION_ACCOUNT_HOLDER': JSON.stringify(api.session.accountHolder || null),
            'process.env.SESSION_AUTO_REFRESH': JSON.stringify(api.session.autoRefresh === 'true' || null),
            'process.env.SESSION_MAX_AGE_MS': JSON.stringify(api.session.maxAgeMs || null),
            'process.env.SESSION_PERMISSIONS': JSON.stringify(api.session.permissions || null),
            'process.env.USE_CDN': JSON.stringify(app.useCdn ?? null),
            'process.env.VITE_TEST_CDN_ASSETS': JSON.stringify(app.useTestCdn ? true : null),
            'process.env.NODE_ENV': JSON.stringify(mode),
        };

        config.build = {
            ...config.build,
            target: 'esnext',
            chunkSizeWarningLimit: 800,
            rollupOptions: {
                ...config.build?.rollupOptions,
                output: {
                    ...(config.build?.rollupOptions?.output as object),
                    experimentalMinChunkSize: 10_000,
                },
            },
        };

        return config;
    },
};

export default config;
