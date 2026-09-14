import { resolve } from 'node:path';
import { defineConfig, mergeConfig, type UserConfig } from 'vite';
import { getBuildEnvDefines } from './defines/build-env';

interface ViteLibOptions {
    projectRoot: string;
    entry: string;
    preserveModulesRoot?: string;
    external?: (string | RegExp)[];
    scssLoadPaths?: string[];
    overrides?: UserConfig;
}

export function getViteLibConfig({
    projectRoot,
    entry,
    preserveModulesRoot = 'src',
    external = [],
    scssLoadPaths = [],
    overrides = {},
}: ViteLibOptions) {
    const entryPath = resolve(projectRoot, entry);
    const outDir = resolve(projectRoot, 'dist');
    const scss = {
        api: 'modern-compiler' as const,
        silenceDeprecations: ['legacy-js-api'],
        loadPaths: [resolve(__dirname, '../node_modules'), ...scssLoadPaths],
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
    } as const;

    return defineConfig(({ mode }) => mergeConfig(baseConfig, { ...overrides, define: getBuildEnvDefines(mode) }) as UserConfig);
}
