import { resolve } from 'node:path';
import { defineConfig, mergeConfig, type UserConfig } from 'vite';
import { preact } from '@preact/preset-vite';
import svgr from 'vite-plugin-svgr';

interface PreactViteLibOptions {
    projectRoot: string;
    entry: string;
    preserveModulesRoot?: string;
    external?: (string | RegExp)[];
    scssLoadPaths?: string[];
    overrides?: UserConfig;
}

export function getPreactViteLibConfig(options: PreactViteLibOptions) {
    const { projectRoot, entry, preserveModulesRoot, external = [], scssLoadPaths = [], overrides = {} } = options;

    const baseConfig = defineConfig({
        root: projectRoot,
        build: {
            minify: true,
            lib: {
                name: 'AdyenPlatformExperienceWeb',
                entry: resolve(projectRoot, entry),
            },
            rollupOptions: {
                external,
                output: [
                    {
                        format: 'es',
                        preserveModules: true,
                        preserveModulesRoot: preserveModulesRoot ?? 'src',
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
            outDir: resolve(projectRoot, 'dist'),
            emptyOutDir: true,
        },
        css: {
            preprocessorOptions: {
                scss: {
                    api: 'modern-compiler' as const,
                    silenceDeprecations: ['legacy-js-api'],
                    ...(scssLoadPaths.length > 0 && { loadPaths: scssLoadPaths }),
                },
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
    });

    return mergeConfig(baseConfig, overrides);
}
