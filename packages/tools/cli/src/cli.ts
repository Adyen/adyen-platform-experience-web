import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';

export const PACKAGE_NAME = '@adyen/adyen-platform-experience-web';
const SKILL_PREFIX = 'adyen-platform-experience-';

interface Output {
    write(chunk: string): unknown;
}

export interface RunOptions {
    cwd: string;
    skillsRoot: string;
    version: string;
    stdout: Output;
    stderr: Output;
}

const shortName = (skill: string) => (skill.startsWith(SKILL_PREFIX) ? skill.slice(SKILL_PREFIX.length) : skill);

const listFiles = (dir: string, root = dir): string[] =>
    readdirSync(dir, { withFileTypes: true })
        .flatMap(entry => {
            const path = join(dir, entry.name);
            if (entry.isDirectory()) return listFiles(path, root);
            return entry.isFile() ? [relative(root, path).split(sep).join('/')] : [];
        })
        .sort();

const header = (skill: string, version: string, files: string[]) => {
    const command = `npx ${PACKAGE_NAME} skills show ${shortName(skill)}`;
    return [
        `> Skill \`${skill}\` from ${PACKAGE_NAME} ${version}, printed by \`${command}\`.`,
        '> It is not installed in this project. To read a file it mentions, run:',
        `> \`${command} <file>\``,
        `> Files: ${files.join(', ')}`,
        '',
        '',
    ].join('\n');
};

const listSkills = (skillsRoot: string) =>
    readdirSync(skillsRoot, { withFileTypes: true })
        .filter(entry => entry.isDirectory() && existsSync(join(skillsRoot, entry.name, 'SKILL.md')))
        .map(entry => entry.name)
        .sort();

const show = (skillArg: string, fileArg: string | undefined, options: RunOptions) => {
    const skill = `${SKILL_PREFIX}${shortName(skillArg)}`;
    const skills = listSkills(options.skillsRoot);
    if (!skills.includes(skill)) {
        options.stderr.write(`No skill named ${skillArg}. Available: ${skills.join(', ')}\n`);
        return 1;
    }
    const skillDir = join(options.skillsRoot, skill);
    const files = listFiles(skillDir);

    if (fileArg) {
        const file = [fileArg, `references/${fileArg}`].find(candidate => files.includes(candidate));
        if (!file) {
            options.stderr.write(`${fileArg} isn't a file of ${skill}. Files: ${files.join(', ')}\n`);
            return 1;
        }
        options.stdout.write(readFileSync(join(skillDir, file), 'utf8'));
        return 0;
    }

    const references = files.filter(file => file !== 'SKILL.md');
    options.stdout.write(header(skill, options.version, references) + readFileSync(join(skillDir, 'SKILL.md'), 'utf8'));
    return 0;
};

const readDescription = (skillFile: string) => {
    const frontmatter = readFileSync(skillFile, 'utf8').split(/^---$/m)[1] ?? '';
    const line = frontmatter.split('\n').find(entry => entry.startsWith('description:')) ?? '';
    return line
        .slice('description:'.length)
        .trim()
        .replace(/^(['"])(.*)\1$/, '$2');
};

const list = (json: boolean, { skillsRoot, version, stdout }: RunOptions) => {
    const skills = listSkills(skillsRoot).map(name => ({
        name,
        description: readDescription(join(skillsRoot, name, 'SKILL.md')),
        version,
        show: `npx ${PACKAGE_NAME} skills show ${shortName(name)}`,
    }));
    stdout.write(
        json
            ? JSON.stringify(skills, null, 2) + '\n'
            : skills.map(skill => `${skill.name} (${version})\n  ${skill.description}\n  Read it: ${skill.show}\n`).join('\n')
    );
    return 0;
};

const findInstall = (cwd: string): { version: string } | { pnp: true } | undefined => {
    let pnp = false;
    for (let dir = cwd; ; dir = dirname(dir)) {
        const manifest = join(dir, 'node_modules', PACKAGE_NAME, 'package.json');
        if (existsSync(manifest)) return { version: JSON.parse(readFileSync(manifest, 'utf8')).version };
        pnp ||= existsSync(join(dir, '.pnp.cjs'));
        if (dirname(dir) === dir) return pnp ? { pnp } : undefined;
    }
};

const installError = (cwd: string, version: string) => {
    const install = findInstall(cwd);
    if (!install)
        return (
            `${PACKAGE_NAME} isn't installed in ${cwd} or any parent directory.\n` +
            'Run this command from the app that depends on it, after upgrading it to v2.\n'
        );
    if ('pnp' in install)
        return (
            "Yarn Plug'n'Play isn't supported yet: this command needs node_modules.\n" +
            'Set `nodeLinker: node-modules` in .yarnrc.yml and run yarn install, or follow the migration guide.\n'
        );
    if (install.version !== version)
        return (
            `This project has ${PACKAGE_NAME} ${install.version} installed, but this CLI is ${version}.\n` +
            `Run the command without @latest (npx ${PACKAGE_NAME} …) so it uses the installed copy.\n`
        );
    return undefined;
};

const USAGE = `Usage: npx ${PACKAGE_NAME} <command>

Commands:
  skills show <skill> [file]   Print a skill, or one of its files, without installing it
  skills list [--json]         List the skills shipped with this version

Example:
  npx ${PACKAGE_NAME} skills show migrate-v2
`;

const resolveCommand = ([group, command, ...args]: string[], options: RunOptions) => {
    if (group !== 'skills') return undefined;
    const [skill, file] = args;
    if (command === 'show' && skill) return () => show(skill, file, options);
    if (command === 'list') return () => list(args.includes('--json'), options);
    return undefined;
};

export async function run(argv: string[], options: RunOptions): Promise<number> {
    if (argv.includes('--help') || argv.includes('-h')) {
        options.stdout.write(USAGE);
        return 0;
    }

    const action = resolveCommand(argv, options);
    if (!action) {
        options.stderr.write(USAGE);
        return 1;
    }

    const error = installError(options.cwd, options.version);
    if (error) {
        options.stderr.write(error);
        return 1;
    }
    return action();
}
