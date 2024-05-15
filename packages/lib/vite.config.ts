import { defineConfig, type PluginOption } from 'vite';
import { resolve, relative, extname } from 'node:path';
import version from './config/version';
import packageJson from './package.json';
import { libInjectCss } from './config/inject-css';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const currentVersion = version();
const externalDependencies = Object.keys(packageJson.dependencies);

export default defineConfig(async ({ mode }) => {
    const isAnalyseMode = mode === 'analyse';
    const isESM = mode === 'esm';

    const esmInput = Object.fromEntries(
        glob
            .sync('src/**/*.{ts,tsx}', {
                ignore: ['**/*.d.ts', '**/node_modules/**', '**/types/**/*'],
            })
            .filter(filePath => !filePath.includes('types'))
            .map(file => {
                return [
                    // 1. The name of the entry point
                    // lib/nested/foo.js becomes nested/foo
                    relative('src', file.slice(0, file.length - extname(file).length)),

                    // 2. The absolute path to the entry file
                    // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
                    fileURLToPath(new URL(file, import.meta.url)),
                ];
            })
    );

    return {
        resolve: {
            alias: {
                '@styles': resolve(__dirname, './src/style'),
            },
        },
        build: {
            minify: false,
            lib: {
                name: 'AdyenPlatformExperienceWeb',
                entry: resolve(__dirname, './src/index.ts'),
                fileName: (format, entryName) => {
                    if (entryName.includes('node_modules')) {
                        return `${format}/${entryName.replace('node_modules', 'external')}.js`;
                    }
                    return isESM ? `${format}/${entryName}.js` : `${entryName}.js`;
                },
            },
            rollupOptions: {
                external: externalDependencies,
                input: isESM ? esmInput : undefined,
                output: [
                    isESM
                        ? {
                              format: 'es',
                              sourcemap: false,
                              indent: false,
                          }
                        : { format: 'cjs', sourcemap: true, indent: false },
                ],
            },
            outDir: isESM ? resolve(__dirname, '.', 'dist') : resolve(__dirname, '.', 'dist', 'cjs'),
            emptyOutDir: true,
        },
        define: {
            'process.env.VITE_VERSION': JSON.stringify(currentVersion.ADYEN_FP_VERSION),
            'process.env.VITE_COMMIT_HASH': JSON.stringify(currentVersion.COMMIT_HASH),
            'process.env.VITE_COMMIT_BRANCH': JSON.stringify(currentVersion.COMMIT_BRANCH),
            'process.env.VITE_ADYEN_BUILD_ID': JSON.stringify(currentVersion.ADYEN_BUILD_ID),
            'process.env.VITE_LOADING_CONTEXT': JSON.stringify(null),
        },
        test: {
            root: resolve(__dirname, './src'),
            setupFiles: [resolve(__dirname, './config/setupTests.ts')],
            coverage: {
                provider: 'c8',
                reporter: 'lcov',
                reportsDirectory: resolve(__dirname, '../../coverage'),
            },
        },
        plugins: [
            isAnalyseMode &&
                ((await import('rollup-plugin-visualizer')).visualizer({
                    title: 'Adyen Platform bundle visualizer',
                    gzipSize: true,
                    open: true,
                }) as PluginOption),
            libInjectCss(),
        ],
    };
});
