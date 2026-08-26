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
    test.each(['library.css', 'library.scss', 'Component.vue?vue&type=style&index=0&lang.css'])(
        'rewrites Bento variables while serving %s',
        async id => {
            await expect(runTransform(':root{--b-color:red;color:var(--b-color)}', id)).resolves.toEqual({
                code: ':root{--adyen-sdk-color:red;color:var(--adyen-sdk-color)}',
                map: null,
            });
        }
    );

    test('does not transform non-style modules while serving', async () => {
        await expect(runTransform('const variable = "--b-color";', 'library.ts')).resolves.toBeNull();
    });

    test('rewrites every Bento variable declaration and reference in emitted CSS assets', () => {
        const bundle = bundleWithAsset(
            'assets/library.css',
            ':root{--b-color:red;--b-spacing:8px}.button{color:var(--b-color);margin:var(--b-spacing) var(--other)}/* --b-comment */'
        );

        runGenerateBundle(bundle);

        expect(getAsset(bundle, 'assets/library.css').source).toBe(
            ':root{--adyen-sdk-color:red;--adyen-sdk-spacing:8px}.button{color:var(--adyen-sdk-color);margin:var(--adyen-sdk-spacing) var(--other)}/* --adyen-sdk-comment */'
        );
    });

    test('rewrites Uint8Array CSS sources while retaining their source type', () => {
        const encoder = new TextEncoder();
        const bundle = bundleWithAsset('assets/library.CSS', encoder.encode(':root{--b-color:red;color:var(--b-color)}'));

        runGenerateBundle(bundle);

        const source = getAsset(bundle, 'assets/library.CSS').source;
        expect(source).toBeInstanceOf(Uint8Array);
        expect(new TextDecoder().decode(source as Uint8Array)).toBe(':root{--adyen-sdk-color:red;color:var(--adyen-sdk-color)}');
    });

    test('retains CSS sources that do not reference Bento variables', () => {
        const source = new TextEncoder().encode(':root{--adyen-sdk-color:red}');
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
