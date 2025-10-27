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
    const isUmdBuild = mode === 'umd';
    const isTestEnv = process.env.TEST_ENV === '1';

    const { api, app } = getEnvironment(mode);

    const assetsDir = resolve(__dirname, 'src/assets');
    const enUsFile = resolve(assetsDir, 'translations/en-US.json');
    const translationsDir = resolve(__dirname, 'src/translations');
    const translationsIndexFile = resolve(translationsDir, 'index.ts');
    const translationsLocalFile = resolve(translationsDir, 'local.ts');

    const shouldExcludeAsset = (id: string) => {
        if (!isUmdBuild && externalDependencies.includes(id)) {
            return true;
        }

        // Allow specific files from assets to be bundled.
        if (id === enUsFile || id === translationsIndexFile) {
            return false;
        }

        // Exclude all other files from the assets directory.
        if (id === translationsLocalFile || id.startsWith(assetsDir)) {
            return true;
        }

        return false;
    };

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
                external: shouldExcludeAsset,
                output: [
                    {
                        format: 'es',
                        preserveModules: !isUmdBuild,
                        preserveModulesRoot: 'src',
                        sourcemap: false,
                        indent: false,
                    },
                    isUmdBuild
                        ? {
                              name: 'AdyenPlatformExperienceWeb',
                              format: 'umd',
                              sourcemap: true,
                              indent: false,
                              globals: {
                                  classnames: 'cx',
                                  'core-js': 'core',
                              },
                          }
                        : { format: 'cjs', sourcemap: true, indent: false },
                ],
            },
            outDir: resolve(__dirname, './dist'),
            emptyOutDir: !isUmdBuild,
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
            'process.env.VITE_APP_PORT': JSON.stringify(app.port || null),
            'process.env.VITE_APP_URL': JSON.stringify(process.env.DEPLOY_PRIME_URL?.replace('main--', '') || app.url || null),
            'process.env.VITE_APP_LOADING_CONTEXT': JSON.stringify(isDevMode ? app.loadingContext || null : null),
            'process.env.VITE_LOCAL_ASSETS': JSON.stringify(process.env.USE_CDN == 'true' ? null : isDevMode || isTestEnv),
            'process.env.VITE_BUILD_ID': JSON.stringify(currentVersion.ADYEN_BUILD_ID),
            'process.env.VITE_COMMIT_BRANCH': JSON.stringify(currentVersion.COMMIT_BRANCH),
            'process.env.VITE_COMMIT_HASH': JSON.stringify(currentVersion.COMMIT_HASH),
            'process.env.VITE_MODE': JSON.stringify(process.env.VITE_MODE ?? mode),
            'process.env.VITE_VERSION': JSON.stringify(currentVersion.ADYEN_FP_VERSION),
            'process.env.SESSION_ACCOUNT_HOLDER': JSON.stringify(api.session.accountHolder || null),
            'process.env.SESSION_AUTO_REFRESH': JSON.stringify(isDevMode ? api.session.autoRefresh || null : undefined),
            'process.env.SESSION_MAX_AGE_MS': JSON.stringify(isDevMode ? api.session.maxAgeMs || null : undefined),
            'process.env.SESSION_PERMISSIONS': JSON.stringify(api.session.permissions || null),
            'process.env.TEST_ENV': JSON.stringify(process.env.TEST_ENV),
            'process.env.USE_CDN': JSON.stringify(app.useCdn ?? null),
            'process.env.VITE_TEST_CDN_ASSETS': JSON.stringify(isDevMode || app.useTestCdn ? true : null),
        },
        json: {
            stringify: true,
        },
        preview: {
            host: app.host,
            port: app.port,
            proxy: undefined,
        },
        server: {
            host: app.host,
            port: app.port,
            proxy: realApiProxies(api, mode),
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
                reporter: ['lcov', 'text', 'json-summary', 'json'],
                reportsDirectory: resolve(__dirname, 'coverage'),
                // Uncomment next line once we reach 80% of coverage
                //thresholds: 80,
                reportOnFailure: true,
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
