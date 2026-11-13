/**
 * @vitest-environment node
 */
import type { Rollup } from 'vite';
import { describe, expect, test } from 'vitest';
import { rewriteBentoCssVariables } from './rewriteBentoCssVariables';

const runGenerateBundle = (bundle: Rollup.OutputBundle) => {
    const generateBundle = rewriteBentoCssVariables().generateBundle;

    if (typeof generateBundle !== 'function') {
        throw new TypeError('Expected rewriteBentoCssVariables to provide a generateBundle hook');
    }

    return generateBundle.call({} as never, {} as never, bundle, false);
};

const runTransform = async (code: string, id: string) => {
    const transform = rewriteBentoCssVariables().transform;

    if (typeof transform !== 'function') {
        throw new TypeError('Expected rewriteBentoCssVariables to provide a transform hook');
    }

    return await transform.call({} as never, code, id);
};

const bundleWithAsset = (fileName: string, source: string | Uint8Array) =>
    ({
        [fileName]: {
            type: 'asset',
            fileName,
            source,
        },
    }) as unknown as Rollup.OutputBundle;

const getAsset = (bundle: Rollup.OutputBundle, fileName: string): Rollup.OutputAsset => {
    const output = bundle[fileName];

    if (output?.type !== 'asset') {
        throw new TypeError(`Expected "${fileName}" to be an asset`);
    }

    return output;
};

describe('rewriteBentoCssVariables', () => {
    test.each(['library.css', 'library.scss', 'Component.vue?vue&type=style&index=0&lang.css', 'Component.vue?type=style&vue&index=0'])(
        'rewrites Bento variables while serving %s',
        async id => {
            await expect(runTransform(':root{--b-color:red;color:var(--b-color)}', id)).resolves.toEqual({
                code: ':root,[data-adyen-pe-theme-root]{--adyen-sdk-color:red;color:var(--adyen-sdk-color)}',
                map: null,
            });
        }
    );

    test('redeclares Bento light defaults on every registered theme root', async () => {
        await expect(
            runTransform(':root{--b-color-background-primary:#fff}', '/node_modules/@adyen/bento-design-tokens/dist/css/bento/variables.css')
        ).resolves.toEqual({
            code: ':root,[data-adyen-pe-theme-root]{--adyen-sdk-color-background-primary:#fff}',
            map: null,
        });
    });

    test('does not transform modules that are neither styles nor scripts', async () => {
        await expect(runTransform('{"variable":"--b-color"}', 'data.json')).resolves.toBeNull();
    });

    test.each([
        '/node_modules/some-library/dist/index.js',
        '/node_modules/.vite/deps/some-library.js?v=1a2b3c4d',
        'library.ts',
        'library.mjs',
        'Component.vue',
        'Component.vue?vue&type=script&setup=true&lang.ts',
    ])('rewrites Bento variable names in string literals of %s', async id => {
        const code = [
            'floating.style.setProperty("--b-dropdown-available-height", height);',
            "getComputedStyle(floating).getPropertyValue('--b-spacer-040');",
            'const color = `var(--b-color)`;',
            'const style = "border: 1px solid var(--b-color-outline-primary)";',
        ].join('');

        await expect(runTransform(code, id)).resolves.toEqual({
            code: [
                'floating.style.setProperty("--adyen-sdk-dropdown-available-height", height);',
                "getComputedStyle(floating).getPropertyValue('--adyen-sdk-spacer-040');",
                'const color = `var(--adyen-sdk-color)`;',
                'const style = "border: 1px solid var(--adyen-sdk-color-outline-primary)";',
            ].join(''),
            map: null,
        });
    });

    test('only rewrites Bento variable names in scripts, not theme class names or selectors', async () => {
        await expect(runTransform('const theme = "b-dark-theme";const root = ":root";const variable = "--b-color";', 'library.js')).resolves.toEqual({
            code: 'const theme = "b-dark-theme";const root = ":root";const variable = "--adyen-sdk-color";',
            map: null,
        });
    });

    test('does not transform scripts without Bento variable names in string literals', async () => {
        await expect(
            runTransform('let b = 2, c = 1, x = --b-c;const theme = "b-dark-theme";const other = "--my--b-color";', 'library.js')
        ).resolves.toBeNull();
    });

    test.each([
        {
            scenario: 'every Bento variable declaration and reference',
            source: ':root{--b-color:red;--b-spacing:8px}.button{color:var(--b-color);margin:var(--b-spacing) var(--other)}/* --b-comment */',
            expected:
                ':root,[data-adyen-pe-theme-root]{--adyen-sdk-color:red;--adyen-sdk-spacing:8px}.button{color:var(--adyen-sdk-color);margin:var(--adyen-sdk-spacing) var(--other)}/* --adyen-sdk-comment */',
        },
        {
            scenario: 'the .b-dark-theme selector',
            source: '.b-dark-theme{color:red}.b-dark-theme .item{background:blue}',
            expected: "[data-adyen-pe-theme='dark']{color:red}[data-adyen-pe-theme='dark'] .item{background:blue}",
        },
        {
            scenario: 'only exact names when substrings appear inside other names',
            source: ':root{--my--b-color:blue;--b-color:red}.b-dark-theme-container{color:green}.b-dark-theme{color:black}',
            expected:
                ":root,[data-adyen-pe-theme-root]{--my--b-color:blue;--adyen-sdk-color:red}.b-dark-theme-container{color:green}[data-adyen-pe-theme='dark']{color:black}",
        },
    ])('rewrites $scenario in emitted CSS assets', ({ source, expected }) => {
        const bundle = bundleWithAsset('assets/library.css', source);

        runGenerateBundle(bundle);

        expect(getAsset(bundle, 'assets/library.css').source).toBe(expected);
    });

    test('rewrites Uint8Array CSS sources while retaining their source type', () => {
        const encoder = new TextEncoder();
        const bundle = bundleWithAsset('assets/library.CSS', encoder.encode(':root{--b-color:red;color:var(--b-color)}'));

        runGenerateBundle(bundle);

        const source = getAsset(bundle, 'assets/library.CSS').source;
        expect(source).toBeInstanceOf(Uint8Array);
        expect(new TextDecoder().decode(source as Uint8Array)).toBe(
            ':root,[data-adyen-pe-theme-root]{--adyen-sdk-color:red;color:var(--adyen-sdk-color)}'
        );
    });

    test('retains CSS sources that do not reference Bento variables', () => {
        const source = new TextEncoder().encode(':root{--other-color:red}');
        const bundle = bundleWithAsset('assets/library.css', source);

        runGenerateBundle(bundle);

        expect(getAsset(bundle, 'assets/library.css').source).toBe(source);
    });

    test('does not modify non-CSS assets or chunks', () => {
        const source = new Uint8Array([0, 1, 2, 3]);
        const image = {
            type: 'asset',
            fileName: 'assets/image.bin',
            source,
        };
        const chunk = {
            type: 'chunk',
            fileName: 'index.js',
            code: 'const variable = "--b-color";',
        };
        const bundle = {
            'assets/image.bin': image,
            'index.js': chunk,
        } as unknown as Rollup.OutputBundle;

        runGenerateBundle(bundle);

        expect(bundle['assets/image.bin']).toBe(image);
        expect(image.source).toBe(source);
        expect(bundle['index.js']).toBe(chunk);
        expect(chunk.code).toBe('const variable = "--b-color";');
    });
});
