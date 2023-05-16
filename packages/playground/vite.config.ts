import { defineConfig } from 'vite';
import { preact } from '@preact/preset-vite';
import { resolve } from 'node:path';
import { lstat, readdir } from 'node:fs/promises';
import { mockApiProxies, mockServerPlugin } from './config/proxy/mockApiProxies';

const playgroundDir = resolve(__dirname, 'src/pages');
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
    const isDev = mode === 'development';
    return {
        root: playgroundDir,
        base: '',
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
                '@adyen/adyen-fp-web': resolve(__dirname, '../lib/src'),
            },
            preserveSymlinks: true,
        },
        css: {
            preprocessorOptions: {
                scss: {},
            },
        },
        server: {
            host: 'localhost',
            port: 3030,
            proxy: mockApiProxies('localhost', 8082),
        },
        preview: {
            host: 'localhost',
            port: 3030,
            proxy: mockApiProxies('localhost', 8082),
        },
        define: {
            'process.env.__CLIENT_KEY__': JSON.stringify(process.env.CLIENT_KEY || null),
            'process.env.__CLIENT_ENV__': JSON.stringify(process.env.CLIENT_ENV || 'test'),
        },
    };
});
