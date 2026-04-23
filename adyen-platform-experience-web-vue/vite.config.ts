import { fileURLToPath, URL } from 'node:url';
import { dirname, resolve } from 'node:path';
import type { ConfigEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import { getEnvironment } from './envs/getEnvs';
import { realApiProxies } from '../endpoints/realApiProxies';
import dotenv from 'dotenv';
import type { Plugin } from 'vite';

// Load .env file
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

function inlineComponentCssVariables(): Plugin {
    const SDK_PREFIX = '--adyen-sdk-';
    const CORE_TOKEN_PREFIXES = ['color-', 'text-', 'focus-ring-', 'spacer-', 'border-'];
    const DECLARATION_RE = new RegExp(`(${SDK_PREFIX}[a-zA-Z0-9_-]+)\\s*:\\s*([^;{}]+);?`, 'g');
    const VAR_USAGE_RE = /var\(\s*(--adyen-sdk-[a-zA-Z0-9_-]+)(?:\s*,[^)]*)?\s*\)/g;

    const isCoreToken = (varName: string): boolean => {
        const suffix = varName.slice(SDK_PREFIX.length);
        return CORE_TOKEN_PREFIXES.some(p => suffix.startsWith(p));
    };

    const escapeForRegex = (str: string): string => str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

    return {
        name: 'inline-component-css-variables',
        apply: 'build',
        enforce: 'post',
        generateBundle(_, bundle) {
            for (const output of Object.values(bundle)) {
                if (output.type !== 'asset' || typeof output.source !== 'string' || !output.fileName.endsWith('.css')) {
                    continue;
                }

                // 0. Catch any remaining --b- prefixes missed by transform-time replacement
                //    (e.g. SCSS files resolved via @import after the transform hook)
                let css = output.source.replace(/--b-/g, '--adyen-sdk-').replace(/(?<=\.|["'`])b-/g, 'adyen-pe-');

                // 1. Build a map of all --adyen-sdk-* declarations
                const declarations = new Map<string, string>();
                let m: RegExpExecArray | null;
                while ((m = DECLARATION_RE.exec(css)) !== null) {
                    declarations.set(m[1], m[2].trim());
                }

                // 2. Recursively resolve component variable values
                const resolved = new Map<string, string>();
                const resolveValue = (varName: string, seen: Set<string>): string | null => {
                    if (resolved.has(varName)) return resolved.get(varName)!;
                    if (seen.has(varName)) return null; // circular
                    seen.add(varName);

                    const value = declarations.get(varName);
                    if (value == null) return null;

                    // Replace refs to other component vars with their resolved values
                    const inlined = value.replace(VAR_USAGE_RE, (match, ref: string) => {
                        if (isCoreToken(ref)) return match; // keep core token var() as-is
                        const refResolved = resolveValue(ref, new Set(seen));
                        return refResolved != null ? refResolved : match;
                    });

                    resolved.set(varName, inlined);
                    return inlined;
                };

                // Resolve all component (non-core) variables
                declarations.forEach((_, varName) => {
                    if (!isCoreToken(varName)) {
                        resolveValue(varName, new Set<string>());
                    }
                });

                // 3. Replace var(--component-var) usages with resolved values in the CSS
                let result = css;
                // Sort by longest name first to avoid partial matches
                const entries = Array.from(resolved.entries()).sort((a, b) => b[0].length - a[0].length);
                entries.forEach(([varName, resolvedValue]) => {
                    const pattern = new RegExp(`var\\(\\s*${escapeForRegex(varName)}(?:\\s*,[^)]*)?\\s*\\)`, 'g');
                    result = result.replace(pattern, resolvedValue);
                });

                // 4. Remove component variable declarations (they are now inlined)
                const componentVarNames = new Set(resolved.keys());
                result = result.replace(new RegExp(`\\s*${escapeForRegex(SDK_PREFIX)}[a-zA-Z0-9_-]+\\s*:\\s*[^;{}]+;?`, 'g'), declaration => {
                    // Extract the var name from the declaration
                    const nameMatch = declaration.match(new RegExp(`(${escapeForRegex(SDK_PREFIX)}[a-zA-Z0-9_-]+)\\s*:`));
                    if (!nameMatch || !componentVarNames.has(nameMatch[1])) return declaration;
                    return '';
                });

                output.source = result;
            }
        },
    };
}

function replaceCssClassPrefix(): Plugin {
    const CSS_PREFIX_OLD = 'b-';
    const CSS_PREFIX_NEW = 'adyen-pe-';
    const CSS_CUSTOM_PROPERTY_PREFIX_OLD = '--b-';
    const CSS_CUSTOM_PROPERTY_PREFIX_NEW = '--adyen-sdk-';
    const CSS_SCOPED_ATTRIBUTE_SELECTOR_OLD = '[data-v-';

    // Matches 'b-' as a CSS class prefix in:
    // - CSS/SCSS selectors: .b-foo
    // - JS string literals: "b-foo", 'b-foo', `b-foo`
    // - JS concatenation: + 'b-', className: 'b-
    // Uses lookbehind to avoid replacing 'b-' in unrelated contexts
    const cssClassPrefixPattern = new RegExp(`(?<=\\.|["'\`]|["'\`]\\s*\\+\\s*["'\`])${CSS_PREFIX_OLD.replace('-', '\\-')}`, 'g');
    const cssCustomPropertyPrefixPattern = new RegExp(CSS_CUSTOM_PROPERTY_PREFIX_OLD.replace(/-/g, '\\-'), 'g');
    const cssScopedAttributeSelectorPattern = /\[data-v-[^\]]+\]/g;

    return {
        name: 'replace-css-class-prefix',
        enforce: 'pre',
        transform(code, id) {
            const cleanId = id.split('?')[0];
            const query = id.split('?')[1] || '';
            const isVueStyle = cleanId.endsWith('.vue') && query.includes('type=style');
            const isStyleFile = /\.(scss|css)$/.test(cleanId) || isVueStyle;

            if (!/\.(tsx?|jsx?|scss|css|vue)$/.test(cleanId)) {
                return null;
            }

            // For .vue files, only process style blocks
            if (cleanId.endsWith('.vue') && !isVueStyle) {
                return null;
            }

            if (
                !code.includes(CSS_PREFIX_OLD) &&
                !code.includes(CSS_CUSTOM_PROPERTY_PREFIX_OLD) &&
                !code.includes(CSS_SCOPED_ATTRIBUTE_SELECTOR_OLD)
            ) {
                return null;
            }

            const transformedClassPrefix = code.replace(cssClassPrefixPattern, CSS_PREFIX_NEW);
            const transformedCustomProperties = isStyleFile
                ? transformedClassPrefix.replace(cssCustomPropertyPrefixPattern, CSS_CUSTOM_PROPERTY_PREFIX_NEW)
                : transformedClassPrefix;
            const transformed = isStyleFile
                ? transformedCustomProperties.replace(cssScopedAttributeSelectorPattern, '')
                : transformedCustomProperties;

            if (transformed === code) {
                return null;
            }

            return { code: transformed, map: null };
        },
    };
}

function pruneUnusedBentoIllustrations(): Plugin {
    // Bento bundles SVG illustration modules for empty states (delight, success, etc.)
    // Platform Experience Web does not reference any of these illustrations directly.
    // This plugin strips them from the final output and replaces their content in the
    // empty-state chunk's dynamic import map with empty strings.
    const ILLUSTRATION_NAMES = [
        'delight',
        'success',
        'wrong-environment',
        'upload-files',
        'referrals',
        'planned-maintenance',
        'page-not-found',
        'notifications-cleared',
        'no-results-found',
        'internal-error',
        'adyen-giving',
        'adding-payment-methods',
        '1-generic-use',
        '2-generic-use',
        '3-generic-use',
        '4-generic-use',
    ];

    const illustrationPattern = new RegExp(`(${ILLUSTRATION_NAMES.map(n => n.replace(/[-/]/g, '\\$&')).join('|')})\\.\\w+\\.js$`);

    return {
        name: 'prune-unused-bento-illustrations',
        apply: 'build',
        enforce: 'post',
        generateBundle(_, bundle) {
            const prunedFiles: string[] = [];

            for (const [fileName, output] of Object.entries(bundle)) {
                if (output.type === 'chunk' && fileName.includes('bento-vue3') && illustrationPattern.test(fileName)) {
                    prunedFiles.push(fileName);
                    // Replace chunk content with a minimal export
                    output.code = 'const d="";export{d as default};\n';
                }
            }

            if (prunedFiles.length > 0) {
                console.log(`[prune-illustrations] Replaced ${prunedFiles.length} illustration chunks with empty exports`);
            }
        },
    };
}

export default async ({ mode }: ConfigEnv) => {
    const { api, app } = getEnvironment(mode);
    const isDevMode = mode === 'development';
    const isTestEnv = process.env.TEST_ENV === '1';
    const isStorybook = process.env.STORYBOOK === 'true';
    const devPlugins = isDevMode && !isStorybook ? [vueDevTools()] : [];

    return {
        plugins: [replaceCssClassPrefix(), pruneUnusedBentoIllustrations(), vue(), ...devPlugins, inlineComponentCssVariables()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        build: {
            minify: 'terser',
            terserOptions: {
                format: { comments: false },
                compress: { passes: 2 },
                mangle: true,
            },
            lib: {
                entry: resolve(__dirname, 'src/index.ts'),
                name: 'AdyenPlatformExperienceVue',
                formats: ['es'],
                fileName: (format: string, entryName: string) => {
                    return entryName.includes('node_modules')
                        ? `${format}/${entryName.replace('node_modules', 'external')}.js`
                        : `${format}/${entryName}.js`;
                },
            },
            rollupOptions: {
                external: ['vue', 'vue-i18n', 'vue-router'],
                output: {
                    preserveModules: true,
                    preserveModulesRoot: 'src',
                    sourcemap: false,
                    indent: false,
                    globals: {
                        vue: 'Vue',
                    },
                },
            },
        },
        server: {
            host: app.host,
            port: app.port,
            proxy: realApiProxies(api, mode),
        },
        define: {
            'process.env.VITE_APP_PORT': JSON.stringify(app.port || null),
            'process.env.VITE_APP_URL': JSON.stringify(app.url || null),
            'process.env.VITE_APP_LOADING_CONTEXT': JSON.stringify(isDevMode ? app.loadingContext || null : null),
            'process.env.VITE_LOCAL_ASSETS': JSON.stringify(process.env.USE_CDN == 'true' ? null : isDevMode || isTestEnv),
            'process.env.VITE_VERSION': JSON.stringify('1.0.0'),
            'process.env.SESSION_ACCOUNT_HOLDER': JSON.stringify(api.session.accountHolder || null),
            'process.env.SESSION_AUTO_REFRESH': JSON.stringify(isDevMode ? api.session.autoRefresh === 'true' || null : undefined),
            'process.env.SESSION_MAX_AGE_MS': JSON.stringify(isDevMode ? api.session.maxAgeMs || null : undefined),
            'process.env.SESSION_PERMISSIONS': JSON.stringify(api.session.permissions || null),
            'process.env.TEST_ENV': JSON.stringify(process.env.TEST_ENV),
            'process.env.USE_CDN': JSON.stringify(app.useCdn ?? null),
            'process.env.VITE_TEST_CDN_ASSETS': JSON.stringify(isDevMode || app.useTestCdn ? true : null),
            'process.env.NODE_ENV': JSON.stringify(mode),
        },
        optimizeDeps: {
            exclude: ['@adyen/ui-assets-icons-16', '@adyen/ui-assets-flag-icons', '@adyen/ui-assets-payment-method-icons'],
        },
        test: {
            sequence: {
                hooks: 'parallel',
            },
        },
    };
};
