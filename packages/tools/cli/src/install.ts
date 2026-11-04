import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { type Choice, createPrompter } from './prompts';
import {
    COMPONENTS_FIELD,
    displayPath,
    findGitRoot,
    listFiles,
    listSkills,
    PACKAGE_NAME,
    readField,
    type RunOptions,
    setField,
    shortName,
    SKILL_PREFIX,
    VERSION_FIELD,
} from './skills';

export const AGENTS: Record<string, { reads: string[]; own: string; detect: string }> = {
    'claude-code': { reads: ['.claude'], own: '.claude', detect: '.claude' },
    codex: { reads: ['.agents'], own: '.agents', detect: '.agents' },
    cursor: { reads: ['.claude', '.agents', '.cursor'], own: '.cursor', detect: '.cursor' },
    devin: { reads: ['.claude', '.agents', '.cursor'], own: '.agents', detect: '.devin' },
    droid: { reads: ['.factory'], own: '.factory', detect: '.factory' },
};

const DOMAINS: Record<string, string[]> = {
    Capital: ['capital-offer', 'capital-overview'],
    Disputes: ['dispute-management', 'disputes-overview'],
    'Pay by Link': ['payment-link-creation', 'payment-link-details', 'payment-link-settings', 'payment-links-overview'],
    Payouts: ['payout-details', 'payouts-overview'],
    Reports: ['reports-overview'],
    Transactions: ['transaction-details', 'transactions-overview'],
};

const componentChoices = (components: string[]): Choice[] =>
    [...Object.entries(DOMAINS), ['Other', components.filter(component => !Object.values(DOMAINS).flat().includes(component))] as const].flatMap(
        ([group, members]) => members.filter(component => components.includes(component)).map(value => ({ group, value }))
    );

const folderSet = (agents: string[]) => {
    const folders = new Set(
        agents
            .map(agent => AGENTS[agent]!)
            .filter(({ reads }) => reads.length === 1)
            .map(({ own }) => own)
    );
    for (const agent of agents) {
        const { reads, own } = AGENTS[agent]!;
        if (!reads.some(folder => folders.has(folder))) folders.add(own);
    }
    return [...folders].map(folder => `${folder}/skills`);
};

interface AddFlags {
    components?: string[];
    agents?: string[];
    yes: boolean;
    dir?: string;
}

const parseFlags = (args: string[]): AddFlags => {
    const value = (flag: string) => {
        const index = args.indexOf(flag);
        return index === -1 ? undefined : args[index + 1];
    };
    const list = (flag: string) =>
        value(flag)
            ?.split(',')
            .map(item => item.trim())
            .filter(Boolean);
    return { components: list('--components'), agents: list('--agent'), yes: args.includes('--yes'), dir: value('--dir') };
};

const install = (skillDir: string, target: string, components: string[]) => {
    const shipped = readField(join(skillDir, 'SKILL.md'), COMPONENTS_FIELD).split(',');
    const isDropped = (file: string) => shipped.some(component => file === `references/${component}.md` && !components.includes(component));
    rmSync(target, { recursive: true, force: true });
    for (const file of listFiles(skillDir).filter(file => !isDropped(file))) {
        const content = readFileSync(join(skillDir, file), 'utf8');
        mkdirSync(dirname(join(target, file)), { recursive: true });
        writeFileSync(join(target, file), file === 'SKILL.md' ? setField(content, COMPONENTS_FIELD, components.join(',')) : content);
    }
};

const shippedComponents = (skillsRoot: string) =>
    [
        ...new Set(
            listSkills(skillsRoot).flatMap(skill =>
                readField(join(skillsRoot, skill, 'SKILL.md'), COMPONENTS_FIELD)
                    .split(',')
                    .filter(Boolean)
            )
        ),
    ].sort();

const flagErrors = (flags: AddFlags, components: string[]) => {
    const missing = (['--components', '--agent'] as const).filter(flag => !(flag === '--components' ? flags.components : flags.agents)?.length);
    const unknown = (label: string, values: string[] = [], valid: string[]) =>
        values.filter(value => !valid.includes(value)).map(value => `Unknown ${label}: ${value}. Valid: ${valid.join(', ')}`);
    return [
        ...missing.map(
            flag =>
                `Missing ${flag}. Without a terminal, pass every choice as a flag, e.g. --components transactions-overview --agent claude-code --yes`
        ),
        ...unknown('component', flags.components, components),
        ...unknown('assistant', flags.agents, Object.keys(AGENTS)),
    ];
};

