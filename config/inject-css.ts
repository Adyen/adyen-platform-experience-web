import path from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
import MagicString from 'magic-string';
import type { Plugin, ResolvedConfig } from 'vite';

export function libInjectCss(): Plugin {
    let resolvedConfig: ResolvedConfig;

    return {
        name: 'inject-css',
        apply: 'build',
        enforce: 'post',
        config(config) {
            for (const item of [config.build?.rollupOptions?.output].flat()) {
                if (item && typeof item.hoistTransitiveImports !== 'boolean') {
                    item.hoistTransitiveImports = false;
                }
            }

            return {
                build: {
                    /**
                     * Must enable css code split, otherwise there's only one `style.css` and `chunk.viteMetadata.importedCss` will be empty.
                     * @see https://github.com/vitejs/vite/blob/HEAD/packages/vite/src/node/plugins/css.ts#L613
                     */
                    cssCodeSplit: true,
                    ssrEmitAssets: true,
                },
            };
        },
        configResolved(config) {
            resolvedConfig = config;
        },
        generateBundle({ format }, bundle) {
            for (const chunk of Object.values(bundle)) {
                if (chunk.type !== 'chunk' || !chunk.viteMetadata?.importedCss.size) {
                    continue;
                }

                /**
                 * Inject the referenced style files at the top of the chunk.
                 * Delegate the task of how to handle these files to the user's build tool.
                 */
                const ms = new MagicString(chunk.code);
                for (const cssFileName of chunk.viteMetadata.importedCss) {
                    let cssFilePath = path.relative(path.dirname(chunk.fileName), cssFileName).replace(/[\\/]+/g, '/');
                    cssFilePath = cssFilePath.startsWith('.') ? cssFilePath : `./${cssFilePath}`;
                    ms.prepend(format === 'es' ? `import '${cssFilePath}';\n` : `require('${cssFilePath}');`);
                }

                // update code and sourcemap
                chunk.code = ms.toString();
                if (resolvedConfig.build.sourcemap) {
                    chunk.map = ms.generateMap({ hires: true });
                }
            }
        },
    };
}
