import type { Plugin } from 'vite';

const BENTO_VARIABLE_PREFIX = '--b-';
const SDK_VARIABLE_PREFIX = '--adyen-sdk-';
const BENTO_DARK_THEME_SELECTOR = '.b-dark-theme';
const SDK_DARK_THEME_SELECTOR = "[data-adyen-pe-theme='dark']";
const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

const isCssAsset = (fileName: string) => /\.css$/i.test(fileName);
const isStyleModule = (id: string) => /\.(?:css|less|sass|scss|styl|stylus)(?:$|\?)/i.test(id) || /[?&]vue&type=style(?:&|$)/.test(id);

const sourceToString = (source: string | Uint8Array) => (typeof source === 'string' ? source : textDecoder.decode(source));

const hasBentoStyles = (source: string): boolean => source.includes(BENTO_VARIABLE_PREFIX) || source.includes(BENTO_DARK_THEME_SELECTOR);

const rewriteString = (source: string): string =>
    source.split(BENTO_VARIABLE_PREFIX).join(SDK_VARIABLE_PREFIX).split(BENTO_DARK_THEME_SELECTOR).join(SDK_DARK_THEME_SELECTOR);

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