const askMissing = async (flags: AddFlags, components: string[], root: string, prompter: ReturnType<typeof createPrompter>) => {
    if (!flags.components?.length) {
        flags.components = await prompter.pickMany('Which components does this app use?', componentChoices(components));
        if (!flags.components) return false;
    }
    if (!flags.agents?.length) {
        const detected = Object.keys(AGENTS).filter(agent => existsSync(join(root, AGENTS[agent]!.detect)));
        const choices = Object.keys(AGENTS).map(value => ({ value, label: detected.includes(value) ? `${value} (detected)` : value }));
        flags.agents = await prompter.pickMany('Which assistants should get the skill?', choices, detected);
    }
    return Boolean(flags.components && flags.agents);
};

export const add = async (args: string[], options: RunOptions) => {
    const flags = parseFlags(args);
    const components = shippedComponents(options.skillsRoot);
    const root = installRoot(args, options.cwd);
    const prompter = options.isTTY ? createPrompter(options) : undefined;
    try {
        if (prompter && !(await askMissing(flags, components, root, prompter))) {
            options.stderr.write('No answer, so nothing was installed.\n');
            return 1;
        }
        const errors = flagErrors(flags, components);
        if (errors.length) {
            options.stderr.write(errors.join('\n') + '\n');
            return 1;
        }

        const selected = flags.components!;
        const dirs = folderSet(flags.agents!);
        const count = `${selected.length} component${selected.length === 1 ? '' : 's'}`;
        const where = dirs.map(dir => displayPath(options.cwd, root, dir)).join(', ');
        if (prompter && !flags.yes && !(await prompter.confirm(`Install the skill for ${count} into ${where}?`))) {
            options.stdout.write('Nothing installed.\n');
            return 0;
        }
        for (const skill of listSkills(options.skillsRoot)) {
            for (const dir of dirs) {
                const target = join(root, dir, skill);
                const verb = existsSync(target) ? 'Replaced' : 'Installed';
                install(join(options.skillsRoot, skill), target, selected);
                options.stdout.write(`${verb} ${skill} (${count}) in ${displayPath(options.cwd, root, dir)}\n`);
            }
        }
        options.stdout.write('Commit the skill so your whole team gets it, then ask your assistant to migrate this project to v2.\n');
        return 0;
    } finally {
        prompter?.close();
    }
};

const FOLDERS = [...new Set(Object.values(AGENTS).flatMap(({ reads }) => reads))];

export const findInstalled = (root: string, skillsRoot: string) =>
    FOLDERS.flatMap(folder =>
        listSkills(skillsRoot)
            .map(skill => ({ folder: `${folder}/skills`, skill, dir: join(root, folder, 'skills', skill) }))
            .filter(({ dir }) => existsSync(join(dir, 'SKILL.md')))
    );

export const installRoot = (args: string[], cwd: string) => {
    const { dir } = parseFlags(args);
    return dir ? resolve(cwd, dir) : (findGitRoot(cwd) ?? cwd);
};

const VALUE_FLAGS = ['--components', '--agent', '--dir'];
const positionals = (args: string[]) => args.filter((arg, index) => !arg.startsWith('--') && !VALUE_FLAGS.includes(args[index - 1] ?? ''));

export const remove = (args: string[], options: RunOptions) => {
    const root = installRoot(args, options.cwd);
    const named = positionals(args).map(name => `${SKILL_PREFIX}${shortName(name)}`);
    const installed = findInstalled(root, options.skillsRoot).filter(({ skill }) => !named.length || named.includes(skill));
    const missing = named.filter(skill => !installed.some(copy => copy.skill === skill));
    if (missing.length || !installed.length) {
        options.stderr.write(`${missing.join(', ') || 'No Adyen skill'} isn't installed under ${root}.\n`);
        return 1;
    }
    for (const { folder, skill, dir } of installed) {
        rmSync(dir, { recursive: true, force: true });
        options.stdout.write(`Removed ${skill} from ${displayPath(options.cwd, root, folder)}\n`);
    }
    return 0;
};

export const sync = (args: string[], options: RunOptions) => {
    const root = installRoot(args, options.cwd);
    const installed = findInstalled(root, options.skillsRoot);
    if (!installed.length) {
        options.stderr.write(`No installed skills found under ${root}. Install one with: npx ${PACKAGE_NAME} skills add\n`);
        return 1;
    }
    for (const { folder, skill, dir } of installed) {
        const skillFile = join(dir, 'SKILL.md');
        const from = readField(skillFile, VERSION_FIELD);
        install(join(options.skillsRoot, skill), dir, readField(skillFile, COMPONENTS_FIELD).split(',').filter(Boolean));
        options.stdout.write(`Synced ${skill} in ${displayPath(options.cwd, root, folder)} (${from} → ${options.version})\n`);
    }
    return 0;
};
