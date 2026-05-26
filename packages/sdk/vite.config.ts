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

const assetsDir = resolve(srcDir, 'assets');
const enUsFile = resolve(assetsDir, 'translations/en-US.json');
const translationsDir = resolve(srcDir, 'translations');
const translationsIndexFile = resolve(translationsDir, 'index.ts');
const translationsLocalFile = resolve(translationsDir, 'local.ts');

const externalDependencies = Object.keys(rootPkgJson.dependencies);

const shouldExcludeAsset = (id: string) => {
    if (externalDependencies.includes(id)) {
        return true;
    }

    if (id === enUsFile || id === translationsIndexFile) {
        return false;
    }

    if (id === translationsLocalFile || id.startsWith(assetsDir)) {
        return true;
    }

    return false;
};

export default defineConfig(({ mode }) => ({
    root: projectRoot,
    resolve: {
        alias: {
            '@integration-components/hooks-preact': resolve(rootDir, 'packages/shared/hooks-preact/src'),
            '@integration-components/core': resolve(rootDir, 'packages/shared/core/src'),
            '@integration-components/types': resolve(rootDir, 'packages/shared/types/src'),
            '@integration-components/utils': resolve(rootDir, 'packages/shared/utils/src'),
            '@integration-components/ui-components-preact': resolve(rootDir, 'packages/shared/ui-components-preact/src'),
            '@integration-components/style': resolve(rootDir, 'packages/shared/style/src'),
            '@integration-components/sdk-internal': resolve(rootDir, 'src'),
            '@integration-components/disputes/publish': resolve(rootDir, 'packages/domains/disputes/publish/src'),
            '@integration-components/disputes/preact': resolve(rootDir, 'packages/domains/disputes/preact/src'),
            '@integration-components/disputes/domain': resolve(rootDir, 'packages/domains/disputes/domain/src'),
            '@integration-components/payouts/publish': resolve(rootDir, 'packages/domains/payouts/publish/src'),
            '@integration-components/payouts/preact': resolve(rootDir, 'packages/domains/payouts/preact/src'),
            '@integration-components/payouts/domain': resolve(rootDir, 'packages/domains/payouts/domain/src'),
            '@integration-components/reports/publish': resolve(rootDir, 'packages/domains/reports/publish/src'),
            '@integration-components/reports/preact': resolve(rootDir, 'packages/domains/reports/preact/src'),
            '@integration-components/reports/domain': resolve(rootDir, 'packages/domains/reports/domain/src'),
            '@integration-components/transactions/publish': resolve(rootDir, 'packages/domains/transactions/publish/src'),
            '@integration-components/transactions/preact': resolve(rootDir, 'packages/domains/transactions/preact/src'),
            '@integration-components/transactions/domain': resolve(rootDir, 'packages/domains/transactions/domain/src'),
            '@integration-components/payByLink/publish': resolve(rootDir, 'packages/domains/payByLink/publish/src'),
            '@integration-components/payByLink/preact': resolve(rootDir, 'packages/domains/payByLink/preact/src'),
            '@integration-components/payByLink/domain': resolve(rootDir, 'packages/domains/payByLink/domain/src'),
        },
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
