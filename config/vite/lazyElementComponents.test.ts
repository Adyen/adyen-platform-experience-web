/**
 * @vitest-environment node
 */
import { describe, expect, test, vi } from 'vitest';
import { LAZY_ELEMENT_COMPONENT_PREFIX, lazyElementComponents } from './lazyElementComponents';

const ELEMENT_FILE = '/repo/packages/domains/transactions/vue/src/TransactionsOverview/TransactionsOverviewElement.ts';
const CONTAINER_FILE = '/repo/packages/domains/transactions/vue/src/TransactionsOverview/components/TransactionsOverviewContainer.vue';

type ResolvedId = { id: string; external?: boolean } | null;

const runResolveId = async (source: string, importer: string | undefined, resolved: ResolvedId = { id: CONTAINER_FILE }) => {
    const { resolveId } = lazyElementComponents();
    if (typeof resolveId !== 'function') throw new TypeError('Expected lazyElementComponents to provide a resolveId hook');

    const resolve = vi.fn().mockResolvedValue(resolved);
    const result = await resolveId.call({ resolve } as never, source, importer, { attributes: {}, isEntry: false });
    return { resolve, result };
};

const runLoad = (id: string) => {
    const { load } = lazyElementComponents();
    if (typeof load !== 'function') throw new TypeError('Expected lazyElementComponents to provide a load hook');

    return load.call({} as never, id);
};

const getImportedLiteral = (code: unknown) => {
    const literal = typeof code === 'string' ? /import\(("(?:[^"\\]|\\.)*")\)/.exec(code)?.[1] : undefined;
    if (!literal) throw new TypeError('Expected the generated code to contain a dynamic import');

    return literal;
};

const getImportedSpecifier = (code: unknown) => JSON.parse(getImportedLiteral(code)) as string;

describe('lazyElementComponents', () => {
    test('redirects Vue imports made by element files to a lazy wrapper', async () => {
        const { resolve, result } = await runResolveId('./components/TransactionsOverviewContainer.vue', ELEMENT_FILE);

        expect(resolve).toHaveBeenCalledWith(
            './components/TransactionsOverviewContainer.vue',
            ELEMENT_FILE,
            expect.objectContaining({ skipSelf: true })
        );
        expect(result).toBe(`${LAZY_ELEMENT_COMPONENT_PREFIX}${CONTAINER_FILE}`);
    });

    test('handles Windows-style importer paths', async () => {
        const { result } = await runResolveId('./components/TransactionsOverviewContainer.vue', ELEMENT_FILE.replace(/\//g, '\\'));

        expect(result).toBe(`${LAZY_ELEMENT_COMPONENT_PREFIX}${CONTAINER_FILE}`);
    });

    test.each([
        ['non-Vue imports from element files', '@integration-components/core/vue', ELEMENT_FILE],
        [
            'Vue imports from non-element files',
            './Child.vue',
            '/repo/packages/domains/transactions/vue/src/TransactionsOverview/components/Parent.vue',
        ],
        ['Vue imports from shared packages', './UIElementProvider.vue', '/repo/packages/shared/core/src/vue/UIElement.ts'],
        ['entry modules', './components/TransactionsOverviewContainer.vue', undefined],
    ])('leaves %s untouched', async (_, source, importer) => {
        const { resolve, result } = await runResolveId(source, importer);

        expect(resolve).not.toHaveBeenCalled();
        expect(result).toBeNull();
    });

    test.each([
        ['unresolved', null],
        ['external', { id: CONTAINER_FILE, external: true }],
    ])('leaves %s Vue imports untouched', async (_, resolved) => {
        const { result } = await runResolveId('./components/TransactionsOverviewContainer.vue', ELEMENT_FILE, resolved);

        expect(result).toBeNull();
    });

    test('loads a defineAsyncComponent wrapper that dynamically imports the original component', () => {
        const code = runLoad(`${LAZY_ELEMENT_COMPONENT_PREFIX}${CONTAINER_FILE}`);

        expect(code).toContain(`import { defineAsyncComponent } from 'vue';`);
        expect(code).toContain('export default defineAsyncComponent(() => import(');
        expect(getImportedSpecifier(code)).toBe(CONTAINER_FILE);
    });

    test('escapes characters that are unsafe to embed in generated code', () => {
        const unsafeFile = '/repo/<script>\u2028\u2029.vue';
        const code = runLoad(`${LAZY_ELEMENT_COMPONENT_PREFIX}${unsafeFile}`);

        expect(getImportedLiteral(code)).not.toMatch(/[<>\u2028\u2029]/);
        expect(getImportedSpecifier(code)).toBe(unsafeFile);
    });

    test('ignores ids it did not create', () => {
        expect(runLoad(CONTAINER_FILE)).toBeNull();
    });
});
