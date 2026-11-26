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
const SCRIPT_BENTO_VARIABLE_REGEX = /(["'`]|var\()--b-/g;
const SCRIPT_BENTO_VARIABLE_TEST_REGEX = /(["'`]|var\()--b-/;

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

const splitModuleId = (id: string) => {
    const queryStart = id.indexOf('?');
    if (queryStart === -1) return { fileName: id, query: null };
    return { fileName: id.slice(0, queryStart), query: new URLSearchParams(id.slice(queryStart + 1)) };
};

const isCssAsset = (fileName: string) => /\.css$/i.test(fileName);
const isStyleModule = (id: string) => {
    const { fileName, query } = splitModuleId(id);

    if (/\.(?:css|less|sass|scss|styl|stylus)$/i.test(fileName)) return true;
    return !!query?.has('vue') && query.get('type') === 'style';
};
const isScriptModule = (id: string) => /\.(?:[cm]?[jt]sx?|vue)$/i.test(splitModuleId(id).fileName);

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

const rewriteString = (source: string): string =>
    rewriteReferences(rewriteDefaultBlocks(source))
        .replace(BENTO_DECLARATION_REGEX, `$1${SDK_VARIABLE_PREFIX}$2$3`)
        .replace(BENTO_DARK_THEME_REGEX, `$1${SDK_DARK_THEME_SELECTOR}`);

const rewriteScript = (source: string): string => rewriteReferences(source).replace(SCRIPT_BENTO_VARIABLE_REGEX, `$1${DEFAULT_VARIABLE_PREFIX}`);

const rewriteSource = (source: string | Uint8Array): string | Uint8Array => {
    const sourceString = sourceToString(source);

    if (!hasBentoStyles(sourceString)) return source;

    const rewrittenSource = rewriteString(sourceString);
    return typeof source === 'string' ? rewrittenSource : textEncoder.encode(rewrittenSource);
};

export const rewriteBentoCssVariables = (): Plugin => ({
    name: 'rewrite-bento-css-variables',
    enforce: 'post',
    transform(code, id) {
        if (isStyleModule(id)) {
            return hasBentoStyles(code) ? { code: rewriteString(code), map: null } : null;
        }

        if (isScriptModule(id) && SCRIPT_BENTO_VARIABLE_TEST_REGEX.test(code)) {
            return { code: rewriteScript(code), map: null };
        }

        return null;
    },
    generateBundle(_outputOptions, bundle) {
        for (const output of Object.values(bundle)) {
            if (output.type === 'asset' && isCssAsset(output.fileName)) {
                output.source = rewriteSource(output.source);
            }
        }
    },
});
