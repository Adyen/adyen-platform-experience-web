import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import version from './version';
import packageJson from '../package.json';

const currentVersion = version();

const externalDependencies = Object.keys(packageJson.dependencies);

export default defineConfig(() => {
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
                formats: ['cjs', 'es'],
                fileName: format => `adyen-fp-components.${format}.js`,
            },
            minify: true,
            rollupOptions: { external: externalDependencies },
            outDir: resolve(__dirname, '..', 'dist'),
            emptyOutDir: false,
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
                provider: 'c8',
                reporter: 'lcov',
                reportsDirectory: resolve(__dirname, '../../../coverage'),
            },
        },
    };
});
