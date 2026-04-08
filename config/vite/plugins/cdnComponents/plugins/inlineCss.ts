import { transformWithEsbuild, type Plugin } from 'vite';
import { CDN_COMPONENTS_INLINE_CSS_PLUGIN } from '../constants';
import type { CdnComponentsOptions } from '../types';

export type InlineCssPluginOptions = Required<Pick<CdnComponentsOptions, 'target'>>;

export const createInlineCssPlugin = (options: InlineCssPluginOptions) => {
    const { target } = options;

    const inlineCssPlugin: Plugin = {
        name: CDN_COMPONENTS_INLINE_CSS_PLUGIN,
        apply: 'build',
        enforce: 'post',
        async generateBundle(_, bundle) {
            const cssChunks: string[] = [];

            // Collect all CSS asset content and remove from the bundle
            for (const [fileName, chunk] of Object.entries(bundle)) {
                if (fileName.endsWith('.css') && chunk.type === 'asset') {
                    cssChunks.push(typeof chunk.source === 'string' ? chunk.source : new TextDecoder().decode(chunk.source));
                    delete bundle[fileName];
                }
            }

            if (cssChunks.length === 0) return;

            const css = cssChunks.join('\n');
            const injector =
                `(function(){try{var d=document,s=d.createElement("style");` +
                `s.textContent=${JSON.stringify(css)};d.head.appendChild(s)}catch(e){}})();\n`;

            // Prepend the style injector and re-minify with esbuild
            for (const chunk of Object.values(bundle)) {
                if (chunk.type === 'chunk' && chunk.isEntry) {
                    const merged = injector + chunk.code;
                    const { code } = await transformWithEsbuild(merged, 'chunk.js', {
                        minify: true,
                        target,
                    });
                    chunk.code = code;
                }
            }
        },
    };

    return inlineCssPlugin;
};
