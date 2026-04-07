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

    return defineConfig(({ mode }) =>
        mergeConfig(
            {
                root: projectRoot,
                build: {
                    minify: true,
                    lib: {
                        name: 'AdyenPlatformExperienceWeb',
                        entry: entryPath,
                    },
                    rollupOptions: {
                        external,
                        output: [
                            {
                                format: 'es',
                                preserveModules: true,
                                preserveModulesRoot,
                                sourcemap: false,
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
            },
            overrides
        )
    );
}
