import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { makeProject, makeSkillsRoot, PACKAGE, runCli, SKILL, writeFile } from './__testing__';

const installedFiles = (dir: string) => [
    ...readdirSync(dir).filter(name => name !== 'references'),
    ...readdirSync(join(dir, 'references')).map(name => `references/${name}`),
];

describe('skills add', () => {
    test('installs the migration skill for the selected components into the assistant folder at the git root', async () => {
        const project = makeProject();
        const { code, stderr } = await runCli(['skills', 'add', '--components', 'transactions-overview', '--agent', 'claude-code', '--yes'], {
            cwd: project,
        });

        expect(stderr).toBe('');
        expect(code).toBe(0);
        const installed = join(project, '.claude', 'skills', SKILL);
        expect(installedFiles(installed).sort()).toEqual([
            'SKILL.md',
            'references/css-overrides.md',
            'references/exports-and-instances.md',
            'references/global.md',
            'references/transactions-overview.md',
        ]);
        expect(readFileSync(join(installed, 'SKILL.md'), 'utf8')).toContain("adyen-platform-experience-components: 'transactions-overview'");
        expect(existsSync(join(project, '.agents'))).toBe(false);
    });

    test.each([
        ['claude-code,cursor', ['.claude']],
        ['codex,cursor', ['.agents']],
        ['claude-code,codex', ['.agents', '.claude']],
        ['cursor', ['.cursor']],
        ['devin', ['.agents']],
        ['droid', ['.factory']],
        ['claude-code,codex,cursor,devin,droid', ['.agents', '.claude', '.factory']],
    ])('installs for %s into the fewest folders those assistants read: %j', async (agents, folders) => {
        const project = makeProject();
        const { code } = await runCli(['skills', 'add', '--components', 'capital-offer', '--agent', agents, '--yes'], { cwd: project });

        expect(code).toBe(0);
        const written = readdirSync(project).filter(name => existsSync(join(project, name, 'skills', SKILL, 'SKILL.md')));
        expect(written.sort()).toEqual(folders);
    });

    test('writes at the git root when run from a nested folder, or into --dir when given', async () => {
        const project = makeProject();
        const nested = join(project, 'apps', 'portal');
        mkdirSync(nested, { recursive: true });
        const flags = ['--components', 'capital-offer', '--agent', 'codex', '--yes'];

        await runCli(['skills', 'add', ...flags], { cwd: nested });
        await runCli(['skills', 'add', ...flags, '--dir', 'apps/portal'], { cwd: project });

        expect(existsSync(join(project, '.agents', 'skills', SKILL, 'SKILL.md'))).toBe(true);
        expect(existsSync(join(nested, '.agents', 'skills', SKILL, 'SKILL.md'))).toBe(true);
    });

    test.each([
        [['--agent', 'codex'], '--components'],
        [['--components', 'capital-offer'], '--agent'],
    ])('without a terminal, refuses %j and names the missing flag, writing nothing', async (flags, missing) => {
        const project = makeProject();
        const { code, stderr } = await runCli(['skills', 'add', ...flags, '--yes'], { cwd: project });

        expect(code).toBe(1);
        expect(stderr).toContain(`Missing ${missing}`);
        expect(readdirSync(project).sort()).toEqual(['.git', 'node_modules', 'package.json']);
    });

    test.each([
        [['--components', 'capital-offer,transaction-overview', '--agent', 'codex'], 'Unknown component: transaction-overview', 'payouts-overview'],
        [['--components', 'capital-offer', '--agent', 'codex,windsurf'], 'Unknown assistant: windsurf', 'claude-code'],
    ])('refuses unknown values in %j, listing the valid ones', async (flags, message, valid) => {
        const project = makeProject();
        const { code, stderr } = await runCli(['skills', 'add', ...flags, '--yes'], { cwd: project });

        expect(code).toBe(1);
        expect(stderr).toContain(message);
        expect(stderr).toContain(valid);
        expect(existsSync(join(project, '.agents'))).toBe(false);
    });
});

describe('skills add, again', () => {
    test('replaces an installed copy with the new selection and says so', async () => {
        const project = makeProject();
        const add = (components: string) => runCli(['skills', 'add', '--components', components, '--agent', 'codex', '--yes'], { cwd: project });

        const first = await add('capital-offer');
        const second = await add('payouts-overview');

        expect(first.stdout).toContain(`Installed ${SKILL} (1 component) in .agents/skills/`);
        expect(second.stdout).toContain(`Replaced ${SKILL} (1 component) in .agents/skills/`);
        const files = installedFiles(join(project, '.agents', 'skills', SKILL));
        expect(files).toContain('references/payouts-overview.md');
        expect(files).not.toContain('references/capital-offer.md');
    });
});

describe('skills sync', () => {
    test('re-copies installed skills from the upgraded package, keeping their component selection', async () => {
        const project = makeProject('2.0.0');
        await runCli(['skills', 'add', '--components', 'capital-offer,payouts-overview', '--agent', 'claude-code,codex', '--yes'], {
            cwd: project,
            skillsRoot: makeSkillsRoot('2.0.0'),
        });
        writeFile(join(project, 'node_modules', PACKAGE, 'package.json'), JSON.stringify({ name: PACKAGE, version: '2.1.0' }));

        const { code, stdout } = await runCli(['skills', 'sync'], { cwd: project, skillsRoot: makeSkillsRoot('2.1.0'), version: '2.1.0' });

        expect(code).toBe(0);
        for (const folder of ['.claude', '.agents']) {
            const installed = join(project, folder, 'skills', SKILL);
            const skillFile = readFileSync(join(installed, 'SKILL.md'), 'utf8');
            expect(skillFile).toContain("adyen-platform-experience-version: '2.1.0'");
            expect(skillFile).toContain("adyen-platform-experience-components: 'capital-offer,payouts-overview'");
            expect(installedFiles(installed)).not.toContain('references/transactions-overview.md');
            expect(stdout).toContain(`Synced ${SKILL} in ${folder}/skills/ (2.0.0 → 2.1.0)`);
        }
    });

    test('fails and points to skills add when nothing is installed', async () => {
        const { code, stderr } = await runCli(['skills', 'sync']);

        expect(code).toBe(1);
        expect(stderr).toContain('No installed skills found');
        expect(stderr).toContain('skills add');
    });
});

