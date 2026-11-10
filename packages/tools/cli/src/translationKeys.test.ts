import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

const MAP = resolve(__dirname, '../skills/adyen-platform-experience-migrate-v2/references/translation-keys.tsv');
const CATALOG = resolve(__dirname, '../../../sdk/translations/en-US.json');
// Read as text: importing it would pull the browser-side core into this Node-only project.
const BENTO_ROUTING = resolve(__dirname, '../../../shared/core/src/vue/bentoTranslations.ts');
const DOMAINS = ['capital', 'disputes', 'payByLink', 'payouts', 'reports', 'transactions'];
const NO_MATCH = '(no match)';

const rows = readFileSync(MAP, 'utf8')
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
        const [v1Key = '', domain = '', v2Key = ''] = line.split('\t');
        return { v1Key, domain, v2Key };
    });

const catalog = new Set(Object.keys(JSON.parse(readFileSync(CATALOG, 'utf8'))));

// Shared-component (Bento) strings resolve through `<domain>.<domainKey>` overrides, which may have no catalog entry.
const routing = readFileSync(BENTO_ROUTING, 'utf8');
const domainKeys = [
    ...[...routing.matchAll(/\[\s*'bento\.[^']+',\s*'([^']+)'\s*\]/g)].map(match => match[1]!),
    ...[...routing.matchAll(/domainKey:\s*'([^']+)'/g)].map(match => match[1]!),
];
const routedKeys = new Set(domainKeys.flatMap(domainKey => DOMAINS.map(domain => `${domain}.${domainKey}`)));

const lookUp = (v1Key: string) => Object.fromEntries(rows.filter(row => row.v1Key === v1Key).map(row => [row.domain, row.v2Key]));

describe('translation-keys.tsv', () => {
    test('reads the shared-component routing table', () => {
        expect(domainKeys).toEqual(expect.arrayContaining(['common.errors.noResults', 'common.close.label', 'overview.pagination.a11yLabel']));
    });

    test('maps every v1 key to a key the v2 runtime reads, or marks it as having no match', () => {
        const invalid = rows.filter(({ domain, v2Key }) =>
            v2Key === NO_MATCH ? domain !== '-' : !(catalog.has(v2Key) || routedKeys.has(v2Key)) || !v2Key.startsWith(`${domain}.`)
        );

        expect(invalid).toEqual([]);
    });

    test('lists only v1 keys that changed', () => {
        expect(rows.filter(({ v1Key }) => catalog.has(v1Key))).toEqual([]);
    });

    test.each([
        ['common.actions.copy.labels.done', { transactions: 'transactions.common.copy.done', payouts: 'payouts.common.copy.done' }],
        ['common.errors.updateFilters', { transactions: 'transactions.common.errors.updateFilters' }],
        ['transactions.overview.list.fields.netAmount', { transactions: 'transactions.overview.list.netAmount' }],
        ['disputes.overview.common.fields.respondBy', { disputes: 'disputes.overview.fields.respondBy' }],
        ['payByLink.overview.list.fields.id', { payByLink: 'payByLink.overview.list.id' }],
        ['common.actions.contactSupport.labels.default', { '-': NO_MATCH }],
    ])('maps %s', (v1Key, expected) => {
        expect(lookUp(v1Key)).toMatchObject(expected);
    });
});
