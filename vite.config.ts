// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig, type PluginOption } from 'vite';
import { resolve } from 'node:path';
import version from './config/version';
import packageJson from './package.json';
import demoPackageJson from './demo/package.json';
// eslint-disable-next-line import/no-extraneous-dependencies
import { visualizer } from 'rollup-plugin-visualizer';
import { lstat, readdir } from 'node:fs/promises';
import { getEnvironment } from './envs/getEnvs';
// eslint-disable-next-line import/no-extraneous-dependencies
import { preact } from '@preact/preset-vite';
// eslint-disable-next-line import/no-extraneous-dependencies
import { checker } from 'vite-plugin-checker';
import { realApiProxies } from './endpoints/realApiProxies';
import svgr from 'vite-plugin-svgr';
const currentVersion = version();
const externalDependencies = Object.keys(packageJson.dependencies);

const playgroundDir = resolve(__dirname, 'demo/pages');
const demoPlaygroundDir = resolve(__dirname, 'demo');
const isDevMode = (mode: any) => ['mocked', 'development', 'local-env'].includes(mode);

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
        index: resolve(playgroundDir, '..', 'index.html'),
    };
}

export default defineConfig(async ({ mode }) => {
    const isAnalyseMode = mode === 'analyse';
    const { apiConfigs, playground } = getEnvironment(mode);
    return {
        root: mode === 'demo' ? demoPlaygroundDir : './playground',
        base: '',
        json: {
            stringify: true,
        },
        css: {
            preprocessorOptions: {
                scss: {
                    api: 'modern-compiler',
                    silenceDeprecations: ['legacy-js-api'],
                },
            },
        },
        build:
            mode === 'demo'
                ? {
                      outDir: resolve(__dirname, '.demo'),
                      emptyOutDir: true,
                      target: 'esnext',
                      rollupOptions: {
                          input: await getPlaygroundEntrypoints(),
                      },
                      minify: false,
                  }
                : {
                      minify: true,
                      lib: {
                          name: 'AdyenPlatformExperienceWeb',
                          entry: resolve(__dirname, './src/index.ts'),
                          fileName: (format, entryName) => {
                              if (entryName.includes('node_modules')) {
                                  return `${format}/${entryName.replace('node_modules', 'external')}.js`;
                              }
                              return `${format}/${entryName}.js`;
                          },
                      },
                      rollupOptions: {
                          external: externalDependencies,
                          output: [
                              {
                                  format: 'es',
                                  preserveModules: true,
                                  preserveModulesRoot: 'src',
                                  sourcemap: false,
                                  indent: false,
                              },
                              { format: 'cjs', sourcemap: true, indent: false },
                          ],
                      },
                      outDir: resolve(__dirname, '.', 'dist'),
                      emptyOutDir: true,
                  },
        define: {
            'process.env.VITE_VERSION': JSON.stringify(currentVersion.ADYEN_FP_VERSION),
            'process.env.VITE_COMMIT_HASH': JSON.stringify(currentVersion.COMMIT_HASH),
            'process.env.VITE_COMMIT_BRANCH': JSON.stringify(currentVersion.COMMIT_BRANCH),
            'process.env.VITE_ADYEN_BUILD_ID': JSON.stringify(currentVersion.ADYEN_BUILD_ID),
            'process.env.VITE_LOADING_CONTEXT': JSON.stringify(
                mode === 'development' || mode === 'local-env' ? playground.loadingContext || null : null
            ),
            'process.env.SESSION_AUTO_REFRESH': JSON.stringify(
                isDevMode(mode) ? apiConfigs.sessionApi.autoRefresh || JSON.stringify(null) : undefined
            ),
            'process.env.SESSION_MAX_AGE_MS': JSON.stringify(isDevMode(mode) ? apiConfigs.sessionApi.maxAgeMs || JSON.stringify(null) : undefined),
            'process.env.VITE_MODE': JSON.stringify(process.env.VITE_MODE ?? mode),
            'process.env.VITE_PLAYGROUND_PORT': JSON.stringify(playground.port || null),
            'process.env.DEPLOYED_URL': JSON.stringify(process.env.DEPLOY_PRIME_URL || null),
            'process.env.VITE_PLAYGROUND_URL': JSON.stringify(
                process.env.DEPLOY_PRIME_URL?.replace('chore-level-access-demo-', '') || playground.playgroundUrl || null
            ),
            'process.env.E2E_TEST': JSON.stringify(process.env.E2E_TEST),
            'process.env.SESSION_ACCOUNT_HOLDER': JSON.stringify(apiConfigs.sessionApi.accountHolder || null),
            'process.env.SESSION_PERMISSIONS': JSON.stringify(apiConfigs.sessionApi.permissions || null),
        },
        test: {
            root: resolve(__dirname, './src'),
            setupFiles: [resolve(__dirname, './config/setupTests.ts')],
            coverage: {
                provider: 'c8',
                all: true,
                include: [
                    'src/components/internal/**/*.{ts,tsx}',
                    'src/components/utils/*.{ts,tsx}',
                    'src/hooks/**/*.{ts,tsx}',
                    'src/primitives/**/*.{ts,tsx}',
                    'src/utils/**/*.{ts,tsx}',
                    'src/core/**/*.{ts,tsx}',
                ],
                exclude: ['src/**/index.{ts,tsx}', 'src/**/constants.{ts,tsx}', 'src/**/types.ts', 'node_modules'],
                reporter: 'lcov',
                reportsDirectory: resolve(__dirname, 'coverage'),
            },
        },
        server: {
            host: playground.host,
            port: playground.port,
            https: false,
            proxy: mode === 'mocked' ? undefined : realApiProxies(apiConfigs, mode),
        },
        preview: {
            host: playground.host,
            port: playground.port,
            proxy: undefined,
        },
        plugins: [
            svgr({
                svgrOptions: { jsxRuntime: 'automatic', exportType: 'default' },
                esbuildOptions: { jsx: 'automatic' },
                include: '**/*.svg?component',
            }),
            preact(),
            isDevMode(mode)
                ? checker({
                      stylelint: {
                          lintCommand: 'stylelint ../src/**/*.scss',
                      },
                  })
                : undefined,
            isAnalyseMode &&
                (visualizer({
                    title: 'Adyen Platform bundle visualizer',
                    gzipSize: true,
                    open: true,
                }) as PluginOption),
        ],
    };
});
