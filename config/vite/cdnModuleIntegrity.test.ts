/**
 * @vitest-environment node
 */
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseAst, type Plugin, type Rollup } from 'vite';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { CDN_MODULE_INTEGRITY_RUNTIME, cdnModuleIntegrity } from './cdnModuleIntegrity';
import { INTEGRITY_MANIFEST_PLACEHOLDER } from './cdnModuleIntegrityRuntime';

const ENTRY = 'entry.js';

const sha256 = (source: string) => createHash('sha256').update(source).digest('base64');

const fail = (error: string | { message: string }): never => {
    throw new Error(typeof error === 'string' ? error : error.message);
};

const getHook = <K extends 'transform' | 'generateBundle' | 'writeBundle'>(plugin: Plugin, name: K) => {
    const hook = plugin[name];
    if (typeof hook !== 'function') throw new TypeError(`Expected cdnModuleIntegrity to provide a ${name} hook`);
    return hook as (this: unknown, ...args: unknown[]) => unknown;
};

const createPlugin = () => {
    const plugin = cdnModuleIntegrity({ entryFileName: ENTRY });
    const resolved: Record<string, string> = {
        './lazy.ts': '/src/lazy.ts',
        './nested.ts': '/src/nested.ts',
        './styles.css': '/src/styles.css',
    };
    const context = {
        error: fail,
        parse: parseAst,
        resolve: async (specifier: string) => (specifier in resolved ? { id: resolved[specifier], external: false } : null),
    };

    const transform = async (code: string, id: string) =>
        ((await getHook(plugin, 'transform').call(context, code, id)) as { code: string } | null)?.code ?? null;

    const generateBundle = (bundle: Rollup.OutputBundle) => {
        getHook(plugin, 'generateBundle').call(context, {}, bundle);
        return bundle;
    };

    const writeBundle = (dir: string | undefined) => getHook(plugin, 'writeBundle').call(context, { dir }, {});

    return { transform, generateBundle, writeBundle };
};

const chunk = (fileName: string, code: string, overrides: Partial<Rollup.OutputChunk> = {}) =>
    ({ type: 'chunk', fileName, code, imports: [], dynamicImports: [], moduleIds: [], ...overrides }) as Rollup.OutputChunk;

/**
 * entry.js ──dynamic──▶ chunks/lazy.js ──dynamic──▶ chunks/nested.js
 *                         └─static─▶ chunks/shared.js ◀─static─┘ └─static─▶ chunks/deep.js
 */
const createBundle = async ({ transform }: ReturnType<typeof createPlugin>) => {
    const entryCode = await transform(`export const load = () => import('./lazy.ts');`, '/src/entry.ts');
    const lazyCode = await transform(`export default () => import('./nested.ts').then(m => m.default);`, '/src/lazy.ts');

    return {
        [ENTRY]: chunk(ENTRY, `${entryCode}\nJSON.parse("${INTEGRITY_MANIFEST_PLACEHOLDER}");`, {
            dynamicImports: ['chunks/lazy.js'],
            moduleIds: [CDN_MODULE_INTEGRITY_RUNTIME, '/src/entry.ts'],
        }),
        'chunks/lazy.js': chunk('chunks/lazy.js', lazyCode!, {
            imports: [ENTRY, 'chunks/shared.js'],
            dynamicImports: ['chunks/nested.js'],
            moduleIds: ['/src/lazy.ts'],
        }),
        'chunks/shared.js': chunk('chunks/shared.js', 'export const shared = 1;', { imports: [ENTRY], moduleIds: ['/src/shared.ts'] }),
        'chunks/nested.js': chunk('chunks/nested.js', 'export default 1;', {
            imports: ['chunks/shared.js', 'chunks/deep.js'],
            moduleIds: ['/src/nested.ts'],
        }),
        'chunks/deep.js': chunk('chunks/deep.js', 'export const deep = 1;', { moduleIds: ['/src/deep.ts'] }),
    } satisfies Rollup.OutputBundle;
};

const getCode = (bundle: Rollup.OutputBundle, fileName: string) => (bundle[fileName] as Rollup.OutputChunk).code;

describe('cdnModuleIntegrity transform', () => {
    test('routes dynamic imports through the integrity runtime', async () => {
        const code = await createPlugin().transform(
            `const a = () => import('./lazy.ts');\nconst b = () => import(\`./nested.ts\`);`,
            '/src/entry.ts'
        );

        expect(code).toBe(
            [
                `import { importWithIntegrity as __adyenPeImportWithIntegrity } from ${JSON.stringify(CDN_MODULE_INTEGRITY_RUNTIME)};`,
                `const a = () => __adyenPeImportWithIntegrity(() => import('./lazy.ts'), "__ADYEN_PE_DYNAMIC_IMPORT__:1");`,
                'const b = () => __adyenPeImportWithIntegrity(() => import(`./nested.ts`), "__ADYEN_PE_DYNAMIC_IMPORT__:0");',
            ].join('\n')
        );
    });

    test.each([
        ['modules without dynamic imports', `export const a = 1;`, '/src/a.ts'],
        ['mentions of import( outside of code', `export const a = 'import(x)';`, '/src/a.ts'],
        ['the integrity runtime itself', `export const a = () => import('./lazy.ts');`, CDN_MODULE_INTEGRITY_RUNTIME],
    ])('leaves %s untouched', async (_, code, id) => {
        expect(await createPlugin().transform(code, id)).toBeNull();
    });
});

