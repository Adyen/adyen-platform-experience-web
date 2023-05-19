import { defineConfig } from 'vite';
import { preact } from '@preact/preset-vite';
import { resolve } from 'node:path';
import { lstat, readdir } from 'node:fs/promises';
import { mockApiProxies, mockServerPlugin } from './packages/server/proxy/mockApiProxies';
import { getEnvironment } from './envs/getEnvs';
import { realApiProxies } from './packages/server/proxy/realApiProxies';

const playgroundDir = resolve(__dirname, 'packages/playground/src/pages');
async function getPlaygroundEntrypoints() {
    const playgroundPages = await readdir(playgroundDir);

    const entries = await Promise.all(
        playgroundPages.map(async page => {
            if (!(await lstat(resolve(playgroundDir, page))).isDirectory()) return;

            return [page, resolve(playgroundDir, page, 'index.html')];
        })
    );

    return {
        ...Object.fromEntries(entries.filter(Boolean)),
        index: resolve(playgroundDir, 'index.html'),
    };
}

export default defineConfig(async ({ mode }) => {
    const { lemApi, BTLApi, BCLApi, playground, mockServer } = getEnvironment(mode);

    return {
        root: playgroundDir,
        base: './',
        plugins: [preact(), mode === 'mocked' && mockServerPlugin(8082)],
        build: {
            rollupOptions: {
                input: await getPlaygroundEntrypoints(),
            },
            outDir: resolve(__dirname, '.demo'),
            emptyOutDir: true,
        },
        resolve: {
            alias: {
                '@adyen/adyen-fp-web': resolve(__dirname, 'packages/lib/src'),
            },
        },
        css: {
            preprocessorOptions: {
                scss: {},
            },
        },
        server: {
            host: 'localhost',
            port: 3030,
            https: false,
            proxy:
                mode === 'mocked' ? mockApiProxies('localhost', 8082) : mode === 'development' ? realApiProxies(lemApi, BTLApi, BCLApi) : undefined,
        },
        preview: {
            host: 'localhost',
            port: 3030,
            proxy: mockApiProxies('localhost', 8082),
        },
        define: {
            'process.env.VITE_BALANCE_PLATFORM': JSON.stringify(BTLApi.balancePlatform || null),
        },
    };
});
