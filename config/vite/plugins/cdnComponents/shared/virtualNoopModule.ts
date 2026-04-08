/**
 * Creates a virtual no-op module to satisfy Vite's build requirements
 * without producing any actual output. This allows custom build logic
 * to run without Vite's default bundling interfering.
 *
 * @param pluginName - Name of the plugin (used to create unique virtual module ID)
 * @returns Configuration object with build config and plugin hooks
 *
 * @example
 * ```ts
 * const virtualNoop = createVirtualNoopModule('my-plugin');
 *
 * const plugin: Plugin = {
 *   name: 'my-plugin',
 *   config() {
 *     return {
 *       build: {
 *         ...virtualNoop.config.build,
 *       },
 *     };
 *   },
 *   resolveId: virtualNoop.hooks.resolveId,
 *   load: virtualNoop.hooks.load,
 * };
 * ```
 */
export const createVirtualNoopModule = (pluginName: string) => {
    const virtualId = `virtual:${pluginName}-noop`;

    return {
        config: {
            build: {
                write: false, // Don't write the virtual module to disk
                rollupOptions: {
                    input: virtualId,
                },
            },
        },
        hooks: {
            resolveId(id: string) {
                if (id === virtualId) return virtualId;
            },
            load(id: string) {
                if (id === virtualId) return 'export {}';
            },
        },
    };
};
