import type { Plugin } from 'vite';
import { THEME_MODE_ATTRIBUTE, THEME_ROOT_ATTRIBUTE } from '@integration-components/types/theme';

const SDK_VARIABLE_PREFIX = '--adyen-sdk-';
const SDK_DARK_THEME_SELECTOR = `[${THEME_MODE_ATTRIBUTE}='dark']`;
const SDK_THEME_ROOT_SELECTOR = `[${THEME_ROOT_ATTRIBUTE}]`;
const BENTO_VARIABLE_REGEX = /(^|[^\w-])--b-/g;
const BENTO_DARK_THEME_REGEX = /(^|[^\w-])\.b-dark-theme(?![\w-])/g;
const BENTO_LIGHT_DEFAULTS_REGEX = /:root(?=\s*\{[^{}]*(?:--b-|--adyen-sdk-))/g;
const BENTO_VARIABLE_TEST_REGEX = /(^|[^\w-])--b-/;
const BENTO_DARK_THEME_TEST_REGEX = /(^|[^\w-])\.b-dark-theme(?![\w-])/;
const SDK_VARIABLE_TEST_REGEX = /(^|[^\w-])--adyen-sdk-/;
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
const hasSdkVariables = (source: string): boolean => SDK_VARIABLE_TEST_REGEX.test(source);

const rewriteString = (source: string): string =>
    source
        .replace(BENTO_LIGHT_DEFAULTS_REGEX, `:root,${SDK_THEME_ROOT_SELECTOR}`)
        .replace(BENTO_VARIABLE_REGEX, `$1${SDK_VARIABLE_PREFIX}`)
        .replace(BENTO_DARK_THEME_REGEX, `$1${SDK_DARK_THEME_SELECTOR}`);

const rewriteSource = (source: string | Uint8Array): string | Uint8Array => {
    const sourceString = sourceToString(source);

    if (!hasBentoStyles(sourceString) && !hasSdkVariables(sourceString)) return source;

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
            return { code: code.replace(SCRIPT_BENTO_VARIABLE_REGEX, `$1${SDK_VARIABLE_PREFIX}`), map: null };
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
