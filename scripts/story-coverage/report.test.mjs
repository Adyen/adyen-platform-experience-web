import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { domainOf, formatMarkdown, readRuns, run, summarize } from './report.mjs';

const entry = (id, importPath, type = 'story') => [id, { id, importPath, type }];

const index = {
    v: 5,
    entries: Object.fromEntries([
        entry('mocked-transactions-overview--default', '../../domains/transactions/vue/stories/TransactionsOverview/mocked.stories.ts'),
        entry('mocked-transactions-overview--empty-list', '../../domains/transactions/vue/stories/TransactionsOverview/mocked.stories.ts'),
        entry('mocked-transactions-overview--error-list', '../../domains/transactions/vue/stories/TransactionsOverview/mocked.stories.ts'),
        entry('mocked-reports-overview--default', '../../domains/reports/vue/stories/ReportsOverview/mocked.stories.ts'),
        entry('api-transactions-overview--default', '../../domains/transactions/vue/stories/TransactionsOverview/api.stories.ts'),
        entry('sdk-metadata--default', '../../sdk/stories/metadata.stories.ts'),
        entry('mocked-transactions-overview--docs', '../../domains/transactions/vue/stories/TransactionsOverview/mocked.stories.ts', 'docs'),
    ]),
};

const allTestFiles = [
    'packages/domains/transactions/vue/tests/integration/TransactionsOverview/default.spec.ts',
    'packages/domains/reports/vue/tests/integration/ReportsOverview/default.spec.ts',
    'packages/sdk/tests/integration/metadata/default.spec.ts',
];

const visits = [
    { storyId: 'mocked-transactions-overview--default', outcome: 'expected', file: 'a.spec.ts' },
    { storyId: 'mocked-transactions-overview--default', outcome: 'unexpected', file: 'b.spec.ts' },
    { storyId: 'mocked-transactions-overview--empty-list', outcome: 'unexpected', file: 'c.spec.ts' },
    { storyId: 'mocked-transactions-overview--error-list', outcome: 'skipped', file: 'd.spec.ts' },
    { storyId: 'sdk-metadata--default', outcome: 'flaky', file: 'e.spec.ts' },
    { storyId: 'mocked-removed--story', outcome: 'expected', file: 'f.spec.ts' },
];

const fullRun = { testFiles: allTestFiles, visits };

test('domainOf attributes stories and specs to their owning domain or the SDK', () => {
    assert.equal(domainOf('../../domains/payByLink/vue/stories/PaymentLinkCreation/mocked.stories.ts'), 'payByLink');
    assert.equal(domainOf('packages/domains/capital/vue/tests/integration/CapitalOffer/default.spec.ts'), 'capital');
    assert.equal(domainOf('../../sdk/stories/metadata.stories.ts'), 'sdk');
    assert.equal(domainOf('packages/sdk/tests/integration/metadata/default.spec.ts'), 'sdk');
    assert.equal(domainOf('../../tools/storybook/stories/misc.stories.ts'), 'other');
});

test('summarize counts only in-scope stories with a passing visit as covered', () => {
    const summary = summarize(index, fullRun);

    assert.deepEqual(summary.totals, { stories: 5, covered: 2, failingOnly: 2, uncovered: 1 });
    assert.deepEqual(summary.domainsNotRun, []);
    assert.deepEqual(summary.domains, [
        { domain: 'reports', ran: true, stories: 1, covered: 0, failingOnly: [], uncovered: ['mocked-reports-overview--default'] },
        { domain: 'sdk', ran: true, stories: 1, covered: 1, failingOnly: [], uncovered: [] },
        {
            domain: 'transactions',
            ran: true,
            stories: 3,
            covered: 1,
            failingOnly: ['mocked-transactions-overview--empty-list', 'mocked-transactions-overview--error-list'],
            uncovered: [],
        },
    ]);
    assert.deepEqual(summary.unknownStories, ['mocked-removed--story']);
});

