import { mkdirSync, symlinkSync } from 'node:fs';
import Module from 'node:module';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { makeProject, makeSkillsRoot, makeTempDir, PACKAGE, runCli, SKILL, VERSION, writeFile } from './__testing__';

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
        expect(stdout).toBe('# global\n');
    });

    test('finds a file in references/ when given only its name', async () => {
        const { code, stdout } = await runCli(['skills', 'show', 'migrate-v2', 'css-overrides.md']);

        expect(code).toBe(0);
        expect(stdout).toBe('# css-overrides\n');
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
            {
                name: SKILL,
                description: 'Migrate an app from v1 to v2.',
                version: VERSION,
                show: `npx ${PACKAGE} skills show migrate-v2`,
                installed: [],
            },
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

    test.each([
        [['skills', 'add', '--component', 'capital-offer', '--agent', 'codex', '--yes'], '--component'],
        [['skills', 'list', '--jsno'], '--jsno'],
    ])('rejects an unknown flag in %j instead of ignoring it', async (argv, flag) => {
        const project = makeProject();
        const { code, stdout, stderr } = await runCli(argv, { cwd: project });

        expect(code).toBe(1);
        expect(stdout).toBe('');
        expect(stderr).toContain(`Unknown option: ${flag}`);
        expect(stderr).toContain('Usage:');
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

    test("tells Yarn Plug'n'Play users to run it through Yarn when it can't resolve the package", async () => {
        const cwd = makeProject(null);
        writeFile(join(cwd, '.pnp.cjs'), '');

        const { code, stdout, stderr } = await runCli(['skills', 'show', 'migrate-v2'], { cwd });

        expect(code).toBe(1);
        expect(stdout).toBe('');
        expect(stderr).toContain('yarn adyen-platform-experience-web skills');
    });

    test("finds the install through Node module resolution, as Yarn Plug'n'Play provides it", async () => {
        const cwd = makeProject(null);
        const pkg = join(cwd, 'deps', PACKAGE);
        writeFile(join(pkg, 'package.json'), JSON.stringify({ name: PACKAGE, version: VERSION, main: 'index.js' }));
        writeFile(join(pkg, 'index.js'), '');
        writeFile(join(cwd, 'package.json'), JSON.stringify({ name: 'app' }));
        const previous = process.env.NODE_PATH;
        process.env.NODE_PATH = join(cwd, 'deps');
        (Module as unknown as { _initPaths: () => void })._initPaths();
        try {
            const { code } = await runCli(['skills', 'show', 'migrate-v2'], { cwd });
            expect(code).toBe(0);
        } finally {
            process.env.NODE_PATH = previous;
            (Module as unknown as { _initPaths: () => void })._initPaths();
        }
    });

    test('prints the Yarn command when run through Yarn', async () => {
        const { stdout } = await runCli(['skills', 'show', 'migrate-v2'], { userAgent: 'yarn/4.5.0 npm/? node/v22.0.0 darwin arm64' });

        expect(stdout).toContain('yarn adyen-platform-experience-web skills show migrate-v2 <file>');
        expect(stdout).not.toContain('npx');
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
