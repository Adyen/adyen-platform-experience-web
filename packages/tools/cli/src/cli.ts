import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parseArgs } from 'node:util';
import { add, AGENTS, findInstalled, installRoot, remove, sync } from './install';
import {
    COMPONENTS_FIELD,
    displayPath,
    type Flags,
    listFiles,
    listSkills,
    PACKAGE_NAME,
    readField,
    type RunOptions,
    shortName,
    SKILL_PREFIX,
    VERSION_FIELD,
} from './skills';

export { PACKAGE_NAME, type RunOptions } from './skills';

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

const duplicateReaders = (folders: string[]) =>
    Object.entries(AGENTS)
        .filter(([, { reads }]) => folders.filter(folder => reads.includes(folder.split('/')[0]!)).length > 1)
        .map(([agent]) => agent);

const list = (flags: Flags, { cwd, skillsRoot, version, stdout }: RunOptions) => {
    const root = installRoot(flags, cwd);
    const installed = findInstalled(root, skillsRoot);
    const skills = listSkills(skillsRoot).map(name => ({
        name,
        description: readField(join(skillsRoot, name, 'SKILL.md'), 'description'),
        version,
        show: `npx ${PACKAGE_NAME} skills show ${shortName(name)}`,
        installed: installed
            .filter(copy => copy.skill === name)
            .map(({ folder, dir }) => ({
                folder,
                version: readField(join(dir, 'SKILL.md'), VERSION_FIELD),
                components: readField(join(dir, 'SKILL.md'), COMPONENTS_FIELD).split(',').filter(Boolean),
            })),
    }));
    if (flags.json) {
        stdout.write(JSON.stringify(skills, null, 2) + '\n');
        return 0;
    }
    const display = (folder: string) => displayPath(cwd, root, folder);
    const describe = (skill: (typeof skills)[number]) => {
        const copies = skill.installed.map(
            copy =>
                `  Installed in ${display(copy.folder)} (${copy.version === version ? copy.version : `${copy.version}, older than ${version}: run skills sync`})`
        );
        const readers = duplicateReaders(skill.installed.map(copy => copy.folder));
        const warning = readers.length
            ? [
                  `  Warning: ${readers.join(', ')} read it from both ${skill.installed.map(copy => display(copy.folder)).join(' and ')}; they may load it twice.`,
              ]
            : [];
        return [`${skill.name} (${version})`, `  ${skill.description}`, `  Read it: ${skill.show}`, ...copies, ...warning, ''].join('\n');
    };
    stdout.write(skills.map(describe).join('\n'));
    return 0;
};

const installError = (cwd: string, version: string) => {
    let pnp = false;
    for (let dir = cwd; ; dir = dirname(dir)) {
        const manifest = join(dir, 'node_modules', PACKAGE_NAME, 'package.json');
        if (existsSync(manifest)) {
            const installed = JSON.parse(readFileSync(manifest, 'utf8')).version;
            return installed === version
                ? undefined
                : `This project has ${PACKAGE_NAME} ${installed} installed, but this CLI is ${version}.\n` +
                      `Run the command without @latest (npx ${PACKAGE_NAME} …) so it uses the installed copy.\n`;
        }
        pnp ||= existsSync(join(dir, '.pnp.cjs'));
        if (dirname(dir) === dir) break;
    }
    return pnp
        ? "Yarn Plug'n'Play isn't supported yet: this command needs node_modules.\n" +
              'Set `nodeLinker: node-modules` in .yarnrc.yml and run yarn install, or follow the migration guide.\n'
        : `${PACKAGE_NAME} isn't installed in ${cwd} or any parent directory.\n` +
              'Run this command from the app that depends on it, after upgrading it to v2.\n';
};

const USAGE = `Usage: npx ${PACKAGE_NAME} <command>

Commands:
  skills show <skill> [file]   Print a skill, or one of its files, without installing it
  skills list [--json]         List the skills shipped with this version and the installed copies
  skills add                   Install skills into your assistants' skill folders, to commit for the team
      [--components <a,b>] [--agent <claude-code,codex,cursor,devin,droid>] [--yes] [--dir <path>]
  skills sync [--dir <path>]   Re-copy installed skills after upgrading the library
  skills remove [skill…]       Delete installed skills, e.g. once the migration is done

Example:
  npx ${PACKAGE_NAME} skills show migrate-v2
`;

const OPTIONS = {
    components: { type: 'string' },
    agent: { type: 'string' },
    yes: { type: 'boolean' },
    dir: { type: 'string' },
    json: { type: 'boolean' },
    help: { type: 'boolean', short: 'h' },
} as const;

const parse = (argv: string[]) => {
    try {
        const { positionals, values } = parseArgs({ args: argv, options: OPTIONS, allowPositionals: true, strict: true });
        return { positionals, flags: values as Flags };
    } catch (thrown) {
        const message = thrown instanceof Error ? thrown.message : String(thrown);
        const unknown = /^Unknown option '([^']+)'/.exec(message)?.[1];
        return { error: unknown ? `Unknown option: ${unknown}` : message };
    }
};

const resolveCommand = ([group, command, ...args]: string[], flags: Flags, options: RunOptions) => {
    if (group !== 'skills') return undefined;
    const [skill, file] = args;
    if (command === 'show' && skill) return () => show(skill, file, options);
    if (command === 'list') return () => list(flags, options);
    if (command === 'add') return () => add(flags, options);
    if (command === 'sync') return () => sync(flags, options);
    if (command === 'remove') return () => remove(args, flags, options);
    return undefined;
};

export async function run(argv: string[], options: RunOptions): Promise<number> {
    const parsed = parse(argv);
    if ('error' in parsed) {
        options.stderr.write(`${parsed.error}\n\n${USAGE}`);
        return 1;
    }
    if (parsed.flags.help) {
        options.stdout.write(USAGE);
        return 0;
    }

    const action = resolveCommand(parsed.positionals, parsed.flags, options);
    if (!action) {
        options.stderr.write(USAGE);
        return 1;
    }

    try {
        const error = installError(options.cwd, options.version);
        if (error) {
            options.stderr.write(error);
            return 1;
        }
        return await action();
    } catch (thrown) {
        options.stderr.write(`Error: ${thrown instanceof Error ? thrown.message : String(thrown)}\n`);
        return 1;
    }
}
