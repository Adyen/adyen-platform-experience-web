import { defineConfig, type PluginOption } from 'vite';
import { resolve } from 'node:path';
import version from './version';
import packageJson from '../package.json';

const currentVersion = version();
const externalDependencies = Object.keys(packageJson.dependencies);

export default defineConfig(async ({ mode }) => {
    const isAnalyseMode = mode === 'analyse';

    return {
        resolve: {
            alias: {
                '@src': resolve(__dirname, '../src'),
                '@styles': resolve(__dirname, '../src/style'),
            },
        },
        build: {
            lib: {
                name: 'AdyenFPComponents',
                entry: resolve(__dirname, '../src/index.ts'),
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
            outDir: resolve(__dirname, '..', 'dist'),
            emptyOutDir: true,
        },
        define: {
            'process.env.VITE_VERSION': JSON.stringify(currentVersion.ADYEN_FP_VERSION),
            'process.env.VITE_COMMIT_HASH': JSON.stringify(currentVersion.COMMIT_HASH),
            'process.env.VITE_COMMIT_BRANCH': JSON.stringify(currentVersion.COMMIT_BRANCH),
            'process.env.VITE_ADYEN_BUILD_ID': JSON.stringify(currentVersion.ADYEN_BUILD_ID),
        },
        test: {
            root: resolve(__dirname, '../src'),
            setupFiles: [resolve(__dirname, '../config/setupTests.ts')],
            coverage: {
                provider: 'v8',
                reporter: 'lcov',
                reportsDirectory: resolve(__dirname, '../../../coverage'),
            },
        },
        plugins: [
            isAnalyseMode &&
                ((await import('rollup-plugin-visualizer')).visualizer({
                    title: 'Adyen Platform bundle visualizer',
                    gzipSize: true,
                    open: true,
                }) as PluginOption),
        ],
    };
});
