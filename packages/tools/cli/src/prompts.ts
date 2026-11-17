import { createInterface } from 'node:readline';
import type { RunOptions } from './skills';

export interface Choice {
    group?: string;
    value: string;
    label?: string;
}

export const createPrompter = ({ stdin, stdout }: Pick<RunOptions, 'stdin' | 'stdout'>) => {
    const reader = stdin ? createInterface({ input: stdin, terminal: false }) : undefined;
    const lines = reader?.[Symbol.asyncIterator]();
    const ask = async (question: string) => {
        stdout.write(question);
        const line = await lines?.next();
        return !line || line.done ? undefined : String(line.value).trim();
    };

    const pickMany = async (title: string, choices: Choice[], defaults: string[] = []) => {
        const groups = [...new Set(choices.map(choice => choice.group ?? ''))];
        stdout.write(`${title}\n`);
        for (const group of groups) {
            if (group) stdout.write(`  ${group}\n`);
            choices.forEach((choice, index) => {
                if ((choice.group ?? '') === group) stdout.write(`${group ? '    ' : '  '}${index + 1}. ${choice.label ?? choice.value}\n`);
            });
        }
        const hint = defaults.length
            ? `Enter for ${defaults.join(', ')}`
            : groups.some(Boolean)
              ? 'e.g. 1,3, a group name, or all'
              : 'e.g. 1,3, or all';
        for (;;) {
            const answer = await ask(`Choose (${hint}): `);
            if (answer === undefined) return undefined;
            if (!answer && defaults.length) return defaults;
            const tokens = answer
                .split(',')
                .map(token => token.trim())
                .filter(Boolean);
            const matches = (token: string) =>
                token.toLowerCase() === 'all'
                    ? choices
                    : choices.filter((choice, index) => String(index + 1) === token || choice.group?.toLowerCase() === token.toLowerCase());
            const invalid = tokens.filter(token => !matches(token).length);
            if (tokens.length && !invalid.length) return [...new Set(tokens.flatMap(token => matches(token).map(choice => choice.value)))];
            stdout.write(`${invalid.join(', ') || 'That'} isn't one of the options.\n`);
        }
    };

    const confirm = async (question: string) => {
        const answer = await ask(`${question} [Y/n] `);
        return answer !== undefined && !/^n/i.test(answer);
    };

    return { pickMany, confirm, close: () => reader?.close() };
};
