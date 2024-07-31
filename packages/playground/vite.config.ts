import { defineConfig } from 'vite';
import { preact } from '@preact/preset-vite';
import { resolve } from 'node:path';
import { lstat, readdir } from 'node:fs/promises';
import { getEnvironment } from '../../envs/getEnvs';
import { realApiProxies } from './src/endpoints/apis/realApiProxies';
import { checker } from 'vite-plugin-checker';

const playgroundDir = resolve(__dirname, 'src/pages');
const demoPlaygroundDir = resolve(__dirname, './');
async function getPlaygroundEntrypoints() {
    const playgroundPages = await readdir(playgroundDir);

    const entries = await Promise.all(
        playgroundPages.map(async page => {
            if (!(await lstat(resolve(playgroundDir, page))).isDirectory()) return;

            return [page, resolve(playgroundDir, page, 'index.html')];
        })
    );
    const availableEntries: string[][] = entries.filter((entry): entry is string[] => Boolean(entry));
    return {
        ...Object.fromEntries(availableEntries),
        index: resolve(playgroundDir, '..', '..', 'index.html'),
    };
}

export default defineConfig(async ({ mode }) => {
    const { apiConfigs, playground } = getEnvironment(mode);
    return {
        root: mode === 'demo' ? demoPlaygroundDir : undefined,
        base: './',
        plugins: [
            preact(),
            ['mocked', 'development'].includes(mode)
                ? checker({
                      stylelint: {
                          lintCommand: 'stylelint ../lib/src/**/*.scss',
                      },
                  })
                : undefined,
        ],
        build:
            mode === 'demo'
                ? {
                      outDir: resolve(__dirname, '.demo'),
                      emptyOutDir: true,
                      target: 'esnext',
                      rollupOptions: {
                          input: await getPlaygroundEntrypoints(),
                      },
                      minify: true,
                  }
                : undefined,
        resolve: {
            alias: {
                '@adyen/adyen-platform-experience-web': resolve(__dirname, '../lib/src'),
                '@src': resolve(__dirname, '../lib/src'),
                '@styles': resolve(__dirname, '../lib/src/style'),
            },
        },
        server: {
            host: playground.host,
            port: playground.port,
            https: false,
            proxy: mode === 'mocked' ? undefined : realApiProxies(apiConfigs),
            watch: {
                ignored: ['!**/node_modules/@adyen/adyen-platform-experience-web/**'],
            },
        },
        optimizeDeps: {
            exclude: ['@adyen/adyen-platform-experience-web'],
        },
        preview: {
            host: playground.host,
            port: playground.port,
            proxy: undefined,
        },
        define: {
            'process.env.VITE_MODE': JSON.stringify(process.env.VITE_MODE ?? mode),
            'process.env.VITE_PLAYGROUND_PORT': JSON.stringify(playground.port || null),
            'process.env.DEPLOYED_URL': JSON.stringify(process.env.DEPLOY_PRIME_URL || null),
            'process.env.VITE_PLAYGROUND_URL': JSON.stringify(
                process.env.DEPLOY_PRIME_URL?.replace('main--', '') || playground.playgroundUrl || null
            ),
            'process.env.VITE_LOADING_CONTEXT': JSON.stringify(playground.loadingContext || null),
            'process.env.E2E_TEST': JSON.stringify(process.env.E2E_TEST),
            'process.env.SESSION_ACCOUNT_HOLDER': JSON.stringify(apiConfigs.sessionApi.accountHolder || null),
            'process.env.SESSION_PERMISSIONS': JSON.stringify(apiConfigs.sessionApi.permissions || null),
            'process.env.SESSION_AUTO_REFRESH': apiConfigs.sessionApi.autoRefresh || JSON.stringify(null),
            'process.env.SESSION_MAX_AGE_MS': apiConfigs.sessionApi.maxAgeMs || JSON.stringify(null),
        },
    };
});
