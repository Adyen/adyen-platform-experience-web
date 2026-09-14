import type { Plugin } from 'vite';

const SDK_VARIABLE_PREFIX = '--adyen-sdk-';
const SDK_DARK_THEME_SELECTOR = "[data-adyen-pe-theme='dark']";
const BENTO_VARIABLE_REGEX = /(?<![\w-])--b-/g;
const BENTO_DARK_THEME_REGEX = /(?<![\w-])\.b-dark-theme(?![\w-])/g;
const BENTO_VARIABLE_TEST_REGEX = /(?<![\w-])--b-/;
const BENTO_DARK_THEME_TEST_REGEX = /(?<![\w-])\.b-dark-theme(?![\w-])/;

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

const isCssAsset = (fileName: string) => /\.css$/i.test(fileName);
const isStyleModule = (id: string) => /\.(?:css|less|sass|scss|styl|stylus)(?:$|\?)/i.test(id) || /[?&]vue&type=style(?:&|$)/.test(id);

const sourceToString = (source: string | Uint8Array) => (typeof source === 'string' ? source : textDecoder.decode(source));

const hasBentoStyles = (source: string): boolean =>
    BENTO_VARIABLE_TEST_REGEX.test(source) || BENTO_DARK_THEME_TEST_REGEX.test(source);

const rewriteString = (source: string): string =>
    source
        .replace(BENTO_VARIABLE_REGEX, SDK_VARIABLE_PREFIX)
        .replace(BENTO_DARK_THEME_REGEX, SDK_DARK_THEME_SELECTOR);

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
