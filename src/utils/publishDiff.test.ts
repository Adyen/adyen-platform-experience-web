/**
 * @vitest-environment node
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { expect, test } from 'vitest';
import { diff, extractExportsFromContent, getMissingPackageEntrypoints } from '../../scripts/publish-diff/lib';

test('extractExportsFromContent ignores import aliases', () => {
    const content = ['import { Foo as F, Bar as B } from "./foo.js";', 'export { F as Foo, B as Bar };'].join('\n');

    expect(extractExportsFromContent(content)).toEqual(['Bar', 'Foo']);
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

interface Snapshot {
    jsExports: string[];
    esFileCount: number;
    cssHash: string | null;
    typeFiles: string[];
    typeTreeHash: string | null;
    missingPackageEntrypoints: Array<{ field: string; path: string }>;
    packageJson: Record<string, unknown>;
}

const createSnapshot = (overrides: Partial<Snapshot>): Snapshot => ({
    jsExports: [],
    esFileCount: 0,
    cssHash: null,
    typeFiles: [],
    typeTreeHash: null,
    missingPackageEntrypoints: [],
    packageJson: {},
    ...overrides,
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
