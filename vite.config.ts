// eslint-disable import/no-extraneous-dependencies
import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { preact } from '@preact/preset-vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { realApiProxies } from './endpoints/realApiProxies';
import { getEnvironment } from './envs/getEnvs';
import packageJson from './package.json';
import version from './config/version';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ mode }) => {
    const currentVersion = version();
    const externalDependencies = Object.keys(packageJson.dependencies);
    const isAnalyseMode = mode === 'analyse';
    const isDevMode = mode === 'development';

    const { apiConfigs, playground } = getEnvironment(mode);

    return {
        build: {
            minify: true,
            lib: {
                name: 'AdyenPlatformExperienceWeb',
                entry: resolve(__dirname, './src/index.ts'),
                fileName: (format, entryName) => {
                    return entryName.includes('node_modules')
                        ? `${format}/${entryName.replace('node_modules', 'external')}.js`
                        : `${format}/${entryName}.js`;
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
            outDir: resolve(__dirname, './dist'),
            emptyOutDir: true,
        },
        css: {
            preprocessorOptions: {
                scss: {
                    api: 'modern-compiler',
                    silenceDeprecations: ['legacy-js-api'],
                },
            },
        },
        define: {
            'process.env.VITE_VERSION': JSON.stringify(currentVersion.ADYEN_FP_VERSION),
            'process.env.VITE_COMMIT_HASH': JSON.stringify(currentVersion.COMMIT_HASH),
            'process.env.VITE_COMMIT_BRANCH': JSON.stringify(currentVersion.COMMIT_BRANCH),
            'process.env.VITE_ADYEN_BUILD_ID': JSON.stringify(currentVersion.ADYEN_BUILD_ID),
            'process.env.VITE_LOADING_CONTEXT': JSON.stringify(
                isDevMode ? playground.loadingContext || null : null
            ),
            'process.env.SESSION_AUTO_REFRESH': JSON.stringify(
                isDevMode ? apiConfigs.sessionApi.autoRefresh || JSON.stringify(null) : undefined
            ),
            'process.env.SESSION_MAX_AGE_MS': JSON.stringify(
                isDevMode ? apiConfigs.sessionApi.maxAgeMs || JSON.stringify(null) : undefined
            ),
            'process.env.VITE_MODE': JSON.stringify(process.env.VITE_MODE ?? mode),
            'process.env.VITE_PLAYGROUND_PORT': JSON.stringify(playground.port || null),
            'process.env.DEPLOYED_URL': JSON.stringify(process.env.DEPLOY_PRIME_URL || null),
            'process.env.VITE_PLAYGROUND_URL': JSON.stringify(
                process.env.DEPLOY_PRIME_URL?.replace('main--', '') || playground.playgroundUrl || null
            ),
            'process.env.SESSION_ACCOUNT_HOLDER': JSON.stringify(apiConfigs.sessionApi.accountHolder || null),
            'process.env.SESSION_PERMISSIONS': JSON.stringify(apiConfigs.sessionApi.permissions || null),
            'process.env.TEST_ENV': JSON.stringify(process.env.TEST_ENV),
        },
        json: {
            stringify: true,
        },
        preview: {
            host: playground.host,
            port: playground.port,
            proxy: undefined,
        },
        server: {
            host: playground.host,
            port: playground.port,
            proxy: realApiProxies(apiConfigs, mode),
        },
        test: {
            root: resolve(__dirname, './src'),
            setupFiles: [resolve(__dirname, './config/setupTests.ts')],
            coverage: {
                provider: 'v8',
                all: true,
                include: [
                    'components/internal/**/*.{ts,tsx}',
                    'components/utils/*.{ts,tsx}',
                    'hooks/**/*.{ts,tsx}',
                    'primitives/**/*.{ts,tsx}',
                    'utils/**/*.{ts,tsx}',
                    'core/**/*.{ts,tsx}',
                ],
                exclude: ['**/index.{ts,tsx}', '**/constants.{ts,tsx}', '**/types.ts', 'node_modules'],
                reporter: ['lcov', 'text'],
                reportsDirectory: resolve(__dirname, 'coverage'),
            },
            sequence: {
                hooks: 'parallel',
            },
        },
        plugins: [
            svgr({
                svgrOptions: { jsxRuntime: 'automatic', exportType: 'default' },
                esbuildOptions: { jsx: 'automatic' },
                include: '**/*.svg?component',
            }),
            preact(),
            isAnalyseMode &&
                visualizer({
                    title: 'Adyen Platform bundle visualizer',
                    gzipSize: true,
                    open: true,
                }),
        ],
    };
});
