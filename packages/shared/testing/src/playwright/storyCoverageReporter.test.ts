import { describe, expect, test } from 'vitest';
import type { TestCase } from '@playwright/test/reporter';
import { collectStoryRun } from './storyCoverageReporter';
import { STORY_ANNOTATION } from './storyCoverage';

type FakeTest = {
    file: string;
    outcome: ReturnType<TestCase['outcome']>;
    annotations?: TestCase['annotations'];
    resultAnnotations?: TestCase['annotations'][];
};

const fakeTest = ({ file, outcome, annotations = [], resultAnnotations = [] }: FakeTest) =>
    ({
        annotations,
        location: { file, line: 1, column: 1 },
        outcome: () => outcome,
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
