/**
 * @vitest-environment node
 */
import { execFileSync, spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { expect, test, vi } from 'vitest';
import { createSynchronizationScheduler, isDomainCatalogFile } from './sync-sdk-catalogs.mjs';
import { createTranslationsProject, runProcessTranslationsScript, waitFor } from './testing/testProject';

const scriptPath = join(dirname(fileURLToPath(import.meta.url)), 'sync-sdk-catalogs.mjs');

const createProjectRoot = (): string => {
    const root = mkdtempSync(join(tmpdir(), 'process-translations-'));
    createTranslationsProject(root);
    return root;
};

const readCatalog = (root: string, relativePath: string): Record<string, string> =>
    JSON.parse(readFileSync(join(root, relativePath), 'utf8')) as Record<string, string>;

const writeCatalog = (root: string, relativePath: string, translations: Record<string, string>): void => {
    writeFileSync(join(root, relativePath), `${JSON.stringify(translations, null, 4)}\n`);
};

// The watch mode deliberately skips itself in CI environments, so the tests that exercise the
// watcher must spawn it without the CI marker even when the suite itself runs on CI.
const spawnWatcher = (root: string) => {
    const environment = { ...process.env };
    delete environment.CI;
    return spawn(process.execPath, [scriptPath, '--watch', `--root=${root}`], { stdio: ['ignore', 'pipe', 'pipe'], env: environment });
};

test('the check mode passes when the SDK catalogs match the domain catalogs', () => {
    const root = createProjectRoot();
    try {
        const result = runProcessTranslationsScript('sync-sdk-catalogs.mjs', ['--check', `--root=${root}`]);
        expect(result.status).toBe(0);
        expect(result.stdout).toContain('SDK catalogs are synchronized with domain translations.');
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});

test('a changed domain catalog is merged and sorted into the SDK catalogs', () => {
    const root = createProjectRoot();
    try {
        writeCatalog(root, 'packages/domains/alpha/vue/translations/en-US.json', {
            'alpha.greeting': 'Hello',
            'alpha.greeting.labels.short': 'Hey',
            'alpha.farewell': 'Goodbye',
        });

        const result = runProcessTranslationsScript('sync-sdk-catalogs.mjs', [`--root=${root}`]);
        expect(result.status).toBe(0);
        expect(result.stdout).toContain('Synchronized packages/sdk/translations/en-US.json.');

        const catalog = readCatalog(root, 'packages/sdk/translations/en-US.json');

        expect(catalog).toEqual({
            'alpha.farewell': 'Goodbye',
            'alpha.greeting': 'Hello',
            'alpha.greeting.labels.short': 'Hey',
            'beta.greeting': 'Hi',
        });

        expect(Object.keys(catalog)).toEqual(['alpha.farewell', 'alpha.greeting', 'alpha.greeting.labels.short', 'beta.greeting']);
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});

test('the check mode fails when a domain catalog has drifted from the SDK catalogs', () => {
    const root = createProjectRoot();
    try {
        writeCatalog(root, 'packages/domains/alpha/vue/translations/en-US.json', { 'alpha.farewell': 'Farvel', 'alpha.greeting': 'Hello' });

        const result = runProcessTranslationsScript('sync-sdk-catalogs.mjs', ['--check', `--root=${root}`]);
        expect(result.status).toBe(1);
        expect(result.stderr).toContain('packages/sdk/translations/en-US.json is not synchronized with domain translations.');
        expect(result.stderr).toContain('Run `pnpm run translations:sync` and commit the generated SDK catalog updates.');
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});

test('a domain catalog key outside its namespace fails the synchronization', () => {
    const root = createProjectRoot();
    try {
        writeCatalog(root, 'packages/domains/alpha/vue/translations/en-US.json', { 'alpha.greeting': 'Hello', 'zeta.greeting': 'Hello' });

        const result = runProcessTranslationsScript('sync-sdk-catalogs.mjs', [`--root=${root}`]);
        expect(result.status).not.toBe(0);
        expect(result.stderr).toContain('contains a key outside the alpha namespace: zeta.greeting');
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});

test('the staged mode stages the regenerated SDK catalogs without touching the working tree', () => {
    const root = createProjectRoot();
    try {
        execFileSync('git', ['init'], { cwd: root, stdio: 'ignore' });
        execFileSync('git', ['add', '.'], { cwd: root });

        // Stage a domain catalog change the way the pre-commit hook receives it.
        writeCatalog(root, 'packages/domains/alpha/vue/translations/en-US.json', {
            'alpha.farewell': 'Goodbye',
            'alpha.greeting': 'Hello',
            'alpha.greeting.labels.short': 'Hey',
        });

        execFileSync('git', ['add', 'packages/domains/alpha/vue/translations/en-US.json'], { cwd: root });

        const result = runProcessTranslationsScript('sync-sdk-catalogs.mjs', ['--staged', `--root=${root}`]);
        expect(result.status).toBe(0);
        expect(result.stdout).toContain('Synchronized packages/sdk/translations/en-US.json.');

        // The regenerated catalog is staged for the upcoming commit...
        const stagedCatalog = JSON.parse(
            execFileSync('git', ['show', ':packages/sdk/translations/en-US.json'], { cwd: root, encoding: 'utf8' })
        ) as Record<string, string>;

        expect(stagedCatalog).toEqual({
            'alpha.farewell': 'Goodbye',
            'alpha.greeting': 'Hello',
            'alpha.greeting.labels.short': 'Hey',
            'beta.greeting': 'Hi',
        });

        // ...while the working tree copy is left exactly as it was.
        expect(readCatalog(root, 'packages/sdk/translations/en-US.json')).toEqual({
            'alpha.farewell': 'Goodbye',
            'alpha.greeting': 'Hello',
            'beta.greeting': 'Hi',
        });
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});

test('the watch mode cannot be combined with the check or staged modes', () => {
    const result = runProcessTranslationsScript('sync-sdk-catalogs.mjs', ['--watch', '--staged']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('The --watch option cannot be combined with --check or --staged.');
});

test('the watch mode re-synchronizes the SDK catalogs after a domain catalog changes', async () => {
    const root = createProjectRoot();
    const watcher = spawnWatcher(root);
    let output = '';

    const collectOutput = (stream: Readable | null) => {
        if (!stream) throw new Error('Expected a piped output stream.');
        stream.setEncoding('utf8');
        stream.on('data', (chunk: string) => {
            output += chunk;
        });
    };

    collectOutput(watcher.stdout);
    collectOutput(watcher.stderr);

    try {
        await waitFor(() => output.includes('Watching for domain catalog changes'));
        writeCatalog(root, 'packages/domains/alpha/vue/translations/en-US.json', { 'alpha.greeting': 'Howdy', 'alpha.farewell': 'Goodbye' });

        await waitFor(() => readCatalog(root, 'packages/sdk/translations/en-US.json')['alpha.greeting'] === 'Howdy');
        expect(output).toContain('Re-synchronizing after changes in packages/domains/alpha/vue/translations/en-US.json.');
    } finally {
        watcher.kill('SIGTERM');

        await new Promise<void>(resolve => {
            if (watcher.exitCode !== null || watcher.signalCode) {
                resolve();
            } else {
                watcher.once('exit', resolve);
            }
        });

        rmSync(root, { recursive: true, force: true });
    }
}, 30000);

test('the watch mode stays alive when the initial synchronization fails', async () => {
    const root = createProjectRoot();

    // A domain catalog key outside its namespace fails the initial synchronization.
    writeCatalog(root, 'packages/domains/alpha/vue/translations/en-US.json', { 'alpha.greeting': 'Hello', 'zeta.greeting': 'Hello' });

    const watcher = spawnWatcher(root);
    let output = '';

    const collectOutput = (stream: Readable | null) => {
        if (!stream) throw new Error('Expected a piped output stream.');
        stream.setEncoding('utf8');
        stream.on('data', (chunk: string) => {
            output += chunk;
        });
    };

    collectOutput(watcher.stdout);
    collectOutput(watcher.stderr);

    try {
        await waitFor(() => output.includes('contains a key outside the alpha namespace'));

        // The watcher keeps running; fixing the catalog lets it recover on the next change.
        writeCatalog(root, 'packages/domains/alpha/vue/translations/en-US.json', { 'alpha.greeting': 'Howdy', 'alpha.farewell': 'Goodbye' });

        await waitFor(() => readCatalog(root, 'packages/sdk/translations/en-US.json')['alpha.greeting'] === 'Howdy');
        expect(output).toContain('Re-synchronizing after changes in packages/domains/alpha/vue/translations/en-US.json.');
    } finally {
        watcher.kill('SIGTERM');

        await new Promise<void>(resolve => {
            if (watcher.exitCode !== null || watcher.signalCode) {
                resolve();
            } else {
                watcher.once('exit', resolve);
            }
        });

        rmSync(root, { recursive: true, force: true });
    }
}, 30000);

test('the watch mode shuts down gracefully on SIGTERM', async () => {
    const root = createProjectRoot();
    const watcher = spawnWatcher(root);
    let output = '';

    const collectOutput = (stream: Readable | null) => {
        if (!stream) throw new Error('Expected a piped output stream.');
        stream.setEncoding('utf8');
        stream.on('data', (chunk: string) => {
            output += chunk;
        });
    };

    collectOutput(watcher.stdout);
    collectOutput(watcher.stderr);

    try {
        await waitFor(() => output.includes('Watching for domain catalog changes'));

        // Process managers and containers terminate with SIGTERM: the watcher is expected to stop
        // through its graceful shutdown path instead of dying by the signal's default disposition.
        watcher.kill('SIGTERM');

        const [exitCode, signalCode] = await new Promise<[number | null, NodeJS.Signals | null]>(resolve => {
            watcher.once('exit', (code, signal) => resolve([code, signal]));
        });

        expect(exitCode).toBe(0);
        expect(signalCode).toBeNull();
    } finally {
        await new Promise<void>(resolve => {
            if (watcher.exitCode !== null || watcher.signalCode) {
                resolve();
            } else {
                watcher.once('exit', resolve);
            }
        });

        rmSync(root, { recursive: true, force: true });
    }
}, 30000);

test('the watch mode is skipped in CI environments', () => {
    const root = createProjectRoot();
    try {
        const result = runProcessTranslationsScript('sync-sdk-catalogs.mjs', ['--watch', `--root=${root}`], { ...process.env, CI: 'true' });
        expect(result.status).toBe(0);
        expect(result.stdout).toContain('Translations watch skipped: CI environment detected.');
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});

test('synchronization passes never overlap when changes arrive during an active pass', async () => {
    vi.useFakeTimers();
    try {
        let activePasses = 0;
        let maxConcurrentPasses = 0;
        const observedPaths: string[][] = [];

        const scheduler = createSynchronizationScheduler(async (changedPaths: string[]) => {
            activePasses += 1;
            maxConcurrentPasses = Math.max(maxConcurrentPasses, activePasses);
            observedPaths.push(changedPaths);
            // A pass takes longer than the debounce delay, so a second change lands inside it.
            await new Promise(resolve => {
                setTimeout(resolve, 250);
            });
            activePasses -= 1;
        }, 100);

        scheduler.schedule('packages/domains/alpha/vue/translations/en-US.json');
        await vi.advanceTimersByTimeAsync(100);

        // The change arrives while the first pass is still running.
        scheduler.schedule('packages/domains/beta/vue/translations/en-US.json');
        await vi.advanceTimersByTimeAsync(700);

        expect(maxConcurrentPasses).toBe(1);
        expect(observedPaths).toEqual([
            ['packages/domains/alpha/vue/translations/en-US.json'],
            ['packages/domains/beta/vue/translations/en-US.json'],
        ]);
    } finally {
        vi.useRealTimers();
    }
});

test('catalog paths reported with Windows separators are recognized', () => {
    expect(isDomainCatalogFile('alpha/vue/translations/en-US.json')).toBe(true);
    expect(isDomainCatalogFile('alpha\\vue\\translations\\en-US.json')).toBe(true);
    expect(isDomainCatalogFile('alpha/vue/components/Greeting.vue')).toBe(false);
});
