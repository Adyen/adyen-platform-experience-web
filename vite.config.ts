import { defineConfig } from 'vite';
import { preact } from '@preact/preset-vite';
import { resolve } from 'node:path';
import { lstat, readdir } from 'node:fs/promises';
import { mockApiProxies, mockServerPlugin } from './packages/server/proxy/mockApiProxies';
import { getEnvironment } from './envs/getEnvs';
import { realApiProxies } from './packages/server/proxy/realApiProxies';
import { checker } from 'vite-plugin-checker';

const playgroundDir = resolve(__dirname, 'packages/playground/src/pages');
const demoPlaygroundDir = resolve(__dirname, 'packages/playground/');
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
    const { lemApi, BTLApi, BCLApi, playground, mockServer } = getEnvironment(mode);
    return {
        root: mode === 'demo' ? demoPlaygroundDir : undefined,
        base: './',
        plugins: [
            preact(),
            (mode === 'mocked' || mode === 'development') &&
                checker({
                    stylelint: {
                        lintCommand: 'stylelint ../lib/src/**/*.scss',
                    },
                }),
            (mode === 'mocked' || mode === 'demo') && mockServerPlugin(mockServer.port),
        ],
        build:
            mode === 'demo'
                ? {
                      rollupOptions: {
                          input: await getPlaygroundEntrypoints(),
                      },
                      outDir: resolve(__dirname, '.demo'),
                      emptyOutDir: true,
                      target: 'esnext',
                  }
                : {
                      lib: {
                          name: 'AdyenFPComponents',
                          entry: resolve(__dirname, './packages/lib/src/index.ts'),
                          formats: ['umd'],
                          fileName: format => `adyen-fp-components.${format}.js`,
                      },
                      minify: false,
                      rollupOptions: {
                          output: {
                              inlineDynamicImports: false,
                              manualChunks: () => 'app',
                          },
                      },
                      outDir: resolve(__dirname, 'dist'),
                      emptyOutDir: false,
                  },
        resolve: {
            alias: {
                '@adyen/adyen-fp-web': resolve(__dirname, 'packages/lib/src'),
                '@src': resolve(__dirname, 'packages/lib/src'),
            },
        },
        css: {
            modules: {
                scopeBehaviour: 'local',
                generateScopedName: name => name,
            },
        },
        server: {
            host: playground.host,
            port: playground.port,
            https: false,
            proxy:
                mode === 'mocked'
                    ? mockApiProxies('localhost', mockServer.port)
                    : mode === 'development'
                    ? realApiProxies(lemApi, BTLApi, BCLApi)
                    : undefined,
        },
        preview: {
            host: playground.host,
            port: playground.port,
            proxy: mockApiProxies('localhost', mockServer.port),
        },
        define: {
            'process.env.VITE_BALANCE_PLATFORM': JSON.stringify(BTLApi.balancePlatform || null),
        },
    };
});