describe('cdnModuleIntegrity generateBundle', () => {
    test('lists the chunks each dynamic import still needs, dependencies first', async () => {
        const plugin = createPlugin();
        const bundle = plugin.generateBundle(await createBundle(plugin));

        expect(getCode(bundle, ENTRY)).toContain(`__adyenPeImportWithIntegrity(() => import('./lazy.ts'), ["chunks/shared.js","chunks/lazy.js"])`);
        expect(getCode(bundle, 'chunks/lazy.js')).toContain(
            `__adyenPeImportWithIntegrity(() => import('./nested.ts'), ["chunks/deep.js","chunks/nested.js"]).then(m => m.default)`
        );
    });

    test('fails when the entry statically imports a chunk', async () => {
        const plugin = createPlugin();
        const bundle = await createBundle(plugin);
        bundle[ENTRY].imports = ['chunks/shared.js'];

        expect(() => plugin.generateBundle(bundle)).toThrow('The entry must not statically import other chunks');
    });

    test('fails when the integrity runtime is not bundled into the entry', async () => {
        const plugin = createPlugin();
        const bundle = await createBundle(plugin);
        bundle[ENTRY].moduleIds = ['/src/entry.ts'];

        expect(() => plugin.generateBundle(bundle)).toThrow('The integrity runtime must be bundled into the entry');
    });

    test('fails when a chunk is dynamically imported without the integrity runtime', async () => {
        const plugin = createPlugin();
        const bundle = await createBundle(plugin);
        bundle['chunks/shared.js'].dynamicImports = ['chunks/deep.js'];

        expect(() => plugin.generateBundle(bundle)).toThrow('chunks/shared.js dynamically imports chunks without integrity: chunks/deep.js');
    });

    test('fails when an unresolvable dynamic import survives tree-shaking, but not when it was removed', async () => {
        const plugin = createPlugin();
        const unresolvedCode = await plugin.transform(`export const a = path => import(path);`, '/src/dev-only.ts');

        const treeShakenBundle = await createBundle(plugin);
        expect(() => plugin.generateBundle(treeShakenBundle)).not.toThrow();

        const bundle = await createBundle(plugin);
        bundle['chunks/deep.js'].code = unresolvedCode!;
        expect(() => plugin.generateBundle(bundle)).toThrow('/src/dev-only.ts dynamically imports a non-static specifier');
    });

    test('lists no chunks for dynamic imports of pure CSS modules, which Vite removes', async () => {
        const plugin = createPlugin();
        const bundle = await createBundle(plugin);
        bundle['chunks/deep.js'].code = (await plugin.transform(`export const a = () => import('./styles.css');`, '/src/deep.ts'))!;

        expect(getCode(plugin.generateBundle(bundle), 'chunks/deep.js')).toContain(`, [])`);
    });
});

describe('cdnModuleIntegrity writeBundle', () => {
    let dir: string;

    beforeEach(async () => {
        dir = await mkdtemp(join(tmpdir(), 'cdn-module-integrity-'));
        await mkdir(join(dir, 'chunks'));
    });

    afterEach(() => rm(dir, { recursive: true, force: true }));

    const writeOutput = (bundle: Rollup.OutputBundle) =>
        Promise.all(Object.values(bundle).map(output => writeFile(join(dir, output.fileName), (output as Rollup.OutputChunk).code)));

    test('embeds the SRI hash of every preloaded chunk, as written to disk, in the entry', async () => {
        const plugin = createPlugin();
        const bundle = plugin.generateBundle(await createBundle(plugin));
        await writeOutput(bundle);
        await plugin.writeBundle(dir);

        const entry = await readFile(join(dir, ENTRY), 'utf8');
        const manifest = /JSON\.parse\(("(?:[^"\\]|\\.)*")\);$/.exec(entry)?.[1];

        expect(JSON.parse(JSON.parse(manifest!) as string)).toEqual(
            Object.fromEntries(
                ['chunks/deep.js', 'chunks/lazy.js', 'chunks/nested.js', 'chunks/shared.js'].map(file => [file, sha256(getCode(bundle, file))])
            )
        );
    });

    test('fails when the entry does not contain exactly one manifest placeholder', async () => {
        const plugin = createPlugin();
        const bundle = plugin.generateBundle(await createBundle(plugin));
        (bundle[ENTRY] as Rollup.OutputChunk).code = 'export {};';
        await writeOutput(bundle);

        await expect(plugin.writeBundle(dir)).rejects.toThrow('Expected one integrity manifest placeholder in the entry, found 0');
    });
});
