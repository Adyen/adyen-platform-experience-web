import { existsSync, rmSync } from 'node:fs';
import { build as viteBuild } from 'vite';
import type { Plugin, UserConfig } from 'vite';
import type { CdnComponentsOptions } from '../types';
import { discoverEntries } from '../shared/discoverEntries';
import { createVirtualNoopModule } from '../shared/virtualNoopModule';
import { CDN_COMPONENTS_PLUGIN, CDN_COMPONENTS_CONFIG_PLUGIN } from '../constants';

export type ConfigPluginOptions = Required<Pick<CdnComponentsOptions, 'componentsDir' | 'outDir'>>;

export const createConfigPlugin = (options: ConfigPluginOptions) => {
    const { componentsDir, outDir } = options;
    let baseConfig: UserConfig | undefined;
    let hasBuilt = false;

    const virtualNoop = createVirtualNoopModule(CDN_COMPONENTS_PLUGIN);

    const configPlugin: Plugin = {
        name: CDN_COMPONENTS_CONFIG_PLUGIN,
        apply: 'build',
        config(config): UserConfig {
            baseConfig = config;

            return {
                build: {
                    outDir,
                    emptyOutDir: false,
                    ...virtualNoop.config.build,
                },
            };
        },
        resolveId: virtualNoop.hooks.resolveId,
        load: virtualNoop.hooks.load,
        async buildStart() {
            if (hasBuilt) return;

            hasBuilt = true;

            // Clean output directory before building
            if (existsSync(outDir)) {
                rmSync(outDir, { recursive: true, force: true });
            }

            const entries = discoverEntries(componentsDir);
            const entryNames = Object.keys(entries);

            if (entryNames.length === 0) {
                console.warn(`[${CDN_COMPONENTS_PLUGIN}] No component entries found in`, componentsDir);
                return;
            }

            const filteredPlugins = baseConfig?.plugins?.filter(p => {
                return (p as any)?.name !== CDN_COMPONENTS_CONFIG_PLUGIN;
            });

            console.log(`\nBuilding ${entryNames.length} CDN component(s)...\n`);

            for (const entryName of entryNames) {
                const entryPath = entries[entryName]!;

                await viteBuild({
                    configFile: false,
                    customLogger: {
                        info: msg => {
                            // Only log messages with file paths (actual build output)
                            if (msg.includes('dist/')) {
                                console.log(msg);
                            }
                        },
                        warn: console.warn,
                        error: console.error,
                        clearScreen: () => {},
                        hasErrorLogged: () => false,
                        hasWarned: false,
                        warnOnce: console.warn,
                    },
                    plugins: filteredPlugins,
                    build: {
                        minify: 'esbuild',
                        cssCodeSplit: true,
                        lib: {
                            entry: entryPath,
                            formats: ['es'],
                            fileName: () => `${entryName}.es.js`,
                        },
                        rollupOptions: {
                            external: [],
                            output: {
                                format: 'es',
                                sourcemap: false,
                                indent: false,
                                inlineDynamicImports: true, // Bundle everything into single file
                            },
                        },
                        outDir,
                        emptyOutDir: false,
                    },
                    css: {
                        preprocessorOptions: {
                            scss: {
                                api: 'modern-compiler',
                                silenceDeprecations: ['legacy-js-api'],
                            } as Record<string, unknown>,
                        },
                    },
                });
            }

            console.log(`\n✓ Built ${entryNames.length} CDN component(s) to ${outDir}\n`);
        },
    };

    return configPlugin;
};
