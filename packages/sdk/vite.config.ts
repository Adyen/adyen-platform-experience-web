import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import { getBuildEnvDefines } from '../../config/defines/build-env';
import rootPkgJson from '../../package.json';

const projectRoot = resolve(fileURLToPath(import.meta.url), '..');
const rootDir = resolve(projectRoot, '../..');
const srcDir = resolve(rootDir, 'src');
const assetsDir = resolve(rootDir, 'packages/shared/assets/src');
const styleDir = resolve(rootDir, 'packages/shared/style');
const enUsFile = resolve(assetsDir, 'translations/en-US.json');
const translationsDir = resolve(rootDir, 'packages/shared/core/src/translations');
const translationsLocalFile = resolve(translationsDir, 'local.ts');

const externalDependencies = Object.keys(rootPkgJson.dependencies);

const shouldExcludeAsset = (id: string) => {
    return externalDependencies.includes(id);
};

const UNUSED_BENTO_ILLUSTRATIONS = [
    'delight',
    'success',
    'upload-files',
    'referrals',
    'planned-maintenance',
    'page-not-found',
    'notifications-cleared',
    'internal-error',
    'adyen-giving',
    'adding-payment-methods',
    '1-generic-use',
    '2-generic-use',
    '3-generic-use',
    '4-generic-use',
] as const;

const unusedBentoIllustrationPattern = new RegExp(`(?:^|/)(?:${UNUSED_BENTO_ILLUSTRATIONS.join('|')})\\.[^/]+\\.js$`);

const isBentoVueModule = (id: string) =>
    id.includes('/@adyen/bento-vue3/') || id.includes('/@adyen+bento-vue3@') || id.includes('/packages/vue3/dist/');

const pruneUnusedBentoIllustrations = (): Plugin => ({
    name: 'prune-unused-bento-illustrations',
    apply: 'build',
    enforce: 'pre',
    transform(_code, id) {
        if (!isBentoVueModule(id) || !unusedBentoIllustrationPattern.test(id)) return null;
        return { code: `export default '';`, map: null };
    },
});

export default defineConfig(({ mode }) => ({
    root: projectRoot,
    resolve: {
        dedupe: ['vue', 'vue-i18n'],
        alias: [
            { find: /^vue$/, replacement: resolve(projectRoot, 'node_modules/vue') },
            { find: /^vue-i18n$/, replacement: resolve(projectRoot, 'node_modules/vue-i18n') },
            { find: /^@integration-components\/style\/(.+)$/, replacement: `${styleDir}/$1` },
            { find: /^@integration-components\/style$/, replacement: resolve(styleDir, 'index.scss') },
            { find: '@integration-components/composables-vue', replacement: resolve(rootDir, 'packages/shared/composables-vue/src') },
            { find: '@integration-components/assets', replacement: resolve(rootDir, 'packages/shared/assets/src') },
            { find: '@integration-components/core', replacement: resolve(rootDir, 'packages/shared/core/src') },
            { find: '@integration-components/types', replacement: resolve(rootDir, 'packages/shared/types/src') },
            { find: '@integration-components/utils', replacement: resolve(rootDir, 'packages/shared/utils/src') },
            { find: '@integration-components/sdk-internal', replacement: resolve(rootDir, 'src') },
            { find: '@integration-components/disputes/vue', replacement: resolve(rootDir, 'packages/domains/disputes/vue/src') },
            { find: '@integration-components/disputes/domain', replacement: resolve(rootDir, 'packages/domains/disputes/domain/src') },
            { find: '@integration-components/payouts/vue', replacement: resolve(rootDir, 'packages/domains/payouts/vue/src') },
            { find: '@integration-components/payouts/domain', replacement: resolve(rootDir, 'packages/domains/payouts/domain/src') },
            { find: '@integration-components/reports/vue', replacement: resolve(rootDir, 'packages/domains/reports/vue/src') },
            { find: '@integration-components/reports/domain', replacement: resolve(rootDir, 'packages/domains/reports/domain/src') },
            { find: '@integration-components/transactions/vue', replacement: resolve(rootDir, 'packages/domains/transactions/vue/src') },
            { find: '@integration-components/transactions/domain', replacement: resolve(rootDir, 'packages/domains/transactions/domain/src') },
            { find: '@integration-components/payByLink/vue', replacement: resolve(rootDir, 'packages/domains/payByLink/vue/src') },
            { find: '@integration-components/payByLink/domain', replacement: resolve(rootDir, 'packages/domains/payByLink/domain/src') },
            { find: '@integration-components/capital/vue', replacement: resolve(rootDir, 'packages/domains/capital/vue/src') },
            { find: '@integration-components/capital/domain', replacement: resolve(rootDir, 'packages/domains/capital/domain/src') },
        ],
    },
    build: {
        minify: 'terser',
        terserOptions: {
            format: { comments: false },
            compress: { passes: 2 },
            mangle: true,
        },
        sourcemap: false,
        lib: {
            cssFileName: 'adyen-platform-experience-web',
            name: 'AdyenPlatformExperienceWeb',
            entry: resolve(projectRoot, 'src/index.ts'),
            fileName: (format, entryName) => {
                const extension = format === 'cjs' ? 'cjs' : 'js';
                if (entryName.includes('node_modules')) {
                    const normalized = entryName.slice(entryName.lastIndexOf('node_modules/') + 'node_modules/'.length);
                    return `${format}/external/${normalized}.${extension}`;
                }
                return `${format}/${entryName}.${extension}`;
            },
        },
        rollupOptions: {
            external: shouldExcludeAsset,
            output: [
                {
                    format: 'es',
                    preserveModules: true,
                    preserveModulesRoot: rootDir,
                    indent: false,
                },
                {
                    format: 'cjs',
                    preserveModules: true,
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
        {
            name: 'stub-dev-only-assets',
            enforce: 'pre' as const,
            load(id: string) {
                if (id === translationsLocalFile) {
                    return `export const translations_dev_assets = {};`;
                }
                // Asset translation JSON files (all locales except en-US which is bundled)
                // are only used via local.ts (dev mode). Stub them out for production builds.
                if (id !== enUsFile && id.startsWith(assetsDir)) {
                    return `export default {};`;
                }
            },
        },
        vue(),
        pruneUnusedBentoIllustrations(),
    ],
}));
