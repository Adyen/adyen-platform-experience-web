import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { preact } from '@preact/preset-vite';
import svgr from 'vite-plugin-svgr';
import { getBuildEnvDefines } from '../../config/defines/build-env';
import rootPkgJson from '../../package.json';

const projectRoot = resolve(fileURLToPath(import.meta.url), '..');
const rootDir = resolve(projectRoot, '../..');
const srcDir = resolve(rootDir, 'src');
const assetsDir = resolve(rootDir, 'packages/shared/assets/src');
const styleDir = resolve(rootDir, 'packages/shared/style');
const enUsFile = resolve(assetsDir, 'translations/en-US.json');
const translationsDir = resolve(rootDir, 'packages/shared/core/src/translations');
const translationsIndexFile = resolve(translationsDir, 'index.ts');

const externalDependencies = Object.keys(rootPkgJson.dependencies);

const shouldExcludeAsset = (id: string) => {
    if (externalDependencies.includes(id)) {
        return true;
    }

    if (id === enUsFile || id === translationsIndexFile) {
        return false;
    }

    if (id.startsWith(assetsDir)) {
        return true;
    }

    return false;
};

export default defineConfig(({ mode }) => ({
    root: projectRoot,
    resolve: {
        alias: [
            { find: /^@integration-components\/style\/(.+)$/, replacement: `${styleDir}/$1` },
            { find: /^@integration-components\/style$/, replacement: resolve(styleDir, 'index.scss') },
            { find: '@integration-components/hooks-preact', replacement: resolve(rootDir, 'packages/shared/hooks-preact/src') },
            { find: '@integration-components/assets', replacement: resolve(rootDir, 'packages/shared/assets/src') },
            { find: '@integration-components/core', replacement: resolve(rootDir, 'packages/shared/core/src') },
            { find: '@integration-components/types', replacement: resolve(rootDir, 'packages/shared/types/src') },
            { find: '@integration-components/utils', replacement: resolve(rootDir, 'packages/shared/utils/src') },
            { find: '@integration-components/ui-components-preact', replacement: resolve(rootDir, 'packages/shared/ui-components-preact/src') },
            { find: '@integration-components/sdk-internal', replacement: resolve(rootDir, 'src') },
            { find: '@integration-components/disputes/publish', replacement: resolve(rootDir, 'packages/domains/disputes/publish/src') },
            { find: '@integration-components/disputes/preact', replacement: resolve(rootDir, 'packages/domains/disputes/preact/src') },
            { find: '@integration-components/disputes/domain', replacement: resolve(rootDir, 'packages/domains/disputes/domain/src') },
            { find: '@integration-components/payouts/publish', replacement: resolve(rootDir, 'packages/domains/payouts/publish/src') },
            { find: '@integration-components/payouts/preact', replacement: resolve(rootDir, 'packages/domains/payouts/preact/src') },
            { find: '@integration-components/payouts/domain', replacement: resolve(rootDir, 'packages/domains/payouts/domain/src') },
            { find: '@integration-components/reports/publish', replacement: resolve(rootDir, 'packages/domains/reports/publish/src') },
            { find: '@integration-components/reports/preact', replacement: resolve(rootDir, 'packages/domains/reports/preact/src') },
            { find: '@integration-components/reports/domain', replacement: resolve(rootDir, 'packages/domains/reports/domain/src') },
            { find: '@integration-components/transactions/publish', replacement: resolve(rootDir, 'packages/domains/transactions/publish/src') },
            { find: '@integration-components/transactions/preact', replacement: resolve(rootDir, 'packages/domains/transactions/preact/src') },
            { find: '@integration-components/transactions/domain', replacement: resolve(rootDir, 'packages/domains/transactions/domain/src') },
            { find: '@integration-components/payByLink/publish', replacement: resolve(rootDir, 'packages/domains/payByLink/publish/src') },
            { find: '@integration-components/payByLink/preact', replacement: resolve(rootDir, 'packages/domains/payByLink/preact/src') },
            { find: '@integration-components/payByLink/domain', replacement: resolve(rootDir, 'packages/domains/payByLink/domain/src') },
            { find: '@integration-components/capital/publish', replacement: resolve(rootDir, 'packages/domains/capital/publish/src') },
            { find: '@integration-components/capital/preact', replacement: resolve(rootDir, 'packages/domains/capital/preact/src') },
            { find: '@integration-components/capital/domain', replacement: resolve(rootDir, 'packages/domains/capital/domain/src') },
        ],
    },
    build: {
        minify: true,
        lib: {
            cssFileName: 'adyen-platform-experience-web',
            name: 'AdyenPlatformExperienceWeb',
            entry: resolve(projectRoot, 'src/index.ts'),
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
                    preserveModules: true,
                    preserveModulesRoot: resolve(rootDir, 'src'),
                    sourcemap: false,
                    indent: false,
                },
                {
                    format: 'cjs',
                    sourcemap: true,
                    indent: false,
                },
            ],
        },
        // Output to root dist/ so the root package.json entry points and CI workflows remain intact.
        outDir: resolve(rootDir, 'dist'),
        emptyOutDir: true,
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler' as const,
                silenceDeprecations: ['legacy-js-api'],
                loadPaths: [srcDir, resolve(rootDir, 'node_modules')],
            },
        },
    },
    define: getBuildEnvDefines(mode),
    json: {
        stringify: true,
    },
    plugins: [
        svgr({
            svgrOptions: { jsxRuntime: 'automatic', exportType: 'default' },
            esbuildOptions: { jsx: 'automatic' },
            include: '**/*.svg?component',
        }),
        preact(),
    ],
}));
