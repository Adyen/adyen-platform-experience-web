/**
 * @vitest-environment node
 */
import type { Plugin, Rollup } from 'vite';
import { describe, expect, test } from 'vitest';
import { rewriteBentoCssVariables } from './rewriteBentoCssVariables';

const ROOT = '[data-adyen-pe-theme-root]';
const DARK = "[data-adyen-pe-theme='dark']";
/** A Bento variable reference after the rewrite: the public variable first, then the Bento default. */
const read = (name: string, fallback = '') => `var(--adyen-sdk-${name}, var(--adyen-pe-bento-${name}${fallback}))`;

const [scopePlugin, plugin] = rewriteBentoCssVariables() as [Plugin, Plugin];
type Transform = (code: string, id: string) => { code: string; map: null } | null;
const transform = plugin.transform as Transform;
const scopeTransform = (scopePlugin.transform as unknown as { handler: Transform }).handler;
const generateBundle = plugin.generateBundle as (options: unknown, bundle: Rollup.OutputBundle) => void;

/** Runs the bundle hook on one CSS asset and returns its source. */
const rewriteAsset = (source: string | Uint8Array, fileName = 'assets/library.css') => {
    const bundle = { [fileName]: { type: 'asset', fileName, source } } as unknown as Rollup.OutputBundle;
    generateBundle.call({}, {}, bundle);
    return (bundle[fileName] as Rollup.OutputAsset).source;
};

describe('rewriteBentoCssVariables', () => {
    test.each([
        ['moves the light defaults to theme roots under private names', ':root{--b-a:#fff}', `${ROOT}{--adyen-pe-bento-a:#fff}`],
        ['moves the dark defaults to dark theme roots', '.b-dark-theme{--b-a:#181818}', `${DARK}{--adyen-pe-bento-a:#181818}`],
        [
            'moves both default blocks when a bundle puts them next to each other',
            ':root{--b-a:1px}.b-dark-theme{--b-a:2px}',
            `${ROOT}{--adyen-pe-bento-a:1px}${DARK}{--adyen-pe-bento-a:2px}`,
        ],
        ['reads references from the public name first', '.a{color:var(--b-x)}', `.a{color:${read('x')}}`],
        ['keeps fallbacks', '.a{margin:var(--b-s, 4px) var(--other)}', `.a{margin:${read('s', ', 4px')} var(--other)}`],
        ['rewrites nested references', '.a{border:var( --b-y, var(--b-z))}', `.a{border:${read('y', `, ${read('z')}`)}}`],
        ['rewrites references inside the defaults', ':root{--b-a:var(--b-b)}', `${ROOT}{--adyen-pe-bento-a:${read('b')}}`],
        ['keeps component-level overrides public', '.tabs{--b-link:red}', '.tabs{--adyen-sdk-link:red}'],
        [
            'leaves --b- outside variables alone',
            ".a{--b-x:1px;background:url('/img/--b-image.png');content:'--b-label'}/* --b-note */",
            ".a{--adyen-sdk-x:1px;background:url('/img/--b-image.png');content:'--b-label'}/* --b-note */",
        ],
        ['rewrites the dark theme selector in other rules', '.b-dark-theme .item{color:red}', `${DARK} .item{color:red}`],
        [
            'ignores look-alike names',
            ':root{--my--b-a:blue;--b-a:red}.b-dark-theme-container{color:green}',
            `${ROOT}{--my--b-a:blue;--adyen-pe-bento-a:red}.b-dark-theme-container{color:green}`,
        ],
        ['leaves CSS without Bento variables alone', ':root{--adyen-sdk-a:#000}', ':root{--adyen-sdk-a:#000}'],
    ])('%s', (_name, source, expected) => {
        expect(rewriteAsset(source)).toBe(expected);
    });

    test.each(['library.css', 'library.scss', 'Component.vue?vue&type=style&index=0&lang.css', 'Component.vue?type=style&vue&index=0'])(
        'rewrites the style module %s while serving',
        id => {
            expect(transform.call({}, ':root{--b-a:red}', id)).toEqual({ code: `${ROOT}{--adyen-pe-bento-a:red}`, map: null });
        }
    );

    describe('scoping Bento component rules', () => {
        const BENTO_ID = '/node_modules/@adyen/bento-vue3/dist/assets/segmented-control.css';
        const SCOPE = `:where(${ROOT})`;
        const scope = (source: string, id = BENTO_ID) => scopeTransform.call({}, source, id)?.code ?? source;

        test.each([
            ['class rules', '.b-tab[data-v-1]{color:red}', `${SCOPE} .b-tab[data-v-1]{color:red}`],
            ['scope-id-only rules', '.inner[data-v-1]{color:red}', `${SCOPE} .inner[data-v-1]{color:red}`],
            ['each selector of a list', '.a,.b>.c{x:y}', `${SCOPE} .a,${SCOPE} .b>.c{x:y}`],
            ['rules inside media queries', '@media(hover:hover){.a:hover{x:y}}', `@media(hover:hover){${SCOPE} .a:hover{x:y}}`],
            ['dark rules on the root itself or on a descendant', `.b-dark-theme .a{x:y}`, `${SCOPE}${DARK} .a,${SCOPE} ${DARK} .a{x:y}`],
        ])('scopes %s to theme roots', (_name, source, expected) => {
            expect(scope(source)).toBe(expected);
        });

        test('leaves keyframes, font faces and :host rules alone', () => {
            const source = '@keyframes spin{from{opacity:0}to{opacity:1}}@font-face{font-family:x}[data-v-1]:host{display:block}';
            expect(scope(source)).toBe(source);
        });

        test('is idempotent', () => {
            const once = scope('.a{x:y}');
            expect(scope(once)).toBe(once);
        });

        test('does not scope styles outside Bento', () => {
            expect(scope('.a{x:y}', 'src/Component.vue?vue&type=style&index=0&lang.css')).toBe('.a{x:y}');
        });

        test('keeps comments, strings and braces in values intact', () => {
            expect(scope('/* .x{} */.a::after{content:"}{,"}')).toBe(`/* .x{} */${SCOPE} .a::after{content:"}{,"}`);
        });
    });

    test('does not transform non-style modules while serving', () => {
        expect(transform.call({}, 'const variable = "--b-a";', 'library.ts')).toBeNull();
    });

    test('leaves CSS it has already rewritten unchanged, so serving and bundling can both run', () => {
        const once = transform.call({}, ':root{--b-a:red}.b-dark-theme{--b-a:blue}.x{color:var(--b-a)}', 'library.css')!.code;
        expect(rewriteAsset(once)).toBe(once);
    });

    test('keeps the source type of Uint8Array assets, and returns untouched sources as they are', () => {
        const rewritten = rewriteAsset(new TextEncoder().encode(':root{--b-a:red}'), 'assets/library.CSS');
        expect(new TextDecoder().decode(rewritten as Uint8Array)).toBe(`${ROOT}{--adyen-pe-bento-a:red}`);

        const untouched = new TextEncoder().encode(':root{--other:red}');
        expect(rewriteAsset(untouched)).toBe(untouched);
    });

    test('does not modify non-CSS assets or chunks', () => {
        const image = { type: 'asset', fileName: 'assets/image.bin', source: new Uint8Array([0, 1]) };
        const chunk = { type: 'chunk', fileName: 'index.js', code: 'const variable = "--b-a";' };
        generateBundle.call({}, {}, { [image.fileName]: image, [chunk.fileName]: chunk } as unknown as Rollup.OutputBundle);

        expect(image.source).toEqual(new Uint8Array([0, 1]));
        expect(chunk.code).toBe('const variable = "--b-a";');
    });
});
