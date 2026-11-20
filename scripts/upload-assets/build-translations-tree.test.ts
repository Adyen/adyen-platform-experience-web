/**
 * @vitest-environment node
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));

const runBuild = (sourceDirectory: string, targetDirectory: string) => {
    const result = spawnSync(process.execPath, [join(scriptDirectory, 'build-translations-tree.mjs'), sourceDirectory, targetDirectory], {
        encoding: 'utf8',
        timeout: 30000,
    });
    return { status: result.status, stdout: result.stdout, stderr: result.stderr };
};

const writeFile = (root: string, relativePath: string, contents: string): void => {
    const filePath = join(root, relativePath);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, contents);
};

const writeCatalog = (root: string, relativePath: string, catalog: Record<string, string>): void => {
    writeFile(root, relativePath, `${JSON.stringify(catalog, null, 4)}\n`);
};

const readJson = (filePath: string) => JSON.parse(readFileSync(filePath, 'utf8'));

const withTemporaryRoot = (run: (paths: { source: string; target: string }) => void): void => {
    const root = mkdtempSync(join(tmpdir(), 'build-translations-tree-'));
    try {
        run({ source: join(root, 'source'), target: join(root, 'target') });
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
};

test('stages one self-describing catalog per locale, minified, plus the translator index', () => {
    withTemporaryRoot(({ source, target }) => {
        const indentedCatalog = `${JSON.stringify({ 'alpha.greeting': 'Hello', 'alpha.farewell': 'Goodbye' }, null, 4)}\n`;
        writeFile(source, 'en-US.json', indentedCatalog);
        writeCatalog(source, 'da-DK.json', { 'alpha.greeting': 'Hej' });

        const result = runBuild(source, target);

        expect(result.status).toBe(0);
        expect(result.stderr).toBe('');
        expect(readdirSync(target).sort()).toEqual(['index.json', 'locales']);
        expect(readdirSync(join(target, 'locales')).sort()).toEqual(['da-DK.json', 'en-US.json']);

        // Each catalog keeps its own keys, so a stale copy is never read against another key.
        expect(readJson(join(target, 'locales/en-US.json'))).toEqual({ 'alpha.greeting': 'Hello', 'alpha.farewell': 'Goodbye' });
        expect(readJson(join(target, 'locales/da-DK.json'))).toEqual({ 'alpha.greeting': 'Hej' });

        // The staged catalog is minified, and strictly smaller than the indented source.
        const staged = readFileSync(join(target, 'locales/en-US.json'), 'utf8');
        expect(staged).not.toContain('\n    ');
        expect(staged.length).toBeLessThan(indentedCatalog.length);
    });
});

test('the index carries the en-US copy, the instruction, and the placeholders of every key', () => {
    withTemporaryRoot(({ source, target }) => {
        writeCatalog(source, 'en-US.json', {
            'alpha.amount': 'Up to %{amount} for %{days} days',
            'alpha.plain': 'Plain copy',
            'alpha.unit__plural': 'days',
        });
        writeCatalog(source, 'en-US.instructions.json', { 'alpha.amount': 'Eligibility title.' });

        const result = runBuild(source, target);

        expect(result.status).toBe(0);
        expect(readJson(join(target, 'index.json'))).toEqual({
            'alpha.amount': {
                'en-US': 'Up to %{amount} for %{days} days',
                instruction: 'Eligibility title.',
                placeholders: ['amount', 'days'],
            },
            // A key without an instruction keeps the field out, and a key without placeholders
            // still carries the empty array.
            'alpha.plain': { 'en-US': 'Plain copy', placeholders: [] },
            // Plural variants are entries of their own.
            'alpha.unit__plural': { 'en-US': 'days', placeholders: [] },
        });

        // The raw instructions file does not ship: the index replaces it.
        expect(readdirSync(target)).not.toContain('en-US.instructions.json');
    });
});

test('stages nested catalog directories, so the bento mirror reaches the CDN', () => {
    withTemporaryRoot(({ source, target }) => {
        writeCatalog(source, 'en-US.json', { 'alpha.greeting': 'Hello' });
        writeCatalog(source, 'bento/en-US.json', { 'bento.alert.close': 'Close' });
        writeCatalog(source, 'bento/de-DE.json', { 'bento.alert.close': 'Schließen' });

        const result = runBuild(source, target);

        expect(result.status).toBe(0);
        expect(readJson(join(target, 'bento/locales/de-DE.json'))).toEqual({ 'bento.alert.close': 'Schließen' });
        expect(readJson(join(target, 'bento/index.json'))).toEqual({
            'bento.alert.close': { 'en-US': 'Close', placeholders: [] },
        });
    });
});

test('copies non-catalog files verbatim', () => {
    withTemporaryRoot(({ source, target }) => {
        writeFile(source, 'README.txt', 'not json\n');
        writeCatalog(source, 'en-US.json', { 'alpha.greeting': 'Hello' });

        const result = runBuild(source, target);

        expect(result.status).toBe(0);
        expect(readFileSync(join(target, 'README.txt'), 'utf8')).toBe('not json\n');
    });
});

test('a malformed catalog fails the run instead of publishing broken JSON', () => {
    withTemporaryRoot(({ source, target }) => {
        writeFile(source, 'en-US.json', '{ "alpha.greeting": "Hello"');

        const result = runBuild(source, target);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('malformed translation catalog');
        expect(result.stderr).toContain('en-US.json');
    });
});

test('an instruction for a key that no longer exists fails the run', () => {
    withTemporaryRoot(({ source, target }) => {
        writeCatalog(source, 'en-US.json', { 'alpha.greeting': 'Hello' });
        writeCatalog(source, 'en-US.instructions.json', { 'alpha.removed': 'Stale instruction.' });

        const result = runBuild(source, target);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('instruction(s) for key(s) that no longer exist');
        expect(result.stderr).toContain('alpha.removed');
    });
});

test('a catalog directory without en-US fails the run, since the index cannot be built', () => {
    withTemporaryRoot(({ source, target }) => {
        writeCatalog(source, 'da-DK.json', { 'alpha.greeting': 'Hej' });

        const result = runBuild(source, target);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('en-US.json not found');
    });
});

test('a missing source directory fails with a clear message', () => {
    withTemporaryRoot(({ source, target }) => {
        const result = runBuild(join(source, 'does-not-exist'), target);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('Source directory not found');
    });
});
