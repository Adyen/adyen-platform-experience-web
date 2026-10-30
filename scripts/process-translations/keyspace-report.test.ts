/**
 * @vitest-environment node
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { expect, test } from 'vitest';
import { runProcessTranslationsScript } from './testing/testProject';

const git = (root: string, args: string[]) =>
    spawnSync('/usr/bin/git', ['-c', 'user.email=report@test', '-c', 'user.name=Report Test', ...args], { cwd: root, encoding: 'utf8' });

const writeCatalog = (root: string, relativePath: string, translations: Record<string, string>): void => {
    const filePath = join(root, relativePath);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, `${JSON.stringify(translations, null, 4)}\n`);
};

const SDK = 'packages/sdk/translations/en-US.json';
const BENTO = 'packages/sdk/translations/bento/en-US.json';

const BASE_CATALOG = {
    'alpha.greeting.title': 'Hello',
    'alpha.list.amount': 'Amount',
    'alpha.list.status': 'Status',
    'alpha.errors.retry': 'Try again',
    'beta.greeting.title': 'Hi',
};

// Creates a repository whose base commit carries both catalogs, then applies
// one change of every kind the report distinguishes.
const createReportProject = (): string => {
    const root = mkdtempSync(join(tmpdir(), 'keyspace-report-'));
    writeCatalog(root, SDK, BASE_CATALOG);
    writeCatalog(root, BENTO, { 'bento.button.label': 'Ok' });
    git(root, ['init', '--quiet']);
    git(root, ['add', '-A']);
    git(root, ['commit', '--quiet', '-m', 'base']);
    return root;
};

test('reports added, removed, renamed, and value changes with measurements', () => {
    const root = createReportProject();
    try {
        const base = git(root, ['rev-parse', 'HEAD']).stdout.trim();
        writeCatalog(root, SDK, {
            'alpha.common.contactSupport': 'Hello', // renamed: value-identical to alpha.greeting.title
            'alpha.list.amount': 'Amounts', // value changed
            'alpha.errors.retry': 'Try again',
            'beta.greeting.title': 'Hi',
            'beta.overview.title': 'Overview', // added
            // alpha.greeting.title renamed away; alpha.list.status removed (its value matches no added key)
        });

        const result = runProcessTranslationsScript('keyspace-report.mjs', [base, `--root=${root}`]);

        expect(result.status).toBe(0);
        expect(result.stdout).toContain(`merge base ${base.slice(0, 10)}`);
        expect(result.stdout).toContain('added: 1 (beta 1)');
        expect(result.stdout).toContain('beta.overview.title');
        expect(result.stdout).toContain('removed: 1 (alpha 1)');
        expect(result.stdout).toContain('alpha.list.status');
        expect(result.stdout).toContain('renamed: 1 (alpha 1)');
        expect(result.stdout).toContain('alpha.greeting.title -> alpha.common.contactSupport');
        expect(result.stdout).toContain('values changed: 1 (alpha 1)');
        expect(result.stdout).toContain('keys');
        expect(result.stdout).toContain('enum-mirror share');
        expect(result.stdout).toContain('x11 locales');
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});

test('a catalog absent in the merge base is grandfathered', () => {
    const root = mkdtempSync(join(tmpdir(), 'keyspace-report-'));
    try {
        writeCatalog(root, SDK, BASE_CATALOG);
        git(root, ['init', '--quiet']);
        git(root, ['add', '-A']);
        git(root, ['commit', '--quiet', '-m', 'base']);
        const base = git(root, ['rev-parse', 'HEAD']).stdout.trim();
        writeCatalog(root, BENTO, { 'bento.button.label': 'Ok' });

        const result = runProcessTranslationsScript('keyspace-report.mjs', [base, `--root=${root}`]);

        expect(result.status).toBe(0);
        expect(result.stdout).toContain('grandfathering the initial catalog');
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});

test('rejects an invalid or unknown base reference', () => {
    const root = createReportProject();
    try {
        const dashed = runProcessTranslationsScript('keyspace-report.mjs', ['--root=' + root]);
        expect(dashed.status).toBe(1);
        expect(dashed.stderr).toContain('Base revision must be a plain git reference');

        const missing = runProcessTranslationsScript('keyspace-report.mjs', ['origin/does-not-exist', `--root=${root}`]);
        expect(missing.status).toBe(1);
        expect(missing.stderr).toContain('No merge base found');
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});
