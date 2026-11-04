import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';
import { run } from './cli';

const PACKAGE = '@adyen/adyen-platform-experience-web';
const VERSION = '2.0.0';
const SKILL = 'adyen-platform-experience-migrate-v2';

const tempDirs: string[] = [];

afterEach(() => {
    for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const makeTempDir = () => {
    const dir = mkdtempSync(join(tmpdir(), 'pe-cli-'));
    tempDirs.push(dir);
    return dir;
};

const writeFile = (path: string, content: string) => {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
};

const makeSkillsRoot = () => {
    const root = makeTempDir();
    writeFile(
        join(root, SKILL, 'SKILL.md'),
        `---\nname: ${SKILL}\ndescription: Migrate an app from v1 to v2.\nlicense: MIT\n---\n\n# Migrate\n\nApply \`references/global.md\`.\n`
    );
    writeFile(join(root, SKILL, 'references/global.md'), '# Global changes\n');
    writeFile(join(root, SKILL, 'references/css-overrides.md'), '# CSS overrides\n');
    return root;
};

const makeProject = (installedVersion: string | null = VERSION) => {
    const project = makeTempDir();
    writeFile(join(project, 'package.json'), '{}');
    if (installedVersion) {
        writeFile(join(project, 'node_modules', PACKAGE, 'package.json'), JSON.stringify({ name: PACKAGE, version: installedVersion }));
    }
    return project;
};

const runCli = async (argv: string[], { cwd = makeProject(), skillsRoot = makeSkillsRoot(), version = VERSION } = {}) => {
    let stdout = '';
    let stderr = '';
    const code = await run(argv, {
        cwd,
        skillsRoot,
        version,
        stdout: { write: (chunk: string) => (stdout += chunk) },
        stderr: { write: (chunk: string) => (stderr += chunk) },
    });
    return { code, stdout, stderr };
};

describe('skills show', () => {
    test('prints the skill with a header that lists its files and how to load them', async () => {
        const { code, stdout, stderr } = await runCli(['skills', 'show', 'migrate-v2']);

        expect(code).toBe(0);
        expect(stderr).toBe('');
        expect(stdout).toContain(`npx ${PACKAGE} skills show migrate-v2 <file>`);
        expect(stdout).toContain('references/css-overrides.md');
        expect(stdout).toContain('references/global.md');
        expect(stdout).toContain(VERSION);
        expect(stdout).toContain('# Migrate\n\nApply `references/global.md`.');
    });

    test('prints one of the skill files, given its path from the skill root', async () => {
        const { code, stdout } = await runCli(['skills', 'show', SKILL, 'references/global.md']);

        expect(code).toBe(0);
        expect(stdout).toBe('# Global changes\n');
    });

    test('finds a file in references/ when given only its name', async () => {
        const { code, stdout } = await runCli(['skills', 'show', 'migrate-v2', 'css-overrides.md']);

        expect(code).toBe(0);
        expect(stdout).toBe('# CSS overrides\n');
    });

    test.each([
        ['a path out of the skill folder', '../../package.json'],
        ['an absolute path', '/etc/hosts'],
        ['a symlink that leaves the skill folder', 'references/linked.md'],
    ])('refuses %s', async (_, file) => {
        const skillsRoot = makeSkillsRoot();
        const outside = join(makeTempDir(), 'secret.md');
        writeFile(outside, 'secret');
        symlinkSync(outside, join(skillsRoot, SKILL, 'references', 'linked.md'));

        const { code, stdout, stderr } = await runCli(['skills', 'show', 'migrate-v2', file], { skillsRoot });

        expect(code).toBe(1);
        expect(stdout).toBe('');
        expect(stderr).toContain(`${file} isn't a file of ${SKILL}`);
    });

    test('refuses an unknown skill, listing the available ones', async () => {
        const { code, stdout, stderr } = await runCli(['skills', 'show', 'migrate-v9']);

        expect(code).toBe(1);
        expect(stdout).toBe('');
        expect(stderr).toContain(`No skill named migrate-v9. Available: ${SKILL}`);
    });
});

describe('skills list', () => {
    test('lists the shipped skills with their description and the command that shows them', async () => {
        const { code, stdout } = await runCli(['skills', 'list']);

        expect(code).toBe(0);
        expect(stdout).toContain(SKILL);
        expect(stdout).toContain('Migrate an app from v1 to v2.');
        expect(stdout).toContain(`npx ${PACKAGE} skills show migrate-v2`);
    });

    test('prints JSON with --json', async () => {
        const { code, stdout } = await runCli(['skills', 'list', '--json']);

        expect(code).toBe(0);
        expect(JSON.parse(stdout)).toEqual([
            { name: SKILL, description: 'Migrate an app from v1 to v2.', version: VERSION, show: `npx ${PACKAGE} skills show migrate-v2` },
        ]);
    });
});

describe('usage', () => {
    test.each([[[]], [['skills']], [['skills', 'show']], [['skills', 'install']]])('prints usage and fails for %j', async argv => {
        const { code, stdout, stderr } = await runCli(argv, { cwd: makeProject(null) });

        expect(code).toBe(1);
        expect(stdout).toBe('');
        expect(stderr).toContain('Usage:');
        expect(stderr).toContain('skills show <skill> [file]');
    });

    test('prints usage on --help, even outside a project', async () => {
        const { code, stdout } = await runCli(['--help'], { cwd: makeProject(null) });

        expect(code).toBe(0);
        expect(stdout).toContain('skills list [--json]');
    });
});

describe('version check', () => {
    test('refuses when the library is not installed in the project, naming the directory', async () => {
        const cwd = makeProject(null);
        const { code, stdout, stderr } = await runCli(['skills', 'show', 'migrate-v2'], { cwd });

        expect(code).toBe(1);
        expect(stdout).toBe('');
        expect(stderr).toContain(`${PACKAGE} isn't installed in ${cwd} or any parent directory`);
        expect(stderr).toContain('Run this command from the app that depends on it');
    });

    test('refuses when the project has a different version installed, naming both', async () => {
        const cwd = makeProject('2.0.3');
        const { code, stdout, stderr } = await runCli(['skills', 'show', 'migrate-v2'], { cwd, version: '2.1.0' });

        expect(code).toBe(1);
        expect(stdout).toBe('');
        expect(stderr).toContain(`This project has ${PACKAGE} 2.0.3 installed, but this CLI is 2.1.0`);
        expect(stderr).toContain('without @latest');
    });

    test("explains that Yarn Plug'n'Play is not supported when the project uses it", async () => {
        const cwd = makeProject(null);
        writeFile(join(cwd, '.pnp.cjs'), '');

        const { code, stdout, stderr } = await runCli(['skills', 'show', 'migrate-v2'], { cwd });

        expect(code).toBe(1);
        expect(stdout).toBe('');
        expect(stderr).toContain("Yarn Plug'n'Play isn't supported yet");
        expect(stderr).toContain('nodeLinker: node-modules');
    });

    test('finds the install from a nested directory of the project', async () => {
        const project = makeProject();
        const cwd = join(project, 'src', 'components');
        mkdirSync(cwd, { recursive: true });

        const { code } = await runCli(['skills', 'show', 'migrate-v2'], { cwd });

        expect(code).toBe(0);
    });

    test('finds the install through a symlinked package, as pnpm lays it out', async () => {
        const cwd = makeProject(null);
        const store = join(cwd, 'node_modules', '.pnpm', `${PACKAGE.replace('/', '+')}@${VERSION}`, 'node_modules', PACKAGE);
        writeFile(join(store, 'package.json'), JSON.stringify({ name: PACKAGE, version: VERSION }));
        mkdirSync(join(cwd, 'node_modules', '@adyen'), { recursive: true });
        symlinkSync(store, join(cwd, 'node_modules', PACKAGE), 'dir');

        const { code } = await runCli(['skills', 'show', 'migrate-v2'], { cwd });

        expect(code).toBe(0);
    });
});