test('summarize excludes real-API stories and docs entries from the denominator', () => {
    const summary = summarize(index, {
        testFiles: allTestFiles,
        visits: [{ storyId: 'api-transactions-overview--default', outcome: 'expected', file: 'x.spec.ts' }],
    });

    assert.equal(summary.totals.stories, 5);
    assert.equal(summary.totals.covered, 0);
    assert.deepEqual(summary.unknownStories, []);
});

test('summarize marks domains without specs in the run as not run and leaves them out of the totals', () => {
    const summary = summarize(index, {
        testFiles: ['packages/domains/transactions/vue/tests/integration/TransactionsOverview/default.spec.ts'],
        visits: visits.filter(({ storyId }) => storyId.startsWith('mocked-transactions')),
    });

    assert.deepEqual(summary.totals, { stories: 3, covered: 1, failingOnly: 2, uncovered: 0 });
    assert.deepEqual(summary.domainsNotRun, ['reports', 'sdk']);
    assert.deepEqual(summary.domains[0], { domain: 'reports', ran: false, stories: 1, covered: 0, failingOnly: [], uncovered: [] });
});

test('formatMarkdown renders a per-domain table and lists stories without a passing test', () => {
    const markdown = formatMarkdown(summarize(index, fullRun));

    assert.match(markdown, /\| transactions \| 3 \| 1 \| 33\.3% \| 2 \| 0 \|/);
    assert.match(markdown, /\| \*\*Total\*\* \| \*\*5\*\* \| \*\*2\*\* \| \*\*40\.0%\*\* \| \*\*2\*\* \| \*\*1\*\* \|/);
    assert.match(markdown, /`mocked-reports-overview--default`/);
    assert.match(markdown, /`mocked-removed--story`/);
    assert.doesNotMatch(markdown, /not run/);
});

test('formatMarkdown shows unselected domains as not run instead of 0%', () => {
    const markdown = formatMarkdown(
        summarize(index, {
            testFiles: ['packages/domains/transactions/vue/tests/integration/TransactionsOverview/default.spec.ts'],
            visits: [visits[0]],
        })
    );

    assert.match(markdown, /\| reports \| 1 \| — \| not run \| — \| — \|/);
    assert.match(markdown, /Not in this run: reports, sdk\. Excluded from the total\./);
    assert.doesNotMatch(markdown, /mocked-reports-overview--default/);
});

test('readRuns merges every shard file in the input directory', () => {
    const dir = mkdtempSync(join(tmpdir(), 'story-coverage-'));
    writeFileSync(join(dir, 'visited-1-of-2.json'), JSON.stringify({ testFiles: [allTestFiles[0]], visits: [visits[0]] }));
    writeFileSync(join(dir, 'visited-2-of-2.json'), JSON.stringify({ testFiles: [allTestFiles[0], allTestFiles[2]], visits: [visits[4]] }));
    writeFileSync(join(dir, 'summary.json'), '{}');

    assert.deepEqual(readRuns(dir), { testFiles: [allTestFiles[0], allTestFiles[2]], visits: [visits[0], visits[4]] });
});

test('readRuns fails when no shard produced visit data', () => {
    const dir = mkdtempSync(join(tmpdir(), 'story-coverage-'));

    assert.throws(() => readRuns(dir), /No visited-\*\.json files/);
});

test('run writes the JSON summary and appends markdown to the step summary', () => {
    const dir = mkdtempSync(join(tmpdir(), 'story-coverage-'));
    const input = join(dir, 'input');
    mkdirSync(input);
    writeFileSync(join(input, 'visited.json'), JSON.stringify(fullRun));
    writeFileSync(join(dir, 'index.json'), JSON.stringify(index));
    const stepSummary = join(dir, 'step-summary.md');
    writeFileSync(stepSummary, 'previous\n');

    run(['--index', join(dir, 'index.json'), '--input', input, '--summary', stepSummary], () => {});

    assert.equal(JSON.parse(readFileSync(join(input, 'summary.json'), 'utf8')).totals.covered, 2);
    assert.match(readFileSync(stepSummary, 'utf8'), /^previous\n## Story coverage/);
});
