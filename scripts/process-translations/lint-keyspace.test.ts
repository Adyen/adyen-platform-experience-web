/**
 * @vitest-environment node
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { expect, test } from 'vitest';
import { runProcessTranslationsScript } from './testing/testProject';

// The lint takes a mirrored domains tree as its optional argument, so these
// tests lint fixture trees instead of the live catalogs.

const writeCatalog = (root: string, domain: string, translations: Record<string, string>): void => {
    const filePath = join(root, domain, 'vue/translations/en-US.json');
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, `${JSON.stringify(translations, null, 4)}\n`);
};

const runLint = (root: string) => runProcessTranslationsScript('lint-keyspace.mjs', [root]);

test('a domain catalog that follows the grammar passes', () => {
    const root = mkdtempSync(join(tmpdir(), 'lint-keyspace-'));
    try {
        writeCatalog(root, 'alpha', {
            'alpha.greeting.title': 'Hello',
            'alpha.common.copy.label': 'Copy',
            'alpha.overview.filters.date.lastMonth': 'Last month',
            // Six segments is the limit, not a violation.
            'alpha.overview.filters.paymentReference.errors.invalidLength': 'Too long',
            // A role word may head a subtree when everything under it is a role.
            'alpha.creation.description.label': 'Description',
            'alpha.creation.description.supportText': 'Describe the product',
            // A declared enum mirror keeps the identifier's own casing.
            'alpha.common.filters.formats.DD-MM-YYYY': 'DD-MM-YYYY',
        });
        // A domain directory without catalogs must not fail the run.
        mkdirSync(join(root, 'beta', 'vue'), { recursive: true });

        const result = runLint(root);

        expect(result.stderr).toBe('');
        expect(result.status).toBe(0);
        expect(result.stdout).toContain('keyspace lint passed: no grammar violations across 1 domain catalogs');
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});

test('a per-key grammar violation fails with its rule and the offending key', () => {
    const root = mkdtempSync(join(tmpdir(), 'lint-keyspace-'));
    try {
        writeCatalog(root, 'alpha', {
            'alpha.greeting.title': 'Hello',
            'alpha.overview.filters.date.rangeSelect.options.lastMonth': 'Last month',
            'alpha.common.copy.ariaLabel': 'Copy',
            'alpha.common.alert.urlChange': 'The URL changed',
            'alpha.overview.fields': 'Fields',
            'alpha.overview.label.lastMonth': 'Last month',
            'alpha.overview.Filters.date': 'Date',
            'alpha.overview.tabsA11yLabel': 'Tabs',
            'alpha.overview.amountErrors.negative': 'Must be positive',
        });

        const result = runLint(root);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('[depth] alpha.overview.filters.date.rangeSelect.options.lastMonth');
        expect(result.stderr).toContain('[a11y] alpha.common.copy.ariaLabel');
        expect(result.stderr).toContain('[group-plural] alpha.common.alert.urlChange');
        expect(result.stderr).toContain('[group-leaf] alpha.overview.fields');
        expect(result.stderr).toContain('[role-leaf] alpha.overview.label.lastMonth');
        expect(result.stderr).toContain('[casing] alpha.overview.Filters.date');
        expect(result.stderr).toContain('[folded-role] alpha.overview.tabsA11yLabel');
        expect(result.stderr).toContain('[folded-group] alpha.overview.amountErrors.negative');
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});

test('a keyspace-wide violation fails even though every key passes on its own', () => {
    const root = mkdtempSync(join(tmpdir(), 'lint-keyspace-'));
    try {
        writeCatalog(root, 'alpha', {
            // A key that is also the base path of another cannot be addressed
            // unambiguously, and it hides its children from the reachability report.
            'alpha.common.fields.amount': 'Amount',
            'alpha.common.fields.amount.description': 'The amount charged',
            // The suffix is discriminating against a sibling, which is a segment's job.
            'alpha.overview.tags.incoming': 'Incoming',
            'alpha.overview.tags.incomingDescription': 'Money received',
            // `Information` restates the `info` role under a longer name, so the
            // fix it names is the role word rather than the lowercased suffix.
            'alpha.details.adjustments.surcharge': 'Surcharge amount',
            'alpha.details.adjustments.surchargeInformation': 'Credited to another account',
            // The same suffix ends a genuine content name, and with no sibling
            // sharing its base there is nothing for it to discriminate against.
            'alpha.details.types.requestForInformation': 'Request for information',
        });

        const result = runLint(root);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('[prefix-collision] alpha.common.fields.amount');
        expect(result.stderr).toContain('[sibling-suffix] alpha.overview.tags.incomingDescription');
        expect(result.stderr).toContain('use the segment `surcharge.info` instead');
        expect(result.stderr).not.toContain('requestForInformation');
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});
