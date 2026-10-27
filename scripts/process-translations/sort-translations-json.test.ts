/**
 * @vitest-environment node
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

const scriptPath = join(dirname(fileURLToPath(import.meta.url)), 'sort-translations-json.sh');

const runSortScript = (filePaths: string[]): { status: number | null; stdout: string; stderr: string } => {
    const result = spawnSync('bash', [scriptPath, ...filePaths], { encoding: 'utf8', timeout: 120000 });
    return { status: result.status, stdout: result.stdout, stderr: result.stderr };
};

const readSortedKeys = (filePath: string): string[] => Object.keys(JSON.parse(readFileSync(filePath, 'utf8')));

test('a translation JSON file is sorted in place', () => {
    const root = mkdtempSync(join(tmpdir(), 'sort-translations-'));
    try {
        const catalogPath = join(root, 'en-US.json');
        writeFileSync(catalogPath, `${JSON.stringify({ zulu: 'z', alpha: 'a', mike: 'm' }, null, 4)}\n`);

        const result = runSortScript([catalogPath]);

        expect(result.status).toBe(0);
        expect(readSortedKeys(catalogPath)).toEqual(['alpha', 'mike', 'zulu']);
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
}, 60000);

test('file names with shell metacharacters are treated as literal file names', () => {
    const root = mkdtempSync(join(tmpdir(), 'sort-translations-'));
    try {
        // A single quote in the name used to break out of the evaluated node -e source, letting file
        // name content run as JavaScript: this payload terminates the node process when executed.
        const catalogPath = join(root, `x'));process.exit(9);((' .json`);
        writeFileSync(catalogPath, `${JSON.stringify({ zulu: 'z', alpha: 'a' }, null, 4)}\n`);

        const result = runSortScript([catalogPath]);

        expect(result.status).toBe(0);
        expect(readSortedKeys(catalogPath)).toEqual(['alpha', 'zulu']);
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
}, 60000);

test('a malformed translation JSON file fails the run', () => {
    const root = mkdtempSync(join(tmpdir(), 'sort-translations-'));
    try {
        const catalogPath = join(root, 'en-US.json');
        writeFileSync(catalogPath, 'not json');

        const result = runSortScript([catalogPath]);

        expect(result.status).toBe(1);
        expect(result.stdout).toContain('Malformed translations JSON file');
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
}, 60000);

// `translations:sort` pins bash, whose echo prints backslash sequences verbatim. zsh's echo expands
// them (and zsh parses this script's bashisms, unlike dash), so running the script under zsh proves
// that writing the sorted JSON does not depend on the shell that happens to interpret it.
const canRunZsh = (): boolean => spawnSync('zsh', ['-c', 'echo ok']).status === 0;

test.skipIf(!canRunZsh())(
    'backslash escapes in translation values survive sorting in any shell',
    () => {
        const root = mkdtempSync(join(tmpdir(), 'sort-translations-'));
        try {
            const catalogPath = join(root, 'en-US.json');
            // The file carries literal backslash sequences: a shell whose echo expands them rewrites
            // `\n` inside a translation value into a raw newline and corrupts the JSON.
            writeFileSync(catalogPath, `${JSON.stringify({ zulu: 'first line\nsecond line', alpha: 'a' }, null, 4)}\n`);

            const result = spawnSync('zsh', [scriptPath, catalogPath], { encoding: 'utf8', timeout: 120000 });

            expect(result.status).toBe(0);
            const catalog = JSON.parse(readFileSync(catalogPath, 'utf8')) as Record<string, string>;
            expect(Object.keys(catalog)).toEqual(['alpha', 'zulu']);
            expect(catalog.zulu).toBe('first line\nsecond line');
        } finally {
            rmSync(root, { recursive: true, force: true });
        }
    },
    60000
);
