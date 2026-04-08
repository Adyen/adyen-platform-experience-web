import { resolve } from 'node:path';
import { defineConfig, mergeConfig, type UserConfig } from 'vite';
import { preact } from '@preact/preset-vite';
import svgr from 'vite-plugin-svgr';
import { getBuildEnvDefines } from './build-env-defines';

interface PreactViteLibOptions {
    projectRoot: string;
    entry: string;
    preserveModulesRoot?: string;
    external?: (string | RegExp)[];
    scssLoadPaths?: string[];
    overrides?: UserConfig;
}

export function getPreactViteLibConfig({
    projectRoot,
    entry,
    preserveModulesRoot = 'src',
    external = [],
    scssLoadPaths = [],
    overrides = {},
}: PreactViteLibOptions) {
    const entryPath = resolve(projectRoot, entry);
    const outDir = resolve(projectRoot, 'dist');
    const scss = {
        api: 'modern-compiler' as const,
        silenceDeprecations: ['legacy-js-api'],
        ...(scssLoadPaths.length > 0 ? { loadPaths: scssLoadPaths } : {}),
    };

    const baseConfig = {
        root: projectRoot,
        build: {
            minify: true,
            lib: {
                entry: entryPath,
            },
            rollupOptions: {
                external,
                output: [
                    {
                        format: 'es',
                        preserveModules: true,
                        preserveModulesRoot,
                        sourcemap: true,
                        indent: false,
                    },
                ],
            },
            outDir,
            emptyOutDir: true,
        },
        css: {
            preprocessorOptions: {
                scss,
            },
        },
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
    } as const;

    return defineConfig(({ mode }) => mergeConfig(baseConfig, { ...overrides, define: getBuildEnvDefines(mode) }) as UserConfig);
}
