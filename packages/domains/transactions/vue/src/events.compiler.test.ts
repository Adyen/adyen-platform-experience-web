import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { compileScript, parse } from '@vue/compiler-sfc';
import { describe, expect, test } from 'vitest';

const ROOT_COMPONENTS = [
    './TransactionsOverview/components/TransactionsOverview/TransactionsOverview.vue',
    './TransactionDetails/components/TransactionDetailsContainer.vue',
] as const;

describe('Transactions public event declarations', () => {
    test.each(ROOT_COMPONENTS)('%s can be compiled by Vue', relativePath => {
        const url = new URL(relativePath, import.meta.url);
        const filename = fileURLToPath(url);
        const source = readFileSync(url, 'utf8');
        const { descriptor } = parse(source, { filename });

        expect(() =>
            compileScript(descriptor, {
                fs: {
                    fileExists: existsSync,
                    readFile: file => readFileSync(file, 'utf8'),
                },
                id: filename,
            })
        ).not.toThrow();
    });
});
