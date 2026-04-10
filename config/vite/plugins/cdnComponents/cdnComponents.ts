import type { Plugin } from 'vite';
import type { CdnComponentsOptions } from './types';
import { CDN_COMPONENTS_PLUGIN } from './constants';
import { createConfigPlugin } from './plugins/config';
import { createInlineCssPlugin } from './plugins/inlineCss';
import { shakeIcons } from '../shakeIcons';

/**
 * Vite plugin suite for building self-contained CDN components as ES modules.
 *
 * Each component in `componentsDir` is built as a standalone ES module (`.es.js`) with:
 * - Modern ES module format for use with `<script type="module">`
 * - All dependencies (Preact/Vue, classnames, etc.) bundled inline
 * - CSS inlined as a runtime `<style>` injector — no separate `.css` file
 * - Full esbuild minification (identifiers + whitespace + syntax)
 * - Support for both static and dynamic imports
 *
 * Build configuration:
 * ```ts
 * import { preact } from '@preact/preset-vite';
 * import { cdnComponents } from './config/vite/plugins/cdnComponents';
 *
 * export default defineConfig({
 *     plugins: [
 *         preact(),
 *         ...cdnComponents({ componentsDir: resolve(__dirname, 'src/assets/components') }),
 *     ],
 * });
 * ```
 *
 * Usage in HTML (static import):
 * ```html
 * <script type="module">
 *   import { HelloWorld } from './HelloWorld.es.js';
 *   import ToggleSwitch from './ToggleSwitch.es.js';
 * </script>
 * ```
 *
 * Usage in HTML (dynamic import for lazy loading):
 * ```html
 * <script type="module">
 *   // Load component on demand
 *   const { default: ToggleSwitch } = await import('./ToggleSwitch.es.js');
 *
 *   // Or with conditional loading
 *   if (userNeedsComponent) {
 *     const module = await import('./HelloWorld.es.js');
 *     const HelloWorld = module.HelloWorld || module.default;
 *   }
 * </script>
 * ```
 */
export const cdnComponents = (options: CdnComponentsOptions): Plugin[] => {
    const { componentsDir, outDir = 'dist/cdn-components', target = 'es2020' } = options;

    const configPlugin: Plugin = createConfigPlugin({ componentsDir, outDir });
    const inlineCssPlugin: Plugin = createInlineCssPlugin({ target });

    const shakeIconsPlugin: Plugin = shakeIcons({
        pluginName: `${CDN_COMPONENTS_PLUGIN}:shake-icons`,
        strict: true, // Enforce static icons for CDN tree-shaking
    });

    return [configPlugin, shakeIconsPlugin, inlineCssPlugin];
};
