import type { Plugin } from 'vite';
import { THEME_MODE_ATTRIBUTE, THEME_ROOT_ATTRIBUTE } from '@integration-components/types/theme';

const SDK_VARIABLE_PREFIX = '--adyen-sdk-';
/** Bento's defaults live under private names, so the public `--adyen-sdk-*` names stay free for overrides. */
const DEFAULT_VARIABLE_PREFIX = '--adyen-pe-bento-';
const SDK_DARK_THEME_SELECTOR = `[${THEME_MODE_ATTRIBUTE}='dark']`;
const SDK_THEME_ROOT_SELECTOR = `[${THEME_ROOT_ATTRIBUTE}]`;
const BENTO_DARK_THEME_REGEX = /(^|[^\w-])\.b-dark-theme(?![\w-])/g;
/** Bento's light defaults (`:root { … }`) and dark defaults (`.b-dark-theme { … }`). */
const BENTO_DEFAULTS_BLOCK_REGEX = /(^|[^\w-])(:root|\.b-dark-theme)(\s*\{)([^{}]*)(?=\})/g;
const BENTO_DECLARATION_REGEX = /(^|[^\w-])--b-([\w-]+)(\s*:)/g;
const BENTO_DECLARATION_TEST_REGEX = /(^|[^\w-])--b-[\w-]+\s*:/;
const BENTO_REFERENCE_REGEX = /var\(\s*--b-([\w-]+)/g;
const BENTO_VARIABLE_TEST_REGEX = /(^|[^\w-])--b-/;
const BENTO_DARK_THEME_TEST_REGEX = /(^|[^\w-])\.b-dark-theme(?![\w-])/;

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

const isCssAsset = (fileName: string) => /\.css$/i.test(fileName);
const isStyleModule = (id: string) => {
    const queryStart = id.indexOf('?');
    const fileName = queryStart === -1 ? id : id.slice(0, queryStart);

    if (/\.(?:css|less|sass|scss|styl|stylus)$/i.test(fileName)) return true;
    if (queryStart === -1) return false;

    const query = new URLSearchParams(id.slice(queryStart + 1));
    return query.has('vue') && query.get('type') === 'style';
};

const sourceToString = (source: string | Uint8Array) => (typeof source === 'string' ? source : textDecoder.decode(source));

const hasBentoStyles = (source: string): boolean => BENTO_VARIABLE_TEST_REGEX.test(source) || BENTO_DARK_THEME_TEST_REGEX.test(source);

/**
 * Moves Bento's default blocks onto theme roots, under private names. Nothing is declared on `:root`: public variables
 * set there would reach the other Adyen SDKs on the page, which read the same `--adyen-sdk-*` names.
 */
const rewriteDefaultBlocks = (source: string): string =>
    source.replace(BENTO_DEFAULTS_BLOCK_REGEX, (block, prefix: string, selector: string, open: string, body: string) => {
        if (!BENTO_DECLARATION_TEST_REGEX.test(body)) return block;
        const themeSelector = selector === ':root' ? SDK_THEME_ROOT_SELECTOR : SDK_DARK_THEME_SELECTOR;
        return `${prefix}${themeSelector}${open}${body.replace(BENTO_DECLARATION_REGEX, `$1${DEFAULT_VARIABLE_PREFIX}$2$3`)}`;
    });

/** Index of the parenthesis that closes the one opened just before `start`. */
const closingParenthesis = (source: string, start: number): number => {
    let depth = 1;
    for (let index = start; index < source.length; index++) {
        if (source[index] === '(') depth++;
        if (source[index] === ')' && --depth === 0) return index;
    }
    return source.length;
};

/** `var(--b-x, fallback)` becomes `var(--adyen-sdk-x, var(--adyen-pe-bento-x, fallback))`: public first, then the default. */
const rewriteReferences = (source: string): string => {
    let output = '';
    let position = 0;

    for (const match of source.matchAll(BENTO_REFERENCE_REGEX)) {
        if (match.index < position) continue;
        const name = match[1]!;
        const restStart = match.index + match[0].length;
        const end = closingParenthesis(source, restStart);
        const rest = rewriteReferences(source.slice(restStart, end));
        output += `${source.slice(position, match.index)}var(${SDK_VARIABLE_PREFIX}${name}, var(${DEFAULT_VARIABLE_PREFIX}${name}${rest}))`;
        position = end + 1;
    }

    return output + source.slice(position);
};

const BENTO_MODULE_REGEX = /[\\/]node_modules[\\/]@adyen[\\/]bento-[^\\/]+[\\/]/;
const SCOPE_PREFIX = `:where(${SDK_THEME_ROOT_SELECTOR})`;
/** At-rules whose body holds style rules that need scoping; every other block (`@keyframes`, `@font-face`, …) is kept as it is. */
const NESTING_AT_RULES = new Set(['media', 'supports', 'layer', 'container']);

/** Index just past the string or comment starting at `index`, or `index` when none starts there. */
const skipQuoted = (css: string, index: number): number => {
    const char = css[index];
    if (char === '/' && css[index + 1] === '*') {
        const end = css.indexOf('*/', index + 2);
        return end === -1 ? css.length : end + 2;
    }
    if (char !== '"' && char !== "'") return index;
    for (let i = index + 1; i < css.length; i++) {
        if (css[i] === '\\') i++;
        else if (css[i] === char) return i + 1;
    }
    return css.length;
};

/** Index just past the block whose opening brace is at `open`. */
const skipBlock = (css: string, open: number): number => {
    let depth = 0;
    for (let i = open; i < css.length; i++) {
        const next = skipQuoted(css, i);
        if (next !== i) {
            i = next - 1;
        } else if (css[i] === '{') {
            depth++;
        } else if (css[i] === '}' && --depth === 0) {
            return i + 1;
        }
    }
    return css.length;
};

/** End of a rule prelude: the first top-level `{`, `;` or `}`. */
const preludeEnd = (css: string, start: number): number => {
    let depth = 0;
    for (let i = start; i < css.length; i++) {
        const next = skipQuoted(css, i);
        if (next !== i) i = next - 1;
        else if (css[i] === '(' || css[i] === '[') depth++;
        else if (css[i] === ')' || css[i] === ']') depth--;
        else if (depth <= 0 && (css[i] === '{' || css[i] === ';' || css[i] === '}')) return i;
    }
    return css.length;
};

const splitSelectors = (list: string): string[] => {
    const selectors: string[] = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < list.length; i++) {
        const next = skipQuoted(list, i);
        if (next !== i) i = next - 1;
        else if (list[i] === '(' || list[i] === '[') depth++;
        else if (list[i] === ')' || list[i] === ']') depth--;
        else if (list[i] === ',' && depth === 0) {
            selectors.push(list.slice(start, i));
            start = i + 1;
        }
    }
    selectors.push(list.slice(start));
    return selectors;
};

