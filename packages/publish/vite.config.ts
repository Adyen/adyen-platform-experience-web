import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { preact } from '@preact/preset-vite';
import svgr from 'vite-plugin-svgr';
import { getBuildEnvDefines } from '../../config/build-env-defines';

const projectRoot = resolve(fileURLToPath(import.meta.url), '..');
const rootDir = resolve(projectRoot, '../..');
const srcDir = resolve(rootDir, 'src');

const assetsDir = resolve(srcDir, 'assets');
const enUsFile = resolve(assetsDir, 'translations/en-US.json');
const translationsDir = resolve(srcDir, 'translations');
const translationsIndexFile = resolve(translationsDir, 'index.ts');
const translationsLocalFile = resolve(translationsDir, 'local.ts');

const rootPkgJson = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf-8'));
const externalDependencies = Object.keys(rootPkgJson.dependencies ?? {});

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
            '@integration-components/types': resolve(rootDir, 'packages/shared/types/src'),
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
                loadPaths: [srcDir],
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
