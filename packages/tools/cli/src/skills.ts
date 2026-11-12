import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';

export const PACKAGE_NAME = '@adyen/adyen-platform-experience-web';
export const SKILL_PREFIX = 'adyen-platform-experience-';
export const COMPONENTS_FIELD = 'adyen-platform-experience-components';
export const VERSION_FIELD = 'adyen-platform-experience-version';

interface Output {
    write(chunk: string): unknown;
}

export interface RunOptions {
    cwd: string;
    skillsRoot: string;
    version: string;
    stdout: Output;
    stderr: Output;
    stdin?: NodeJS.ReadableStream;
    isTTY?: boolean;
    userAgent?: string;
}

export interface Flags {
    components?: string;
    agent?: string;
    yes?: boolean;
    dir?: string;
    json?: boolean;
    help?: boolean;
}

export const shortName = (skill: string) => (skill.startsWith(SKILL_PREFIX) ? skill.slice(SKILL_PREFIX.length) : skill);

export const listFiles = (dir: string, root = dir): string[] =>
    readdirSync(dir, { withFileTypes: true })
        .flatMap(entry => {
            const path = join(dir, entry.name);
            if (entry.isDirectory()) return listFiles(path, root);
            return entry.isFile() ? [relative(root, path).split(sep).join('/')] : [];
        })
        .sort();

export const listSkills = (skillsRoot: string) =>
    readdirSync(skillsRoot, { withFileTypes: true })
        .filter(entry => entry.isDirectory() && existsSync(join(skillsRoot, entry.name, 'SKILL.md')))
        .map(entry => entry.name)
        .sort();

const frontmatterLine = (field: string) => new RegExp(`^(\\s*${field}:\\s*).*$`, 'm');

export const readField = (skillFile: string, field: string) => {
    const frontmatter = readFileSync(skillFile, 'utf8').split(/^---$/m)[1] ?? '';
    const line = frontmatter.split('\n').find(entry => entry.trimStart().startsWith(`${field}:`)) ?? '';
    return line
        .slice(line.indexOf(':') + 1)
        .trim()
        .replace(/^(['"])(.*)\1$/, '$2');
};

export const setField = (content: string, field: string, value: string) => content.replace(frontmatterLine(field), `$1'${value}'`);

export const findGitRoot = (cwd: string) => {
    for (let dir = cwd; ; dir = dirname(dir)) {
        if (existsSync(join(dir, '.git'))) return dir;
        if (dirname(dir) === dir) return undefined;
    }
};

export const displayPath = (cwd: string, root: string, folder: string) => `${relative(cwd, join(root, folder)) || '.'}/`;

// Yarn Plug'n'Play can't run bins through npx; Yarn runs them by their bin name.
export const commandPrefix = ({ userAgent }: Pick<RunOptions, 'userAgent'>) =>
    /^yarn\//.test(userAgent ?? '') ? 'yarn adyen-platform-experience-web' : `npx ${PACKAGE_NAME}`;