const scopeSelector = (selector: string): string => {
    const trimmed = selector.trim();
    if (!trimmed || trimmed.startsWith(SDK_THEME_ROOT_SELECTOR) || trimmed.startsWith(SCOPE_PREFIX) || trimmed.includes(':host')) return selector;
    if (trimmed === SDK_DARK_THEME_SELECTOR) return selector;
    // The dark mode attribute sits on the theme root itself, but Bento also allows it on an ancestor of the control.
    if (trimmed.startsWith(SDK_DARK_THEME_SELECTOR)) {
        return `${SCOPE_PREFIX}${trimmed},${SCOPE_PREFIX} ${trimmed}`;
    }
    return `${SCOPE_PREFIX} ${trimmed}`;
};

/**
 * Bento's component rules are global and keyed by Bento's own class names and scope ids, so on a host page that also uses
 * Bento they would restyle the host's controls. `:where()` limits them to theme roots without changing specificity.
 */
const scopeRules = (css: string): string => {
    let output = '';
    let position = 0;

    while (position < css.length) {
        const end = preludeEnd(css, position);
        if (css[end] !== '{') {
            const stop = css[end] === ';' ? end + 1 : css.length;
            output += css.slice(position, stop);
            position = stop;
            if (css[end] === '}') {
                output += css.slice(position);
                break;
            }
            continue;
        }

        const prelude = css.slice(position, end);
        const blockEnd = skipBlock(css, end);
        const leading = prelude.match(/^(\s|\/\*[\s\S]*?\*\/)*/)![0];
        const head = prelude.slice(leading.length);

        if (head.startsWith('@')) {
            const name = /^@([\w-]+)/.exec(head)?.[1]?.toLowerCase() ?? '';
            const body = NESTING_AT_RULES.has(name) ? `{${scopeRules(css.slice(end + 1, blockEnd - 1))}}` : css.slice(end, blockEnd);
            output += prelude + body;
        } else {
            const trailing = /\s*$/.exec(head)![0];
            const selectors = splitSelectors(head.slice(0, head.length - trailing.length)).map(scopeSelector);
            output += leading + selectors.join(',') + trailing + css.slice(end, blockEnd);
        }
        position = blockEnd;
    }

    return output;
};

const rewriteString = (source: string): string =>
    rewriteReferences(rewriteDefaultBlocks(source))
        .replace(BENTO_DECLARATION_REGEX, `$1${SDK_VARIABLE_PREFIX}$2$3`)
        .replace(BENTO_DARK_THEME_REGEX, `$1${SDK_DARK_THEME_SELECTOR}`);

const rewriteSource = (source: string | Uint8Array): string | Uint8Array => {
    const sourceString = sourceToString(source);

    if (!hasBentoStyles(sourceString)) return source;

    const rewrittenSource = rewriteString(sourceString);
    return typeof source === 'string' ? rewrittenSource : textEncoder.encode(rewrittenSource);
};

/**
 * Scopes Bento's own stylesheets. This must run before `vite:css-post`: when bundling, that plugin lifts the CSS out of the
 * module, so later transforms (and `generateBundle`) can no longer tell Bento's rules from the SDK's own.
 */
const scopeBentoComponentStyles = (): Plugin => ({
    name: 'scope-bento-component-styles',
    transform: {
        order: 'pre',
        handler(code, id) {
            if (!isStyleModule(id) || !BENTO_MODULE_REGEX.test(id)) return null;
            return { code: scopeRules(rewriteString(code)), map: null };
        },
    },
});

const rewriteBentoVariables = (): Plugin => ({
    name: 'rewrite-bento-css-variables',
    enforce: 'post',
    transform(code, id) {
        if (!isStyleModule(id) || !hasBentoStyles(code)) return null;

        return {
            code: rewriteString(code),
            map: null,
        };
    },
    generateBundle(_outputOptions, bundle) {
        for (const output of Object.values(bundle)) {
            if (output.type === 'asset' && isCssAsset(output.fileName)) {
                output.source = rewriteSource(output.source);
            }
        }
    },
});

export const rewriteBentoCssVariables = (): Plugin[] => [scopeBentoComponentStyles(), rewriteBentoVariables()];