describe('skills remove', () => {
    test('deletes the skill from every assistant folder and leaves other skills alone', async () => {
        const project = makeProject();
        await runCli(['skills', 'add', '--components', 'capital-offer', '--agent', 'claude-code,codex', '--yes'], { cwd: project });
        writeFile(join(project, '.claude', 'skills', 'our-own-skill', 'SKILL.md'), '---\nname: our-own-skill\n---\n');

        const { code, stdout } = await runCli(['skills', 'remove', 'migrate-v2'], { cwd: project });

        expect(code).toBe(0);
        expect(existsSync(join(project, '.claude', 'skills', SKILL))).toBe(false);
        expect(existsSync(join(project, '.agents', 'skills', SKILL))).toBe(false);
        expect(existsSync(join(project, '.claude', 'skills', 'our-own-skill', 'SKILL.md'))).toBe(true);
        expect(stdout).toContain(`Removed ${SKILL} from .claude/skills/`);
        expect(stdout).toContain(`Removed ${SKILL} from .agents/skills/`);
    });

    test('fails when the named skill is not installed', async () => {
        const { code, stderr } = await runCli(['skills', 'remove', 'migrate-v2']);

        expect(code).toBe(1);
        expect(stderr).toContain(`${SKILL} isn't installed`);
    });
});

describe('skills list, with installed copies', () => {
    test('shows each installed copy, flags an old version, and warns when one assistant reads two copies', async () => {
        const project = makeProject('2.0.0');
        await runCli(['skills', 'add', '--components', 'capital-offer', '--agent', 'claude-code,codex', '--yes'], { cwd: project });
        writeFile(join(project, 'node_modules', PACKAGE, 'package.json'), JSON.stringify({ name: PACKAGE, version: '2.1.0' }));
        const upgraded = { cwd: project, skillsRoot: makeSkillsRoot('2.1.0'), version: '2.1.0' };

        const text = await runCli(['skills', 'list'], upgraded);
        const json = await runCli(['skills', 'list', '--json'], upgraded);

        expect(text.stdout).toContain('Installed in .claude/skills/ (2.0.0, older than 2.1.0: run skills sync)');
        expect(text.stdout).toContain('Installed in .agents/skills/ (2.0.0, older than 2.1.0: run skills sync)');
        expect(text.stdout).toContain('cursor, devin read it from both .claude/skills/ and .agents/skills/');
        expect(JSON.parse(json.stdout)[0].installed).toEqual([
            { folder: '.claude/skills', version: '2.0.0', components: ['capital-offer'] },
            { folder: '.agents/skills', version: '2.0.0', components: ['capital-offer'] },
        ]);
    });
});

describe('skills add, interactive', () => {
    test('asks for components and assistants, preselecting assistants whose folders exist, then confirms', async () => {
        const project = makeProject();
        mkdirSync(join(project, '.claude'));

        const { code, stdout } = await runCli(['skills', 'add'], { cwd: project, isTTY: true, input: '9\n3\n\ny\n' });

        expect(code).toBe(0);
        expect(stdout).toContain('Capital');
        expect(stdout).toContain('1. capital-offer');
        expect(stdout).toContain("9 isn't one of the options");
        expect(stdout).toContain('claude-code (detected)');
        expect(installedFiles(join(project, '.claude', 'skills', SKILL))).toContain('references/transactions-overview.md');
        expect(installedFiles(join(project, '.claude', 'skills', SKILL))).not.toContain('references/capital-offer.md');
    });

    test('accepts a domain name for components and skips the confirmation with --yes', async () => {
        const project = makeProject();

        const { code } = await runCli(['skills', 'add', '--yes'], { cwd: project, isTTY: true, input: 'capital\n2\n' });

        expect(code).toBe(0);
        expect(installedFiles(join(project, '.agents', 'skills', SKILL))).toContain('references/capital-offer.md');
        expect(installedFiles(join(project, '.agents', 'skills', SKILL))).not.toContain('references/payouts-overview.md');
    });

    test('stops without installing when the input ends before an answer', async () => {
        const project = makeProject();

        const { code, stderr } = await runCli(['skills', 'add'], { cwd: project, isTTY: true, input: '' });

        expect(code).toBe(1);
        expect(stderr).toBe('No answer, so nothing was installed.\n');
        expect(existsSync(join(project, '.agents'))).toBe(false);
    });

    test('installs nothing when the user declines the confirmation', async () => {
        const project = makeProject();

        const { code, stdout } = await runCli(['skills', 'add', '--agent', 'codex'], { cwd: project, isTTY: true, input: 'all\nn\n' });

        expect(code).toBe(0);
        expect(stdout).toContain('Nothing installed');
        expect(existsSync(join(project, '.agents'))).toBe(false);
    });
});
