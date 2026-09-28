/**
 * @vitest-environment node
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { expect, test } from 'vitest';
import {
    buildSnapshot,
    diff,
    extractCjsExportsFromContent,
    extractDeclarationExports,
    extractExports,
    getMissingPackageEntrypoints,
    getPublicExportViolations,
    type Snapshot,
} from './lib';

test('extractExports reads named re-exports and import aliases', () => {
    const tempRoot = mkdtempSync(join(tmpdir(), 'publish-diff-'));
    try {
        writeFileSync(resolve(tempRoot, 'internal.js'), 'export const foo = 1;\n');
        writeFileSync(resolve(tempRoot, 'index.js'), "import { foo as f } from './internal.js';\nexport { f as Foo };\n");
        expect(extractExports(resolve(tempRoot, 'index.js'))).toEqual(['Foo']);
    } finally {
        rmSync(tempRoot, { recursive: true, force: true });
    }
});

test('extractExports reports wildcard exports alongside expanded names', () => {
    const tempRoot = mkdtempSync(join(tmpdir(), 'publish-diff-'));
    try {
        writeFileSync(resolve(tempRoot, 'internal.js'), 'export const foo = 1;\n');
        writeFileSync(resolve(tempRoot, 'index.js'), "export * from './internal.js';\n");

        const extracted = extractExports(resolve(tempRoot, 'index.js'));
        expect(extracted).toContain('*');
        expect(extracted).toContain('foo');
    } finally {
        rmSync(tempRoot, { recursive: true, force: true });
    }
});

test('extractExports reads inline exports and defaults', () => {
    const tempRoot = mkdtempSync(join(tmpdir(), 'publish-diff-'));
    try {
        writeFileSync(
            resolve(tempRoot, 'index.js'),
            'export const foo = 1;\nexport function bar() {}\nexport class Baz {}\nconst qux = 1;\nexport default qux;\n'
        );
        expect(extractExports(resolve(tempRoot, 'index.js'))).toEqual(['Baz', 'bar', 'default', 'foo']);
    } finally {
        rmSync(tempRoot, { recursive: true, force: true });
    }
});

test('extractCjsExportsFromContent reads assigned exports', () => {
    const content = '"use strict";exports.Foo=foo;exports.Bar=bar;';
    expect(extractCjsExportsFromContent(content)).toEqual(['Bar', 'Foo']);
});

test('extractCjsExportsFromContent reads module.exports and defineProperty patterns', () => {
    const content = [
        'module.exports.Ping = 1;',
        'module.exports["Pong"] = 2;',
        'function a() {}',
        'const Shorthand = 1;',
        'module.exports = { Inlined: a, Renamed: a, Shorthand };',
        "Object.defineProperty(exports, 'Defined', { value: 1 });",
        "Object.defineProperty(module.exports, 'Interoped', { value: 2 });",
        "Object.defineProperty(exports, '__esModule', { value: true });",
    ].join('\n');
    expect(extractCjsExportsFromContent(content)).toEqual(['Defined', 'Inlined', 'Interoped', 'Ping', 'Pong', 'Renamed', 'Shorthand']);
});

test('extractDeclarationExports follows re-exports', () => {
    const tempRoot = mkdtempSync(join(tmpdir(), 'publish-diff-'));
    try {
        writeFileSync(resolve(tempRoot, 'internal.d.ts'), 'export interface PublicType {}\nexport declare const PublicValue: string;');
        writeFileSync(resolve(tempRoot, 'index.d.ts'), "export { PublicValue, type PublicType } from './internal';");
        expect(extractDeclarationExports(resolve(tempRoot, 'index.d.ts'))).toEqual(['PublicType', 'PublicValue']);
    } finally {
        rmSync(tempRoot, { recursive: true, force: true });
    }
});

test('getMissingPackageEntrypoints reports missing declared entrypoints', () => {
    const tempRoot = mkdtempSync(join(tmpdir(), 'publish-diff-'));
    try {
        mkdirSync(resolve(tempRoot, 'dist'), { recursive: true });
        writeFileSync(resolve(tempRoot, 'dist/index.js'), '');
        expect(
            getMissingPackageEntrypoints(
                {
                    main: './dist/index.js',
                    module: null,
                    types: null,
                    style: './dist/style.css',
                    exports: {
                        './styles': './dist/styles.css',
                    },
                },
                tempRoot
            )
        ).toEqual([
            { field: 'style', path: './dist/style.css' },
            { field: 'exports["./styles"]', path: './dist/styles.css' },
        ]);
    } finally {
        rmSync(tempRoot, { recursive: true, force: true });
    }
});

test('buildSnapshot reads exports from the package module entrypoint', () => {
    const tempRoot = mkdtempSync(join(tmpdir(), 'publish-diff-'));
    try {
        mkdirSync(resolve(tempRoot, 'dist/es/public'), { recursive: true });
        writeFileSync(resolve(tempRoot, 'dist/es/index.js'), 'export { LegacyExport };');
        writeFileSync(resolve(tempRoot, 'dist/es/public/index.js'), 'export { PublicExport };');
        writeFileSync(
            resolve(tempRoot, 'package.json'),
            JSON.stringify({
                module: './dist/es/public/index.js',
            })
        );
        expect(buildSnapshot(tempRoot).jsExports).toEqual(['PublicExport']);
    } finally {
        rmSync(tempRoot, { recursive: true, force: true });
    }
});

const createSnapshot = (overrides: Partial<Snapshot>): Snapshot => ({
    jsExports: [],
    cjsExports: [],
    declarationExports: [],
    esFileCount: 0,
    cssHash: null,
    typeFiles: [],
    typeTreeHash: null,
    missingPackageEntrypoints: [],
    packageJson: { main: null, module: null, types: null, style: null, exports: null },
    ...overrides,
});

test('getPublicExportViolations reports leaked and missing exports', () => {
    const violations = getPublicExportViolations(
        createSnapshot({
            jsExports: ['InternalExport'],
            cjsExports: ['InternalExport'],
            declarationExports: ['InternalType'],
        })
    );

    expect(violations).toContain('  ES exports not allowlisted: InternalExport');
    expect(violations).toContain('  CommonJS exports not allowlisted: InternalExport');
    expect(violations).toContain('  Declaration exports not allowlisted: InternalType');
    expect(violations.some(entry => entry.startsWith('  ES exports missing:'))).toBe(true);
});

test('getPublicExportViolations rejects unaliased external prop types', () => {
    const violations = getPublicExportViolations(createSnapshot({ declarationExports: ['ComponentExternalProps'] }));
    expect(violations).toContain('  Declaration exports contain unaliased ExternalProps types: ComponentExternalProps');
});

test('diff reports declaration changes when file paths stay the same', () => {
    expect(
        diff(
            createSnapshot({
                typeFiles: ['components/Button.d.ts'],
                typeTreeHash: 'aaaaaaaaaaaa',
            }),
            createSnapshot({
                typeFiles: ['components/Button.d.ts'],
                typeTreeHash: 'bbbbbbbbbbbb',
            })
        )
    ).toEqual(['  Type declarations changed within existing files: aaaaaaaaaaaa... -> bbbbbbbbbbbb...']);
});

test('diff reports added and removed declaration files separately', () => {
    expect(
        diff(
            createSnapshot({
                typeFiles: ['components/Button.d.ts'],
                typeTreeHash: 'aaaaaaaaaaaa',
            }),
            createSnapshot({
                typeFiles: ['components/Card.d.ts'],
                typeTreeHash: 'bbbbbbbbbbbb',
            })
        )
    ).toEqual(['  Type files added (1): components/Card.d.ts', '  Type files removed (1): components/Button.d.ts']);
});
