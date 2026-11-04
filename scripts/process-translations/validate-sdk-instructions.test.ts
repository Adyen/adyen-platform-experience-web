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
    spawnSync('/usr/bin/git', ['-c', 'user.email=instructions@test', '-c', 'user.name=Instructions Test', ...args], {
        cwd: root,
        encoding: 'utf8',
    });

const writeJson = (root: string, relativePath: string, value: unknown): void => {
    const filePath = join(root, relativePath);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, `${JSON.stringify(value, null, 4)}\n`);
};

const SDK = 'packages/sdk/translations/en-US.json';
const SDK_INSTRUCTIONS = 'packages/sdk/translations/en-US.instructions.json';
const BENTO = 'packages/sdk/translations/bento/en-US.json';
const BENTO_INSTRUCTIONS = 'packages/sdk/translations/bento/en-US.instructions.json';

const BASE_CATALOG = {
    'alpha.greeting.title': 'Hello',
    'alpha.list.status': 'Status',
};
const BASE_INSTRUCTIONS = {
    'alpha.greeting.title': 'Greeting heading',
    'alpha.list.status': 'Status column',
};

// A repository whose base commit carries both catalogs and both instruction
// files; each test rewrites the working tree and runs against the base commit.
const createProject = (): { root: string; base: string } => {
    const root = mkdtempSync(join(tmpdir(), 'sdk-instructions-'));
    writeJson(root, SDK, BASE_CATALOG);
    writeJson(root, SDK_INSTRUCTIONS, BASE_INSTRUCTIONS);
    writeJson(root, BENTO, {});
    writeJson(root, BENTO_INSTRUCTIONS, {});
    git(root, ['init', '--quiet']);
    git(root, ['add', '-A']);
    git(root, ['commit', '--quiet', '-m', 'base']);
    const base = git(root, ['rev-parse', 'HEAD']).stdout.trim();
    return { root, base };
};

const validate = (root: string, base: string) => runProcessTranslationsScript('validate-sdk-instructions.mjs', [base, `--root=${root}`]);

test('a rename that keeps the English text is not new English text', () => {
    const { root, base } = createProject();
    try {
        writeJson(root, SDK, { 'alpha.common.greetingTitle': 'Hello', 'alpha.list.status': 'Status' });
        writeJson(root, SDK_INSTRUCTIONS, { 'alpha.common.greetingTitle': 'Greeting heading', 'alpha.list.status': 'Status column' });

        const result = validate(root, base);

        expect(result.status).toBe(0);
        expect(result.stdout).toContain('Validated SDK instructions');
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});

test('flags genuinely new English text without an instruction', () => {
    const { root, base } = createProject();
    try {
        writeJson(root, SDK, { ...BASE_CATALOG, 'alpha.new.label': 'New' });

        const result = validate(root, base);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('alpha.new.label: add an SDK translation instruction.');
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});

test('flags an instruction whose catalog entry is gone', () => {
    const { root, base } = createProject();
    try {
        writeJson(root, SDK_INSTRUCTIONS, { ...BASE_INSTRUCTIONS, 'alpha.gone.label': 'Gone' });

        const result = validate(root, base);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('alpha.gone.label: remove the SDK translation instruction');
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});

test('flags a modified English value whose instruction is unchanged', () => {
    const { root, base } = createProject();
    try {
        writeJson(root, SDK, { 'alpha.greeting.title': 'Hello there', 'alpha.list.status': 'Status' });

        const result = validate(root, base);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('alpha.greeting.title: update its SDK translation instruction');
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});
