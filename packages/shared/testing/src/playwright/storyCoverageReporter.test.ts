import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import type { FullConfig, Suite, TestCase } from '@playwright/test/reporter';
import StoryCoverageReporter, { collectStoryRun } from './storyCoverageReporter';
import { STORY_ANNOTATION } from './storyCoverage';

type FakeTest = {
    file: string;
    outcome: ReturnType<TestCase['outcome']>;
    project?: string;
    annotations?: TestCase['annotations'];
    resultAnnotations?: TestCase['annotations'][];
};

const fakeTest = ({ file, outcome, project = 'local-chrome', annotations = [], resultAnnotations = [] }: FakeTest) =>
    ({
        annotations,
        location: { file, line: 1, column: 1 },
        outcome: () => outcome,
        parent: { project: () => ({ name: project }) },
        results: resultAnnotations.map(annotations => ({ annotations })),
    }) as unknown as TestCase;

const story = (description: string) => ({ type: STORY_ANNOTATION, description });

describe('collectStoryRun', () => {
    test('records one visit per story and test, using the final test outcome', () => {
        const tests = [
            fakeTest({
                file: '/repo/packages/domains/transactions/vue/tests/integration/default.spec.ts',
                outcome: 'flaky',
                resultAnnotations: [[story('mocked-a--default')], [story('mocked-a--default'), story('mocked-a--other')]],
            }),
            fakeTest({
                file: '/repo/packages/sdk/tests/integration/metadata/default.spec.ts',
                outcome: 'unexpected',
                annotations: [story('sdk-metadata--default'), { type: 'issue', description: 'unrelated' }],
            }),
        ];

        expect(collectStoryRun(tests, '/repo').visits).toEqual([
            { storyId: 'mocked-a--default', outcome: 'flaky', file: 'packages/domains/transactions/vue/tests/integration/default.spec.ts' },
            { storyId: 'mocked-a--other', outcome: 'flaky', file: 'packages/domains/transactions/vue/tests/integration/default.spec.ts' },
            { storyId: 'sdk-metadata--default', outcome: 'unexpected', file: 'packages/sdk/tests/integration/metadata/default.spec.ts' },
        ]);
    });

    test('lists every spec file in the run once, including specs that opened no story', () => {
        const tests = [
            fakeTest({ file: '/repo/packages/domains/reports/vue/tests/integration/a.spec.ts', outcome: 'expected', annotations: [story('x')] }),
            fakeTest({ file: '/repo/packages/domains/reports/vue/tests/integration/a.spec.ts', outcome: 'skipped' }),
            fakeTest({ file: '/repo/packages/domains/payouts/vue/tests/integration/b.spec.ts', outcome: 'expected' }),
        ];

        expect(collectStoryRun(tests, '/repo').testFiles).toEqual([
            'packages/domains/payouts/vue/tests/integration/b.spec.ts',
            'packages/domains/reports/vue/tests/integration/a.spec.ts',
        ]);
    });

    test('returns no visits for runs that never opened a story', () => {
        const tests = [fakeTest({ file: '/repo/packages/domains/x/domain/tests/contract/a.spec.ts', outcome: 'expected' })];

        expect(collectStoryRun(tests, '/repo').visits).toEqual([]);
    });
});

describe('StoryCoverageReporter', () => {
    let rootDir: string;

    beforeEach(() => {
        rootDir = mkdtempSync(join(tmpdir(), 'story-coverage-reporter-'));
    });

    afterEach(() => {
        rmSync(rootDir, { recursive: true, force: true });
    });

    const runReporter = (tests: TestCase[], shard: FullConfig['shard'] = { current: 2, total: 3 }) => {
        const reporter = new StoryCoverageReporter({ projects: ['local-chrome'] });
        const config = { configFile: join(rootDir, 'playwright.config.ts'), shard } as FullConfig;
        reporter.onBegin(config, { allTests: () => tests } as Suite);
        reporter.onEnd();
    };

    const outputFile = (name = 'visited-2-of-3.json') => join(rootDir, 'story-coverage', name);

    test('writes the shard file for an integration run that opened no story, so its spec files still count', () => {
        runReporter([fakeTest({ file: join(rootDir, 'packages/domains/reports/vue/tests/integration/a.spec.ts'), outcome: 'skipped' })]);

        expect(JSON.parse(readFileSync(outputFile(), 'utf8'))).toEqual({
            testFiles: ['packages/domains/reports/vue/tests/integration/a.spec.ts'],
            visits: [],
        });
    });

    test('ignores tests from projects outside the configured list', () => {
        runReporter([
            fakeTest({
                file: join(rootDir, 'packages/domains/reports/vue/tests/integration/a.spec.ts'),
                outcome: 'expected',
                annotations: [story('x')],
            }),
            fakeTest({ file: join(rootDir, 'packages/domains/reports/domain/tests/contract/b.spec.ts'), outcome: 'expected', project: 'contract' }),
        ]);

        expect(JSON.parse(readFileSync(outputFile(), 'utf8')).testFiles).toEqual(['packages/domains/reports/vue/tests/integration/a.spec.ts']);
    });

    test('does not write or overwrite results for runs with only other projects (e.g. contract)', () => {
        runReporter(
            [fakeTest({ file: join(rootDir, 'packages/domains/reports/domain/tests/contract/b.spec.ts'), outcome: 'expected', project: 'contract' })],
            null
        );

        expect(existsSync(outputFile('visited.json'))).toBe(false);
    });
});
