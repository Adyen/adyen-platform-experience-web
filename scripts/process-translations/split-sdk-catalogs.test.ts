/**
 * @vitest-environment node
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { createTranslationsProject, runProcessTranslationsScript } from './testing/testProject';

const createProjectRoot = (): string => {
    const root = mkdtempSync(join(tmpdir(), 'process-translations-'));
    createTranslationsProject(root);
    return root;
};

const readCatalog = (root: string, relativePath: string): Record<string, string> =>
    JSON.parse(readFileSync(join(root, relativePath), 'utf8')) as Record<string, string>;

const readCatalogContent = (root: string, relativePath: string): string => readFileSync(join(root, relativePath), 'utf8');

const writeCatalog = (root: string, relativePath: string, translations: Record<string, string>): void => {
    writeFileSync(join(root, relativePath), `${JSON.stringify(translations, null, 4)}\n`);
};

test('the check mode passes when the domain catalogs match their SDK subsets', () => {
    const root = createProjectRoot();
    try {
        const result = runProcessTranslationsScript('split-sdk-catalogs.mjs', ['--check', `--root=${root}`]);
        expect(result.status).toBe(0);
        expect(result.stdout).toContain('Domain catalogs are synchronized with SDK translations.');
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});

test('downloaded SDK translations are split back into the domain catalogs', () => {
    const root = createProjectRoot();
    try {
        // Simulate a translation download: the SDK Danish catalog is unsorted, carries a new value
        // for alpha, a first value for beta, and no longer contains the untranslated alpha farewell.
        writeCatalog(root, 'packages/sdk/translations/da-DK.json', { 'beta.greeting': 'Hej beta', 'alpha.greeting': 'Hejsan' });

        const downloadedContent = readCatalogContent(root, 'packages/sdk/translations/da-DK.json');
        const result = runProcessTranslationsScript('split-sdk-catalogs.mjs', [`--root=${root}`]);
        expect(result.status).toBe(0);

        // The split writes only the domain catalogs; the downloaded file itself stays untouched.
        expect(readCatalogContent(root, 'packages/sdk/translations/da-DK.json')).toBe(downloadedContent);
        expect(readCatalog(root, 'packages/domains/alpha/vue/translations/da-DK.json')).toEqual({ 'alpha.greeting': 'Hejsan' });
        expect(result.stdout).toContain('Synchronized packages/domains/alpha/vue/translations/da-DK.json.');
        expect(readCatalog(root, 'packages/domains/beta/vue/translations/da-DK.json')).toEqual({ 'beta.greeting': 'Hej beta' });
        expect(result.stdout).toContain('Synchronized packages/domains/beta/vue/translations/da-DK.json.');
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});

test('the check mode fails when a domain catalog no longer matches its SDK subset', () => {
    const root = createProjectRoot();
    try {
        writeCatalog(root, 'packages/sdk/translations/da-DK.json', { 'alpha.greeting': 'Hejsan' });

        const result = runProcessTranslationsScript('split-sdk-catalogs.mjs', ['--check', `--root=${root}`]);
        expect(result.status).toBe(1);
        expect(result.stderr).toContain('packages/domains/alpha/vue/translations/da-DK.json is not synchronized with its SDK catalog subset.');
        expect(result.stderr).toContain('Run `pnpm run translations:split` and commit the domain catalog updates.');
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});

test('SDK catalog keys outside every domain namespace fail the split', () => {
    const root = createProjectRoot();
    try {
        writeCatalog(root, 'packages/sdk/translations/en-US.json', { 'alpha.greeting': 'Hello', 'orphan.greeting': 'Hi' });

        const result = runProcessTranslationsScript('split-sdk-catalogs.mjs', [`--root=${root}`]);
        expect(result.status).not.toBe(0);
        expect(result.stderr).toContain('contains keys outside every domain namespace: orphan.greeting');
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});

test('a split followed by a sync round trip leaves both directions synchronized', () => {
    const root = createProjectRoot();
    try {
        writeCatalog(root, 'packages/sdk/translations/da-DK.json', { 'beta.greeting': 'Hej beta', 'alpha.greeting': 'Hejsan' });

        expect(runProcessTranslationsScript('split-sdk-catalogs.mjs', [`--root=${root}`]).status).toBe(0);

        // The sync normalizes the downloaded catalog: sorted keys and no dropped-domain noise.
        const syncResult = runProcessTranslationsScript('sync-sdk-catalogs.mjs', [`--root=${root}`]);
        expect(syncResult.status).toBe(0);
        expect(syncResult.stdout).toContain('Synchronized packages/sdk/translations/da-DK.json.');

        expect(runProcessTranslationsScript('split-sdk-catalogs.mjs', ['--check', `--root=${root}`]).status).toBe(0);
        expect(runProcessTranslationsScript('sync-sdk-catalogs.mjs', ['--check', `--root=${root}`]).status).toBe(0);
        expect(Object.keys(readCatalog(root, 'packages/sdk/translations/da-DK.json'))).toEqual(['alpha.greeting', 'beta.greeting']);
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});
