import { defineConfig } from 'vite';
import { preact } from '@preact/preset-vite';
import { resolve } from 'node:path';
import { lstat, readdir } from 'node:fs/promises';
import { mockApiProxies, mockServerPlugin } from './packages/server/proxy/mockApiProxies';
import { getEnvironment } from './envs/getEnvs';
import { realApiProxies } from './packages/server/proxy/realApiProxies';
import { checker } from 'vite-plugin-checker';
import version from './packages/lib/config/version';
import packageJson from './packages/lib/package.json';

const currentVersion = version();

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

const externalDependencies = Object.keys(packageJson.dependencies);

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
                          formats: ['cjs', 'es'],
                          fileName: format => `adyen-fp-components.${format}.js`,
                      },
                      minify: true,
                      rollupOptions: { external: externalDependencies },
                      outDir: resolve(__dirname, 'packages', 'lib', 'dist'),
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
            'process.env.VITE_VERSION': JSON.stringify(currentVersion.ADYEN_FP_VERSION),
            'process.env.VITE_COMMIT_HASH': JSON.stringify(currentVersion.COMMIT_HASH),
            'process.env.VITE_COMMIT_BRANCH': JSON.stringify(currentVersion.COMMIT_BRANCH),
            'process.env.VITE_ADYEN_BUILD_ID': JSON.stringify(currentVersion.ADYEN_BUILD_ID),
        },
    };
});
