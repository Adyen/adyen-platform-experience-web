import type { Plugin } from 'vite';
import type { ShakeIconsOptions } from './types';
import { discoverIcons } from './shared/discoverIcons';
import { VIRTUAL_ICONS_ID, RESOLVED_VIRTUAL_ICONS_ID, SHAKE_ICONS_PLUGIN } from './constants';
import stripComments from 'strip-comments';

/**
 * Vite plugin that tree-shakes unused icons via a virtual module.
 *
 * **How it works:**
 * 1. Analyzes source files to detect which icons are used (via `<Icon name="..." />`)
 * 2. Provides a virtual module (`virtual:tree-shaken-icons`) that exports only those icons
 * 3. The Icon component imports from this virtual module instead of defining icons inline
 *
 * **Benefits:**
 * - Automatic tree-shaking based on actual usage
 * - No manual configuration needed
 * - Works per-entry in multi-entry builds
 * - Can be extended to other lazy-loaded concepts
 *
 * **Usage:**
 * ```ts
 * import { shakeIcons } from './config/vite/plugins/shakeIcons';
 *
 * export default {
 *   plugins: [shakeIcons()],
 * };
 * ```
 */
export const shakeIcons = (options: ShakeIconsOptions = {}): Plugin => {
    const { pluginName = SHAKE_ICONS_PLUGIN, iconsDir = 'src/images/icons', strict = false } = options;
    const usedIcons: Set<string> = new Set();
    const dynamicIconFiles: string[] = [];
    let hasDynamicIcons = false;

    const iconFileNames = discoverIcons(iconsDir, pluginName);

    return {
        name: pluginName,
        enforce: 'pre',

        buildStart() {
            // Reset for each build
            usedIcons.clear();
            dynamicIconFiles.length = 0;
            hasDynamicIcons = false;
        },

        resolveId(id) {
            if (id === VIRTUAL_ICONS_ID) {
                return RESOLVED_VIRTUAL_ICONS_ID;
            }
            return null;
        },

        load(id) {
            if (id === RESOLVED_VIRTUAL_ICONS_ID) {
                // Strict mode: error if dynamic icon usage detected
                if (strict && hasDynamicIcons) {
                    const fileList = dynamicIconFiles.map(f => `  - ${f}`).join('\n');
                    throw new Error(
                        `[${pluginName}] Dynamic icon usage detected in strict mode.\n\n` +
                            `Files with dynamic icon usage:\n${fileList}\n\n` +
                            `Strict mode requires static icon names only for tree-shaking (e.g., name="checkmark").\n` +
                            `Dynamic usage like name={variable} or name={condition ? "a" : "b"} is not allowed.\n\n` +
                            `To fix, use static icon names:\n` +
                            `  ✓ <Icon name="checkmark" />\n` +
                            `  ✓ <Icon name="arrow-right" />\n` +
                            `  ✗ <Icon name={iconName} />\n` +
                            `  ✗ <Icon name={isOpen ? "chevron-up" : "chevron-down"} />\n`
                    );
                }

                // When strict mode is false, include all icons
                // When strict mode is true, only include detected icons for tree-shaking
                const iconsToInclude = strict ? Array.from(usedIcons) : Object.keys(iconFileNames);

                const iconEntries = iconsToInclude
                    .filter(name => iconFileNames[name])
                    .map(name => {
                        const key = name.includes('-') ? `'${name}'` : name;
                        const fileName = iconFileNames[name];
                        // Use absolute path from project root
                        return `    ${key}: () => import('/${iconsDir}/${fileName}.svg?component')`;
                    })
                    .join(',\n');

                // Generate JavaScript module
                // TypeScript types are defined in src/types/virtual-modules.d.ts
                const code = `// Auto-generated virtual module for tree-shaken icons
// Icons: ${iconsToInclude.length > 0 ? iconsToInclude.join(', ') : 'none'}
export const icons = {
${iconEntries},
};
`;

                return code;
            }
            return null;
        },

        transform(code, id) {
            // Analyze all source files to find icon usage: <Icon name="icon-name" />
            if (id.includes('/src/') && (id.endsWith('.tsx') || id.endsWith('.ts'))) {
                // Strip comments to avoid false positives
                const codeWithoutComments = stripComments(code);

                // Check for dynamic icon usage: <Icon name={...} />
                if (/<Icon[^>]*\sname=\{/.test(codeWithoutComments)) {
                    hasDynamicIcons = true;
                    dynamicIconFiles.push(id);
                }

                // Match static icon names: <Icon ... name="icon-name" ... />
                const iconNameRegex = /<Icon[^>]*\sname=["']([^"']+)["'][^>]*>/g;
                let match;

                while ((match = iconNameRegex.exec(codeWithoutComments)) !== null) {
                    usedIcons.add(match[1]!);
                }
            }

            return null;
        },
    };
};
