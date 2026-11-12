import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { Readable } from 'node:stream';
import { afterEach } from 'vitest';
import { run } from '../cli';

export const PACKAGE = '@adyen/adyen-platform-experience-web';
export const VERSION = '2.0.0';
export const SKILL = 'adyen-platform-experience-migrate-v2';
export const COMPONENTS = ['capital-offer', 'payouts-overview', 'transactions-overview'];

const tempDirs: string[] = [];

afterEach(() => {
    for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

export const makeTempDir = () => {
    const dir = mkdtempSync(join(tmpdir(), 'pe-cli-'));
    tempDirs.push(dir);
    return dir;
};

export const writeFile = (path: string, content: string) => {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
};

export const makeSkillsRoot = (version = VERSION) => {
    const root = makeTempDir();
    writeFile(
        join(root, SKILL, 'SKILL.md'),
        [
            '---',
            `name: ${SKILL}`,
            'description: Migrate an app from v1 to v2.',
            'license: MIT',
            'metadata:',
            `    adyen-platform-experience-version: '${version}'`,
            `    adyen-platform-experience-components: '${COMPONENTS.join(',')}'`,
            '---',
            '',
            '# Migrate',
            '',
            'Apply `references/global.md`.',
            '',
        ].join('\n')
    );
    for (const file of ['global', 'css-overrides', 'exports-and-instances', ...COMPONENTS]) {
        writeFile(join(root, SKILL, 'references', `${file}.md`), `# ${file}\n`);
    }
    return root;
};

export const makeProject = (installedVersion: string | null = VERSION) => {
    const project = makeTempDir();
    writeFile(join(project, 'package.json'), '{}');
    mkdirSync(join(project, '.git'));
    if (installedVersion) {
        writeFile(join(project, 'node_modules', PACKAGE, 'package.json'), JSON.stringify({ name: PACKAGE, version: installedVersion }));
    }
    return project;
};

interface RunCliOptions {
    cwd?: string;
    skillsRoot?: string;
    version?: string;
    input?: string;
    isTTY?: boolean;
    userAgent?: string;
}

export const runCli = async (
    argv: string[],
    { cwd = makeProject(), skillsRoot = makeSkillsRoot(), version = VERSION, input, isTTY = false, userAgent }: RunCliOptions = {}
) => {
    let stdout = '';
    let stderr = '';
    const code = await run(argv, {
        cwd,
        skillsRoot,
        version,
        stdout: { write: (chunk: string) => (stdout += chunk) },
        stderr: { write: (chunk: string) => (stderr += chunk) },
        stdin: Readable.from(input === undefined ? [] : [input]),
        isTTY,
        userAgent,
    });
    return { code, stdout, stderr };
};
